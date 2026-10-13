import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { docker, image, migrate, root, sql, waitReady } from '../scripts/database.mjs';

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
        assert.equal(sql(container, service, 'SELECT count(*) FROM _migrations.applied;').stdout.trim(), '1');
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
        INSERT INTO workspace.project(project_id, name) VALUES (${q(1)}, 'Synthetic A'), (${q(2)}, 'Synthetic B');
        INSERT INTO workspace.sprint(sprint_id, project_id, goal, start_date, end_date, state)
          VALUES (${q(101)}, ${q(1)}, 'Pilot', '2026-10-01', '2026-10-15', 'active'),
                 (${q(102)}, ${q(1)}, 'Next', '2026-10-16', '2026-10-30', 'planned');
        INSERT INTO workspace.task(task_id, project_id, type, title, state)
          VALUES (${q(103)}, ${q(1)}, 'task', 'Synthetic task', 'todo');
        INSERT INTO workspace.sprint_allocation(project_id, sprint_id, task_id, allocation_state)
          VALUES (${q(1)}, ${q(101)}, ${q(103)}, 'allocated');
        INSERT INTO workspace.blocker_event(event_id, task_id, status, description, actor_id, sequence)
          VALUES (${q(104)}, ${q(103)}, 'open', 'Waiting', ${q(3)}, 1);
      `);
      rejects(`UPDATE workspace.sprint SET state='active' WHERE sprint_id=${q(102)};`, '23505', 'workspace');
      rejects(`INSERT INTO workspace.sprint_allocation VALUES (${q(1)}, ${q(102)}, ${q(103)}, 'allocated', 1);`, '23505', 'workspace');
      rejects(`INSERT INTO workspace.sprint_allocation VALUES (${q(2)}, ${q(102)}, ${q(103)}, 'allocated', 1);`, '23503|23505', 'workspace');
      rejects(`INSERT INTO workspace.blocker_event(event_id, task_id, status, description, actor_id, sequence)
        VALUES (${q(105)}, ${q(103)}, 'resolved', 'Done', ${q(3)}, 1);`, '23505', 'workspace');
      rejects('UPDATE workspace.blocker_event SET description=\'rewrite\';', '42501', 'workspace');
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
          VALUES (${q(14)}, ${q(1)}, 'document', 'Synthetic draft', ${q(3)});
        INSERT INTO knowledge.document_version(document_id, version_id, state, immutable_content)
          VALUES (${q(14)}, ${q(24)}, 'draft', 'JWT unpublished evidence');
        INSERT INTO knowledge.passage VALUES (${q(14)}, ${q(24)}, ${q(34)}, 'paragraph:1', 'JWT unpublished evidence');
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

    await t.test('publication preserves old evidence, excludes stale vectors, and allows keyword fallback', () => {
      run('knowledge', `BEGIN;
        INSERT INTO knowledge.document_version(document_id, version_id, state, immutable_content)
          VALUES (${q(11)}, ${q(121)}, 'draft', 'JWT replacement evidence');
        INSERT INTO knowledge.passage VALUES (${q(11)}, ${q(121)}, ${q(131)}, 'paragraph:1', 'JWT replacement evidence');
        UPDATE knowledge.document_version SET state='superseded', revision=2 WHERE document_id=${q(11)} AND version_id=${q(21)};
        UPDATE knowledge.document_version SET state='current', revision=2 WHERE document_id=${q(11)} AND version_id=${q(121)};
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

    await t.test('committed deletion excludes stale rows and cannot be undone by old jobs', () => {
      run('knowledge', `UPDATE knowledge.document SET unavailable=true, revision=3 WHERE document_id=${q(11)};`);
      assert.equal(value(exact()), '');
      assert.equal(value(`SELECT * FROM knowledge.keyword_search(${q(1)}, ARRAY[${q(11)}]::uuid[], 'JWT', 5);`), '');
      rejects(`UPDATE knowledge.search_job SET readiness='ready' WHERE job_id=${q(151)};`, '23514');
      rejects(`UPDATE knowledge.document SET unavailable=false, revision=4 WHERE document_id=${q(11)};`, '23514');
    });

    await t.test('reverse and forward migrations execute on the isolated synthetic database', () => {
      for (const service of ['knowledge', 'workspace']) {
        migrate(container, service, 'down');
        assert.equal(sql(container, service, 'SELECT count(*) FROM _migrations.applied;').stdout.trim(), '0');
        migrate(container, service);
      }
      assert.equal(value('SELECT count(*) FROM knowledge.document;'), '0');
      assert.equal(value('SELECT count(*) FROM workspace.project;', 'workspace'), '0');
    });
  } finally {
    // Only the uniquely named container created by this test is stopped. No local dev volume is touched.
    if (started) docker(['stop', '--time', '2', container]);
  }
});
