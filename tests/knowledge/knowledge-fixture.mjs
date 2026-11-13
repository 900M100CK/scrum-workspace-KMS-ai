import {randomBytes} from 'node:crypto';
import {resolve} from 'node:path';
import pg from 'pg';
import Fastify from 'fastify';
import {docker, image, migrate, root, waitReady} from '../../scripts/database.mjs';
import {KnowledgeDocumentStore} from '../../services/knowledge/src/documents/store.ts';
import {registerKnowledgeDocumentHttp} from '../../services/knowledge/src/documents/http.ts';

export async function knowledgeFixture() {
  const name = `kms-know-test-${randomBytes(6).toString('hex')}`;
  const volume = `${name}-data`;
  const passwords = {
    POSTGRES_PASSWORD: randomBytes(24).toString('hex'),
    WORKSPACE_DB_PASSWORD: randomBytes(24).toString('hex'),
    KNOWLEDGE_DB_PASSWORD: randomBytes(24).toString('hex'),
  };
  const pools = [];
  let started = false;
  let created = false;
  let admin, runtime, app;

  function url(user, password, database) {
    const port = docker(['port', name, '5432/tcp']).stdout.trim().split(':').at(-1);
    return `postgresql://${user}:${password}@127.0.0.1:${port}/${database}`;
  }

  async function close() {
    if (app) await app.close();
    await Promise.all(pools.map(pool => (pool.ending ? undefined : pool.end())));
    if (started) docker(['rm', '--force', name]);
    if (created) docker(['volume', 'rm', volume]);
  }

  try {
    docker(['volume', 'create', volume]);
    created = true;
    docker(
      [
        'run',
        '-d',
        '--name',
        name,
        '-e',
        'POSTGRES_PASSWORD',
        '-e',
        'WORKSPACE_DB_PASSWORD',
        '-e',
        'KNOWLEDGE_DB_PASSWORD',
        '-e',
        'POSTGRES_INITDB_ARGS=--auth-host=scram-sha-256',
        '--mount',
        `type=volume,source=${volume},target=/var/lib/postgresql/data`,
        '--publish',
        '127.0.0.1::5432',
        '-v',
        `${resolve(root, 'infra/postgres/bootstrap.sh')}:/docker-entrypoint-initdb.d/10-bootstrap.sh:ro`,
        '-v',
        `${resolve(root, 'infra/postgres/bootstrap.sql')}:/bootstrap.sql:ro`,
        image,
      ],
      {env: passwords}
    );
    started = true;
    await waitReady(name);
    migrate(name, 'knowledge', 'up');

    const adminUrl = url('postgres', passwords.POSTGRES_PASSWORD, 'knowledge_db');
    const runtimeUrl = url('knowledge_app', passwords.KNOWLEDGE_DB_PASSWORD, 'knowledge_db');

    admin = new pg.Pool({connectionString: adminUrl, max: 2});
    runtime = new pg.Pool({connectionString: runtimeUrl, max: 4});
    pools.push(admin, runtime);

    const store = new KnowledgeDocumentStore(runtime);
    const serviceKey = 'synthetic-service-key-for-test-32b';

    app = Fastify();
    registerKnowledgeDocumentHttp(app, {store, expectedKey: serviceKey});
    await app.ready();

    return {
      name,
      runtimeUrl,
      admin,
      runtime,
      store,
      serviceKey,
      app,
      close,
    };
  } catch (error) {
    await close();
    throw error;
  }
}
