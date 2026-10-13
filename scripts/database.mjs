import { spawnSync } from 'node:child_process';
import { randomBytes, createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const image = 'pgvector/pgvector:0.8.2-pg17-bookworm@sha256:feb68f4f15446397d8cac7f4fe48fe4586de83160d1fc48b46283312d1a33966';
const compose = ['compose', '--env-file', resolve(root, 'infra/postgres/.env'), '-f', resolve(root, 'infra/postgres/compose.yaml')];

export function docker(args, { input, env = {}, allowFailure = false, timeout = 120000 } = {}) {
  const result = spawnSync('docker', args, {
    cwd: root, encoding: 'utf8', input, env: { ...process.env, ...env },
    timeout, windowsHide: true, maxBuffer: 8 * 1024 * 1024,
  });
  if (!allowFailure && (result.error || result.status !== 0)) {
    // Credentials are passed in environment only, never in argv or printed commands.
    let message = result.error?.message ?? result.stderr ?? 'Docker command failed';
    for (const value of Object.values(env)) if (value) message = message.replaceAll(value, '[redacted]');
    throw new Error(message);
  }
  return result;
}

export function sql(container, service, input, { runtime = false, password, allowFailure = false } = {}) {
  if (!['workspace', 'knowledge'].includes(service)) throw new Error('Unknown service');
  const args = ['exec', '-i'];
  if (runtime) args.push('-e', 'PGPASSWORD');
  args.push(container, 'psql', '-X', '-q', '-A', '-t', '--set', 'ON_ERROR_STOP=1', '--set', 'VERBOSITY=verbose',
    '-U', runtime ? `${service}_app` : 'postgres', '-d', `${service}_db`);
  if (runtime) args.push('-h', '127.0.0.1');
  return docker(args, { input, env: runtime ? { PGPASSWORD: password } : {}, allowFailure });
}

export function migrate(container, service, direction = 'up') {
  if (!['workspace', 'knowledge'].includes(service) || !['up', 'down'].includes(direction)) throw new Error('Invalid migration target');
  const directory = resolve(root, `services/${service}/migrations`);
  const names = readdirSync(directory).filter(name => /^\d{3}-[a-z-]+\.up\.sql$/.test(name)).sort();
  if (direction === 'down') names.reverse();
  for (const name of names) {
    const id = name.replace('.up.sql', '');
    const up = readFileSync(resolve(directory, name), 'utf8').replaceAll('\r\n', '\n');
    const down = readFileSync(resolve(directory, name.replace('.up.', '.down.')), 'utf8').replaceAll('\r\n', '\n');
    const hash = createHash('sha256').update(up + '\n' + down).digest('hex');
    sql(container, service, `
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';
SELECT pg_advisory_xact_lock(704004);
SET LOCAL ROLE ${service}_owner;
CREATE SCHEMA IF NOT EXISTS _migrations;
CREATE TABLE IF NOT EXISTS _migrations.applied (
  id text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM _migrations.applied WHERE id = '${id}' AND checksum <> '${hash}') THEN
    RAISE EXCEPTION 'Applied migration checksum mismatch: ${id}';
  END IF;
END $$;
SELECT EXISTS (SELECT 1 FROM _migrations.applied WHERE id = '${id}') AS applied \\gset
\\if ${direction === 'up' ? ':applied\n\\else' : ':applied'}
${direction === 'up' ? up : down}
${direction === 'up' ? `INSERT INTO _migrations.applied(id, checksum) VALUES ('${id}', '${hash}');` : `DELETE FROM _migrations.applied WHERE id = '${id}';`}
\\endif
COMMIT;
`);
  }
}

export async function waitReady(container) {
  const deadline = Date.now() + 90000;
  while (Date.now() < deadline) {
    const ready = docker(['exec', container, 'sh', '-c', 'test -f "$PGDATA/kms-bootstrap-complete" && pg_isready -U postgres -d knowledge_db'], { allowFailure: true, timeout: 5000 });
    if (ready.status === 0) return;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error('Database did not become ready within 90 seconds');
}

async function main() {
  const [command, service, confirmation] = process.argv.slice(2);
  if (command === 'init') {
    const values = ['POSTGRES_PASSWORD', 'WORKSPACE_DB_PASSWORD', 'KNOWLEDGE_DB_PASSWORD']
      .map(key => `${key}=${randomBytes(32).toString('hex')}`);
    writeFileSync(resolve(root, 'infra/postgres/.env'), values.join('\n') + '\nPOSTGRES_PORT=55432\n', { flag: 'wx', mode: 0o600 });
    console.log('Created ignored local database credentials in infra/postgres/.env; existing credentials are never overwritten.');
    return;
  }
  if (command === 'up') {
    docker([...compose, 'up', '-d', '--wait'], { timeout: 180000 });
    console.log('PostgreSQL is ready on loopback; run npm run db:migrate.');
    return;
  }
  if (command === 'stop') {
    docker([...compose, 'stop']);
    console.log('Database stopped; volume retained.');
    return;
  }
  if (!['migrate', 'rollback'].includes(command)) throw new Error('Use init, up, migrate, rollback <workspace|knowledge> --allow-data-loss, or stop');
  if (command === 'rollback' && (!['workspace', 'knowledge'].includes(service) || confirmation !== '--allow-data-loss')) {
    throw new Error('Rollback deletes service data. Specify the service and --allow-data-loss.');
  }
  const container = docker([...compose, 'ps', '-q', 'postgres']).stdout.trim();
  if (!container) throw new Error('Start the database with npm run db:up first');
  for (const target of command === 'rollback' ? [service] : ['workspace', 'knowledge']) {
    migrate(container, target, command === 'rollback' ? 'down' : 'up');
    console.log(`${target}: ${command} completed`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
