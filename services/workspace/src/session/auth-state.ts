import { randomUUID } from 'node:crypto';
import type { PoolClient } from 'pg';

// Test-only injection; production wiring always samples PostgreSQL after acquiring locks.
export type SessionTimeSource = (client: PoolClient) => Promise<string>;
export const databaseTime: SessionTimeSource = async c => (await c.query('SELECT clock_timestamp()::text AS observed')).rows[0].observed;

export type ClockRow = { last_observed: string | null; healthy: boolean; generation: string };

export async function lockClock(c: PoolClient): Promise<ClockRow | null> {
  return (await c.query('SELECT last_observed::text,healthy,recovery_generation::text AS generation FROM workspace.auth_clock_state WHERE singleton=true FOR UPDATE')).rows[0] ?? null;
}
interface AuditEvent {
  action: string;
  entityId: string | null;
  observed: string;
  generation: string;
  operatorRef?: string;
  evidenceRef?: string;
  actorUserId?: string;
  correlationId?: string | undefined;
}

export async function writeAuthenticationAudit(c: PoolClient, event: AuditEvent): Promise<void> {
  const { action, entityId, observed, generation, operatorRef = null, evidenceRef = null,
    actorUserId = null, correlationId = randomUUID() } = event;
  await c.query(
    'INSERT INTO workspace.authentication_audit(event_id,action,entity_id,operator_ref,observed_at,recovery_generation,correlation_id,evidence_ref,actor_user_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)',
    [randomUUID(), action, entityId, operatorRef, observed, generation, correlationId, evidenceRef, actorUserId],
  );
}

export async function observeClock(c: PoolClient, state: ClockRow | null, time: SessionTimeSource = databaseTime): Promise<string | null> {
  if (!state?.healthy || state.last_observed === null) return null;
  const sample = (await c.query('SELECT $1::timestamptz::text AS observed,$1::timestamptz >= $2::timestamptz AS valid', [await time(c), state.last_observed])).rows[0];
  if (!sample.valid) {
    await c.query('UPDATE workspace.auth_clock_state SET healthy=false WHERE singleton=true');
    await writeAuthenticationAudit(c, {
      action: 'clock_fault', entityId: null, observed: sample.observed, generation: state.generation,
    });
    return null;
  }
  await c.query('UPDATE workspace.auth_clock_state SET last_observed=$1 WHERE singleton=true', [sample.observed]);
  return sample.observed;
}
