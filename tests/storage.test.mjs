import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { docker, image, migrate as migrateOwned, root, sql, waitReady } from '../scripts/database.mjs';

// Retain this suite's original 006 Workspace schema snapshot. SP-02 suites exercise 007/008.
const migrate=(container,service,direction='up')=>migrateOwned(container,service,direction,service==='workspace'?{through:'006'}:{});

const id = number => `00000000-0000-4000-8000-${number.toString(16).padStart(12, '0')}`;
const q = number => `'${id(number)}'`;
const container = `kms-store-test-${randomUUID()}`;
const passwords = {
  POSTGRES_PASSWORD: randomBytes(32).toString('hex'),
  WORKSPACE_DB_PASSWORD: randomBytes(32).toString('hex'),
  KNOWLEDGE_DB_PASSWORD: randomBytes(32).toString('hex'),
};

test('ADR-0004 real PostgreSQL storage boundary', { timeout: 300000 }, async t => {
  let started = false;
  const run = (service, input, allowFailure = false) => sql(container, service, input, {
    runtime: true, password: passwords[`${service.toUpperCase()}_DB_PASSWORD`], allowFailure,
  });
  const value = (input, service = 'knowledge') => run(service, input).stdout.trim();
  const rejects = (input, code, service = 'knowledge') => {
    const result = run(service, input, true);
    assert.notEqual(result.status, 0, 'Statement unexpectedly succeeded');
    assert.match(result.stderr, new RegExp(code));
  };
  const exact = (documents = [11], project = 1, config = 41, vector = '[1,0,0]', limit = 5) =>
    `SELECT document_id FROM knowledge.exact_search(${q(project)}, ARRAY[${documents.map(q)}]::uuid[], ${q(config)}, '${vector}', ${limit});`;
  try {
    docker(['run', '-d', '--rm', '--name', container,
      '-e', 'POSTGRES_PASSWORD', '-e', 'WORKSPACE_DB_PASSWORD', '-e', 'KNOWLEDGE_DB_PASSWORD',
      '-e', 'POSTGRES_INITDB_ARGS=--auth-host=scram-sha-256',
      '-v', `${resolve(root, 'infra/postgres/bootstrap.sh')}:/docker-entrypoint-initdb.d/10-bootstrap.sh:ro`,
      '-v', `${resolve(root, 'infra/postgres/bootstrap.sql')}:/bootstrap.sql:ro`, image],
    { env: passwords, timeout: 180000 });
    started = true;
    await waitReady(container);

    await t.test('owned migrations apply, repeat safely, and detect checksum drift', () => {
      for (const service of ['workspace', 'knowledge']) {
        migrate(container, service);
        migrate(container, service);
        assert.equal(sql(container, service, 'SELECT count(*) FROM _migrations.applied;').stdout.trim(), service === 'workspace' ? '6' : '3');
      }
      sql(container, 'knowledge', "UPDATE _migrations.applied SET checksum = 'modified';");
      assert.throws(() => migrate(container, 'knowledge'), /checksum mismatch/);
      // Rolling back must reject drift too, without touching application data.
      assert.throws(() => migrate(container, 'knowledge', 'down'), /checksum mismatch/);
      sql(container, 'knowledge', 'DROP SCHEMA knowledge CASCADE; DELETE FROM _migrations.applied;');
      migrate(container, 'knowledge');
    });

    await t.test('runtime credentials cannot connect to the other database or administer schemas', () => {
      for (const [service, other] of [['workspace', 'knowledge'], ['knowledge', 'workspace']]) {
        const result = docker(['exec', '-i', '-e', 'PGPASSWORD', container, 'psql', '-X', '-h', '127.0.0.1',
          '-U', `${service}_app`, '-d', `${other}_db`, '-c', 'SELECT 1;'],
        { env: { PGPASSWORD: passwords[`${service.toUpperCase()}_DB_PASSWORD`] }, allowFailure: true });
        assert.notEqual(result.status, 0);
        assert.match(result.stderr, /permission denied for database/);
        rejects(`SET ROLE ${service}_owner;`, '42501', service);
        rejects('CREATE SCHEMA unauthorized;', '42501', service);
        rejects('SELECT * FROM _migrations.applied;', '42501', service);
      }
      assert.equal(value("SELECT count(*) FROM pg_extension WHERE extname='vector';", 'workspace'), '0');
      assert.equal(value("SELECT extversion FROM pg_extension WHERE extname='vector';"), '0.8.2');
      console.log('Storage engine:', value('SHOW server_version;'), 'pgvector: 0.8.2');
    });

    await t.test('operational uniqueness and project foreign keys reject invalid persisted state', () => {
      run('workspace', `
        BEGIN;
        INSERT INTO workspace.project(project_id, name) VALUES (${q(1)}, 'Synthetic A'), (${q(2)}, 'Synthetic B');
        INSERT INTO workspace.sprint(sprint_id, project_id, goal, start_date, end_date, state)
          VALUES (${q(101)}, ${q(1)}, 'Pilot', '2026-10-01', '2026-10-15', 'active'),
                 (${q(102)}, ${q(1)}, 'Next', '2026-10-16', '2026-10-30', 'planned');
        INSERT INTO workspace.task(task_id, project_id, type, title, state)
          VALUES (${q(103)}, ${q(1)}, 'task', 'Synthetic task', 'todo');
        INSERT INTO workspace.sprint_allocation(project_id, sprint_id, task_id, allocation_state)
          VALUES (${q(1)}, ${q(101)}, ${q(103)}, 'allocated');
        UPDATE workspace.task SET location_kind='sprint', location_sprint_id=${q(101)}, revision=2 WHERE task_id=${q(103)};
        INSERT INTO workspace.blocker_event(event_id, task_id, status, description, actor_id, sequence)
          VALUES (${q(104)}, ${q(103)}, 'open', 'Waiting', ${q(3)}, 1);
        COMMIT;
      `);
      rejects(`UPDATE workspace.sprint SET state='active' WHERE sprint_id=${q(102)};`, '23505', 'workspace');
      rejects(`INSERT INTO workspace.sprint_allocation VALUES (${q(1)}, ${q(102)}, ${q(103)}, 'allocated', 1);`, '23505', 'workspace');
      rejects(`INSERT INTO workspace.sprint_allocation VALUES (${q(2)}, ${q(102)}, ${q(103)}, 'allocated', 1);`, '23503|23505', 'workspace');
      rejects(`INSERT INTO workspace.blocker_event(event_id, task_id, status, description, actor_id, sequence)
        VALUES (${q(105)}, ${q(103)}, 'resolved', 'Done', ${q(3)}, 1);`, '23505', 'workspace');
      rejects('UPDATE workspace.blocker_event SET description=\'rewrite\';', '42501', 'workspace');
    });

    await t.test('current location survives completion, reopen, Done in Backlog and later allocation', () => {
      run('workspace', `BEGIN;
        UPDATE workspace.task SET state='done', location_kind='completed', revision=revision+1 WHERE task_id=${q(103)};
        UPDATE workspace.sprint_allocation SET allocation_state='completed', revision=revision+1 WHERE task_id=${q(103)};
        UPDATE workspace.sprint SET state='completed', revision=revision+1 WHERE sprint_id=${q(101)};
        COMMIT;`);
      assert.equal(value(`SELECT location_kind FROM workspace.task WHERE task_id=${q(103)};`, 'workspace'), 'completed');
      const before = BigInt(value(`SELECT backlog_revision FROM workspace.project WHERE project_id=${q(1)};`, 'workspace'));
      run('workspace', `BEGIN;
        UPDATE workspace.task SET state='todo', location_kind='backlog', location_sprint_id=NULL, revision=revision+1 WHERE task_id=${q(103)};
        COMMIT;
        UPDATE workspace.task SET state='done', revision=revision+1 WHERE task_id=${q(103)};`);
      assert.equal(value(`SELECT location_kind || ':' || state FROM workspace.task WHERE task_id=${q(103)};`, 'workspace'), 'backlog:done');
      assert.equal(value(`SELECT allocation_state FROM workspace.sprint_allocation WHERE sprint_id=${q(101)} AND task_id=${q(103)};`, 'workspace'), 'completed');
      assert.equal(BigInt(value(`SELECT backlog_revision FROM workspace.project WHERE project_id=${q(1)};`, 'workspace')), before + 1n);
      rejects(`UPDATE workspace.task SET location_kind='sprint', location_sprint_id=${q(102)} WHERE task_id=${q(103)};`, '23503|23514', 'workspace');
      rejects(`UPDATE workspace.sprint_allocation SET allocation_state='returned' WHERE sprint_id=${q(101)} AND task_id=${q(103)};`, '23514', 'workspace');
      run('workspace', `BEGIN;
        INSERT INTO workspace.sprint_allocation VALUES (${q(1)},${q(102)},${q(103)},'allocated',1);
        UPDATE workspace.task SET location_kind='sprint', location_sprint_id=${q(102)}, revision=revision+1 WHERE task_id=${q(103)};
        ROLLBACK;`);
      assert.equal(value(`SELECT location_kind FROM workspace.task WHERE task_id=${q(103)};`, 'workspace'), 'backlog');
      run('workspace', `BEGIN;
        INSERT INTO workspace.sprint_allocation VALUES (${q(1)},${q(102)},${q(103)},'allocated',1);
        UPDATE workspace.task SET location_kind='sprint', location_sprint_id=${q(102)}, revision=revision+1 WHERE task_id=${q(103)};
        COMMIT;`);
      assert.equal(value(`SELECT count(*) FROM workspace.sprint_allocation WHERE task_id=${q(103)};`, 'workspace'), '2');
      rejects(`UPDATE workspace.task SET location_sprint_id=${q(101)} WHERE task_id=${q(103)};`, '23514', 'workspace');
      rejects(`UPDATE workspace.sprint SET state='completed' WHERE sprint_id=${q(102)};`, '23514', 'workspace');
    });

    await t.test('Backlog generation tracks set/order, not unrelated task content; rollback restores generation', () => {
      run('workspace', `INSERT INTO workspace.task(task_id,project_id,type,title,state,backlog_position)
        VALUES (${q(501)},${q(1)},'task','First','todo',1),(${q(502)},${q(1)},'task','Second','todo',2);`);
      const revision = () => BigInt(value(`SELECT backlog_revision FROM workspace.project WHERE project_id=${q(1)};`, 'workspace'));
      const old = revision();
      run('workspace', `UPDATE workspace.task SET title='Edited', revision=revision+1 WHERE task_id=${q(501)};`);
      assert.equal(revision(), old);
      run('workspace', `BEGIN; SELECT 1 FROM workspace.project WHERE project_id=${q(1)} FOR UPDATE;
        UPDATE workspace.task SET backlog_position=3,revision=revision+1 WHERE task_id=${q(501)}; ROLLBACK;`);
      assert.equal(revision(), old);
      run('workspace', `BEGIN; SELECT 1 FROM workspace.project WHERE project_id=${q(1)} FOR UPDATE;
        UPDATE workspace.task SET backlog_position=3,revision=revision+1 WHERE task_id=${q(501)}; COMMIT;`);
      assert.equal(revision(), old+1n);
      assert.equal(value(`SELECT string_agg(title,',' ORDER BY backlog_position,task_id) FROM workspace.task WHERE project_id=${q(1)} AND location_kind='backlog';`, 'workspace'), 'Second,Edited');
      // SQL comparison proves the persisted generation is stale; no HTTP reorder handler exists yet.
      assert.equal(value(`SELECT backlog_revision=${old} FROM workspace.project WHERE project_id=${q(1)};`, 'workspace'), 'f');
    });

    await t.test('synthetic corpus and configurable embeddings persist with exact citation identities', () => {
      let seed = `BEGIN;
        INSERT INTO knowledge.embedding_configuration VALUES (${q(41)}, 'synthetic', 'fixture-v1', 3, 'cosine'),
          (${q(42)}, 'synthetic', 'fixture-v2', 4, 'l2'), (${q(43)}, 'synthetic', 'fixture-v3', 3, 'inner_product');`;
      for (const n of [11, 12, 13, 15, 16]) {
        seed += `
          INSERT INTO knowledge.document(document_id, project_id, kind, title, owner_id, current_version_id)
            VALUES (${q(n)}, ${q(n === 13 ? 2 : 1)}, 'decision', 'Synthetic JWT decision', ${q(3)}, ${q(n + 10)});
          INSERT INTO knowledge.document_version(document_id, version_id, state, immutable_content)
            VALUES (${q(n)}, ${q(n + 10)}, 'current', 'JWT synthetic evidence');
          INSERT INTO knowledge.passage VALUES (${q(n)}, ${q(n + 10)}, ${q(n + 20)}, 'paragraph:1', 'JWT synthetic evidence');
          INSERT INTO knowledge.search_job VALUES (${q(n + 40)}, ${q(n)}, ${q(n + 10)}, ${q(41)}, 1, 1, 'pending', false);
          INSERT INTO knowledge.passage_embedding VALUES (${q(n)}, ${q(n + 10)}, ${q(n + 20)}, ${q(41)}, 3, ${q(n + 40)}, '${n === 11 ? '[0.8,0.2,0]' : '[1,0,0]'}');
          UPDATE knowledge.search_job SET readiness='ready' WHERE job_id=${q(n + 40)};`;
      }
      seed += `
        INSERT INTO knowledge.document(document_id, project_id, kind, title, owner_id)
          VALUES (${q(14)}, ${q(1)}, 'document', 'Synthetic historical source', ${q(3)});
        INSERT INTO knowledge.document_version(document_id, version_id, state, immutable_content)
          VALUES (${q(14)}, ${q(24)}, 'superseded', 'JWT historical evidence');
        INSERT INTO knowledge.passage VALUES (${q(14)}, ${q(24)}, ${q(34)}, 'paragraph:1', 'JWT historical evidence');
        UPDATE knowledge.document_version SET state='archived', revision=2 WHERE document_id=${q(15)};
        UPDATE knowledge.document SET current_version_id=NULL, revision=2 WHERE document_id=${q(15)};
        UPDATE knowledge.document SET unavailable=true, revision=2 WHERE document_id=${q(16)};
        COMMIT;`;
      run('knowledge', seed);
      rejects(`INSERT INTO knowledge.passage VALUES (${q(11)}, ${q(22)}, ${q(99)}, 'paragraph:2', 'Wrong version');`, '23503');
      rejects(`UPDATE knowledge.passage SET immutable_excerpt='rewritten';`, '42501');
      rejects(`UPDATE knowledge.document_version SET immutable_content='rewritten';`, '42501');
      rejects('TRUNCATE knowledge.passage CASCADE;', '42501');
      rejects(`DELETE FROM knowledge.document_version WHERE document_id=${q(11)};`, '42501');
      rejects(`BEGIN; UPDATE knowledge.document SET current_version_id=${q(22)}, revision=2 WHERE document_id=${q(11)}; COMMIT;`, '23503|23514');
    });

    await t.test('exact and keyword searches filter project AND document scope before ranking', () => {
      assert.equal(value(exact([11, 13, 14, 15, 16])), id(11));
      // Better-scoring excluded documents must not consume a top-one candidate slot.
      assert.equal(value(exact([11, 13, 14, 15, 16], 1, 41, '[1,0,0]', 1)), id(11));
      assert.equal(value(exact([12])), id(12));
      assert.equal(value(exact([11], 2)), '');
      assert.equal(value(exact([])), '');
      assert.equal(value(`SELECT * FROM knowledge.exact_search(${q(1)}, NULL, ${q(41)}, '[1,0,0]', 5);`), '');
      assert.equal(value(`SELECT document_id FROM knowledge.keyword_search(${q(1)}, ARRAY[${[11,13,14,15,16].map(q)}]::uuid[], 'JWT', 5);`), id(11));
      assert.equal(value(`SELECT * FROM knowledge.keyword_search(${q(1)}, NULL, 'JWT', 5);`), '');
      assert.equal(value(exact([11], 1, 43)), '');
      rejects(exact([11], 1, 41, '[1,0]'), '22023');
      rejects(exact([11], 1, 41, '[0,0,0]'), '22023');
      rejects(`UPDATE knowledge.passage_embedding SET embedding='[1,0]' WHERE document_id=${q(11)};`, '23514');
      rejects(`UPDATE knowledge.passage_embedding SET dimensions=4, embedding='[1,0,0,0]' WHERE document_id=${q(11)};`, '23503');
      assert.equal(value("SELECT count(*) FROM pg_indexes WHERE schemaname='knowledge' AND (indexdef ILIKE '%hnsw%' OR indexdef ILIKE '%ivfflat%');"), '0');
    });

    await t.test('permission-scope refresh excludes revoked candidates without a copied ACL or answer cache', () => {
      assert.equal(value(exact([11, 12])).split('\n')[0], id(12));
      assert.equal(value(exact([11])), id(11));
      assert.equal(value(exact([])), '');
      // This boundary is the database query supplied with a fresh authoritative scope.
      // Actual Workspace grant/revoke and transport guards are not implemented here.
    });

    await t.test('immediate revision preserves old evidence, excludes stale vectors, and allows keyword fallback', () => {
      run('knowledge', `BEGIN;
        UPDATE knowledge.document_version SET state='superseded', revision=2 WHERE document_id=${q(11)} AND version_id=${q(21)};
        INSERT INTO knowledge.document_version(document_id, version_id, state, immutable_content)
          VALUES (${q(11)}, ${q(121)}, 'current', 'JWT replacement evidence');
        INSERT INTO knowledge.passage VALUES (${q(11)}, ${q(121)}, ${q(131)}, 'paragraph:1', 'JWT replacement evidence');
        UPDATE knowledge.document SET current_version_id=${q(121)}, revision=2, processing_generation=2 WHERE document_id=${q(11)};
        COMMIT;`);
      assert.equal(value(exact()), '');
      assert.equal(value(`SELECT version_id FROM knowledge.keyword_search(${q(1)}, ARRAY[${q(11)}]::uuid[], 'JWT', 5);`), id(121));
      assert.equal(value(`SELECT immutable_excerpt FROM knowledge.passage WHERE document_id=${q(11)} AND version_id=${q(21)} AND passage_id=${q(31)};`), 'JWT synthetic evidence');
      rejects(`UPDATE knowledge.search_job SET readiness='ready' WHERE job_id=${q(51)};`, '23514');
      rejects(`UPDATE knowledge.passage_embedding SET embedding='[0,1,0]' WHERE document_id=${q(11)};`, '23514');
      run('knowledge', `INSERT INTO knowledge.search_job VALUES (${q(151)}, ${q(11)}, ${q(121)}, ${q(41)}, 2, 2, 'pending', false);
        INSERT INTO knowledge.passage_embedding VALUES (${q(11)}, ${q(121)}, ${q(131)}, ${q(41)}, 3, ${q(151)}, '[1,0,0]');`);
      assert.equal(value(exact()), '');
      run('knowledge', `UPDATE knowledge.search_job SET readiness='failed' WHERE job_id=${q(151)};
        UPDATE knowledge.search_job SET readiness='ready' WHERE job_id=${q(151)};`);
      assert.equal(value(exact()), id(11));
      rejects(`INSERT INTO knowledge.search_job VALUES (${q(152)}, ${q(11)}, ${q(121)}, ${q(41)}, 2, 2, 'pending', false);`, '23505');
    });

    await t.test('second revision is atomic and old exact locators remain unchanged without Draft', () => {
      rejects(`INSERT INTO knowledge.document_version(document_id, version_id, state, immutable_content)
        VALUES (${q(11)}, ${q(221)}, 'draft', 'Unpublished');`, '23514');
      rejects(`BEGIN;
        UPDATE knowledge.document_version SET state='superseded', revision=2 WHERE document_id=${q(11)} AND version_id=${q(121)};
        INSERT INTO knowledge.document_version(document_id, version_id, state, immutable_content)
          VALUES (${q(11)}, ${q(221)}, 'current', 'JWT second revision');
        COMMIT;`, '23514');
      assert.equal(value(`SELECT current_version_id FROM knowledge.document WHERE document_id=${q(11)};`), id(121));
      run('knowledge', `BEGIN;
        UPDATE knowledge.document_version SET state='superseded', revision=2 WHERE document_id=${q(11)} AND version_id=${q(121)};
        INSERT INTO knowledge.document_version(document_id, version_id, state, immutable_content)
          VALUES (${q(11)}, ${q(221)}, 'current', 'JWT second revision');
        INSERT INTO knowledge.passage VALUES (${q(11)}, ${q(221)}, ${q(231)}, 'paragraph:1', 'JWT second revision');
        UPDATE knowledge.document SET current_version_id=${q(221)}, revision=3, processing_generation=3 WHERE document_id=${q(11)};
        COMMIT;`);
      assert.equal(value(`SELECT version_id FROM knowledge.keyword_search(${q(1)}, ARRAY[${q(11)}]::uuid[], 'JWT', 5);`), id(221));
      assert.equal(value(`SELECT state FROM knowledge.document_version WHERE document_id=${q(11)} AND version_id=${q(21)};`), 'superseded');
      assert.equal(value(`SELECT immutable_excerpt FROM knowledge.passage WHERE document_id=${q(11)} AND version_id=${q(21)} AND passage_id=${q(31)};`), 'JWT synthetic evidence');
      assert.equal(value(`SELECT immutable_excerpt FROM knowledge.passage WHERE document_id=${q(11)} AND version_id=${q(121)} AND passage_id=${q(131)};`), 'JWT replacement evidence');
      rejects(`UPDATE knowledge.document_version SET state='current', revision=3 WHERE document_id=${q(11)} AND version_id=${q(121)};`, '23514');
    });

    await t.test('committed deletion excludes stale rows and cannot be undone by old jobs', () => {
      run('knowledge', `UPDATE knowledge.document SET unavailable=true, revision=4 WHERE document_id=${q(11)};`);
      assert.equal(value(exact()), '');
      assert.equal(value(`SELECT * FROM knowledge.keyword_search(${q(1)}, ARRAY[${q(11)}]::uuid[], 'JWT', 5);`), '');
      rejects(`UPDATE knowledge.search_job SET readiness='ready' WHERE job_id=${q(151)};`, '23514');
      rejects(`UPDATE knowledge.document SET unavailable=false, revision=5 WHERE document_id=${q(11)};`, '23514');
    });

    await t.test('policy upgrades preserve data on rollback and reject unreconciled legacy rows', () => {
      const rollbackPolicy = (service, migration) => {
        const down = readFileSync(resolve(root, `services/${service}/migrations/${migration}.down.sql`), 'utf8');
        const later = service === 'knowledge' ? '003-handoff-store' : '004-protected-claims';
        const laterDown = readFileSync(resolve(root, `services/${service}/migrations/${later}.down.sql`), 'utf8');
        sql(container, service, `BEGIN; SET LOCAL ROLE ${service}_owner; ${laterDown}
          DELETE FROM _migrations.applied WHERE id='${later}'; ${down}
          DELETE FROM _migrations.applied WHERE id='${migration}'; COMMIT;`);
      };
      const previous = value(`SELECT immutable_excerpt FROM knowledge.passage WHERE passage_id=${q(31)};`);
      rollbackPolicy('knowledge', '002-current-revisions');
      assert.equal(value(`SELECT immutable_excerpt FROM knowledge.passage WHERE passage_id=${q(31)};`), previous);
      run('knowledge', `INSERT INTO knowledge.document_version(document_id, version_id, state, immutable_content)
        VALUES (${q(12)}, ${q(301)}, 'draft', 'Legacy unpublished evidence');`);
      assert.throws(() => migrate(container, 'knowledge'), /reconciliation of existing Draft/);
      assert.equal(value(`SELECT state || ':' || immutable_content FROM knowledge.document_version WHERE version_id=${q(301)};`), 'draft:Legacy unpublished evidence');
      assert.equal(sql(container, 'knowledge', 'SELECT count(*) FROM _migrations.applied;').stdout.trim(), '1');
      // Only discard the synthetic legacy row created by this test, as schema owner.
      sql(container, 'knowledge', `SET ROLE knowledge_owner; DELETE FROM knowledge.document_version WHERE version_id=${q(301)};`);
      migrate(container, 'knowledge');
      migrate(container, 'knowledge');
      assert.equal(value(`SELECT immutable_excerpt FROM knowledge.passage WHERE passage_id=${q(31)};`), previous);

      run('workspace', `INSERT INTO workspace.document_policy(document_id, project_id, classification)
        VALUES (${q(401)}, ${q(1)}, 'restricted');`);
      assert.equal(value(`SELECT registry_state FROM workspace.document_policy WHERE document_id=${q(401)};`, 'workspace'), 'active');
      rejects(`UPDATE workspace.document_policy SET registry_state='pending' WHERE document_id=${q(401)};`, '23514', 'workspace');
      rollbackPolicy('workspace', '002-registered-policy');
      assert.equal(value(`SELECT registry_state FROM workspace.document_policy WHERE document_id=${q(401)};`, 'workspace'), 'active');
      run('workspace', `UPDATE workspace.document_policy SET registry_state='pending' WHERE document_id=${q(401)};`);
      assert.throws(() => migrate(container, 'workspace'), /reconciliation of pending/);
      assert.equal(value(`SELECT registry_state FROM workspace.document_policy WHERE document_id=${q(401)};`, 'workspace'), 'pending');
      assert.equal(sql(container, 'workspace', 'SELECT count(*) FROM _migrations.applied;').stdout.trim(), '4');
      run('workspace', `UPDATE workspace.document_policy SET registry_state='active' WHERE document_id=${q(401)};`);
      migrate(container, 'workspace');
      migrate(container, 'workspace');
    });

    await t.test('reverse and forward migrations execute on the isolated synthetic database', () => {
      assert.throws(() => migrate(container, 'workspace', 'down'), /rollback refused/);
      // Only this suite's disposable synthetic database is cleared; no development volume is used.
      sql(container, 'workspace', 'SET ROLE workspace_owner; TRUNCATE workspace.task CASCADE;');
      for (const service of ['knowledge', 'workspace']) {
        migrate(container, service, 'down');
        assert.equal(sql(container, service, 'SELECT count(*) FROM _migrations.applied;').stdout.trim(), '0');
        migrate(container, service);
      }
      assert.equal(value('SELECT count(*) FROM knowledge.document;'), '0');
      assert.equal(value('SELECT count(*) FROM workspace.project;', 'workspace'), '0');
    });

    await t.test('legacy completed history requires explicit revision-bound reconciliation', () => {
      const migration = name => readFileSync(resolve(root, `services/workspace/migrations/${name}.up.sql`), 'utf8');
      // Recreate the pre-003 shape only inside this suite's isolated disposable database.
      sql(container, 'workspace', `BEGIN; SET LOCAL ROLE workspace_owner;
        DROP SCHEMA workspace CASCADE;
        ${migration('001-store')}
        ${migration('002-registered-policy')}
        INSERT INTO workspace.project(project_id,name) VALUES (${q(1)},'Legacy');
        INSERT INTO workspace.sprint(sprint_id,project_id,goal,start_date,end_date,state)
          VALUES (${q(101)},${q(1)},'Old','2026-10-01','2026-10-10','completed');
        INSERT INTO workspace.task(task_id,project_id,type,title,state) VALUES (${q(103)},${q(1)},'task','Ambiguous','done');
        INSERT INTO workspace.sprint_allocation VALUES (${q(1)},${q(101)},${q(103)},'completed',1);
        COMMIT;`);
      const apply = () => sql(container, 'workspace', `BEGIN; SET LOCAL ROLE workspace_owner; ${migration('003-work-location')} COMMIT;`);
      assert.throws(apply, /Explicit task location reconciliation required/);
      assert.equal(value(`SELECT count(*) FROM information_schema.columns WHERE table_schema='workspace' AND table_name='task' AND column_name='location_kind';`, 'workspace'), '0');
      sql(container, 'workspace', `SET ROLE workspace_owner;
        INSERT INTO _migrations.task_location_reconciliation VALUES (${q(103)},99,'backlog',NULL);`);
      assert.throws(apply, /Stale or unknown task location/);
      sql(container, 'workspace', `SET ROLE workspace_owner; UPDATE _migrations.task_location_reconciliation SET expected_task_revision=1;`);
      apply();
      assert.equal(value(`SELECT location_kind || ':' || state FROM workspace.task WHERE task_id=${q(103)};`, 'workspace'), 'backlog:done');
      assert.equal(value(`SELECT allocation_state FROM workspace.sprint_allocation WHERE task_id=${q(103)};`, 'workspace'), 'completed');
    });
  } finally {
    // Only the uniquely named container created by this test is stopped. No local dev volume is touched.
    if (started) docker(['stop', '--time', '2', container]);
  }
});
