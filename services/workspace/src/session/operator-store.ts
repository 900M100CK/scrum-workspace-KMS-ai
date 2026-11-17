import type { Pool } from 'pg';
import { databaseTime, lockClock, writeAuthenticationAudit, type ClockRow } from './auth-state.ts';
import { ownedTransaction } from './database.ts';

export interface RecoveryInput {
  expectedGeneration: string;
  expectedLastObserved: string | null;
  attestedTime: string;
  maxSkewMs: number;
  evidenceId: string;
  operatorRef: string;
}

function requireReference(value: string): void {
  if (!value || Buffer.byteLength(value) > 1024) throw new Error('Operator reference required');
}

export class WorkspaceSessionOperator {
  private readonly pool: Pool;
  constructor(pool: Pool) { this.pool = pool; }

  async state(): Promise<ClockRow | null> {
    return ownedTransaction(this.pool, 'operator', lockClock);
  }

  async provision(userId: string, username: string, credential: string, operatorRef: string): Promise<void> {
    requireReference(operatorRef);
    await ownedTransaction(this.pool, 'operator', async c => {
      const clock = await lockClock(c);
      if (!clock) throw new Error('Missing clock state');
      await c.query('INSERT INTO workspace.auth_account(user_id,username,password_credential) VALUES($1,$2,$3)', [userId, username, credential]);
      const now = await databaseTime(c);
      await writeAuthenticationAudit(c, {
        action: 'account_provisioned', entityId: userId, observed: now, generation: clock.generation, operatorRef,
      });
    });
  }

  async disable(userId: string, operatorRef: string): Promise<void> {
    requireReference(operatorRef);
    await ownedTransaction(this.pool, 'operator', async c => {
      const clock = await lockClock(c);
      if (!clock) throw new Error('Missing clock state');
      const row = (await c.query('SELECT disabled FROM workspace.auth_account WHERE user_id=$1 FOR UPDATE', [userId])).rows[0];
      if (!row) throw new Error('Account unavailable');
      if (row.disabled) return;
      await c.query('UPDATE workspace.auth_account SET disabled=true,credential_revision=credential_revision+1 WHERE user_id=$1', [userId]);
      await c.query('UPDATE workspace.session SET revoked=true,revision=revision+1 WHERE user_id=$1 AND NOT revoked', [userId]);
      const now = await databaseTime(c);
      await writeAuthenticationAudit(c, {
        action: 'account_disabled', entityId: userId, observed: now, generation: clock.generation, operatorRef,
      });
    });
  }

  async recover(input: RecoveryInput): Promise<void> {
    requireReference(input.operatorRef);
    requireReference(input.evidenceId);
    if (
      !/^(0|[1-9]\d*)$/.test(input.expectedGeneration) ||
      !Number.isSafeInteger(input.maxSkewMs) ||
      input.maxSkewMs < 0 ||
      !Number.isFinite(Date.parse(input.attestedTime))
    ) {
      throw new Error('Explicit valid recovery preconditions required');
    }
    await ownedTransaction(this.pool, 'operator', async c => {
      const clock = await lockClock(c);
      if (!clock || clock.healthy || clock.generation !== input.expectedGeneration) throw new Error('Stale recovery precondition');
      const match = (await c.query('SELECT $1::timestamptz IS NOT DISTINCT FROM $2::timestamptz AS valid', [clock.last_observed, input.expectedLastObserved])).rows[0];
      if (!match.valid) throw new Error('Stale recovery observation');
      const now = await databaseTime(c);
      const close = (await c.query('SELECT abs(extract(epoch FROM ($1::timestamptz-$2::timestamptz)))*1000 <= $3 AS valid', [now, input.attestedTime, input.maxSkewMs])).rows[0];
      if (!close.valid) throw new Error('Clock attestation mismatch');
      await c.query('UPDATE workspace.session SET revoked=true,revision=revision+1 WHERE NOT revoked');
      const generation = (BigInt(clock.generation) + 1n).toString();
      await writeAuthenticationAudit(c, {
        action: 'clock_recovered', entityId: null, observed: now, generation,
        operatorRef: input.operatorRef, evidenceRef: input.evidenceId,
      });
      await c.query(
        'UPDATE workspace.auth_clock_state SET healthy=true,last_observed=$1,recovery_generation=$2 WHERE singleton=true',
        [now, generation],
      );
    });
  }
}
