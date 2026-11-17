import { createHash, randomBytes, randomUUID } from 'node:crypto';
import type { Pool, PoolClient } from 'pg';
import { ownedTransaction } from './database.ts';
import type { SessionPolicy } from './config.ts';
import { databaseTime, lockClock, observeClock, writeAuthenticationAudit, type SessionTimeSource } from './auth-state.ts';

export type { SessionTimeSource } from './auth-state.ts';
export { WorkspaceSessionOperator, type RecoveryInput } from './operator-store.ts';

export interface CredentialRecord {
  userId: string;
  credential: string;
  revision: string;
  disabled: boolean;
}
export interface StoredSession {
  sessionId: string;
  userId: string;
  expiresAt: string;
}
export type SessionResult = { kind: 'authenticated'; session: StoredSession } | { kind: 'unauthenticated' } | { kind: 'unavailable' };
export type IssueResult = { kind: 'created'; session: StoredSession; token: string } | { kind: 'unauthenticated' } | { kind: 'unavailable' };
export type RevokeResult = { kind: 'signed_out' } | { kind: 'unavailable' };
export const tokenDigest = (token: string): string => createHash('sha256').update(token).digest('hex');
const validToken = (token: string) => /^[A-Za-z0-9_-]{43}$/.test(token) && Buffer.from(token, 'base64url').toString('base64url') === token;

const sessionByDigest = 'SELECT s.user_id,s.session_id FROM workspace.session s JOIN workspace.session_token t USING(session_id) WHERE t.token_digest=$1';
const sessionFields = "s.session_id AS \"sessionId\",s.user_id AS \"userId\",to_char(s.expires_at AT TIME ZONE 'UTC','YYYY-MM-DD\"T\"HH24:MI:SS.US\"Z\"') AS \"expiresAt\"";

/** Persistence only: no HTTP, public recovery or end-user permission policy. */
export class WorkspaceSessionStore {
  private readonly pool: Pool;
  private readonly policy: SessionPolicy;
  private readonly time: SessionTimeSource;
  constructor(pool: Pool, policy: SessionPolicy, time: SessionTimeSource = databaseTime) {
    this.pool = pool;
    this.policy = policy;
    this.time = time;
  }

  async credential(username: string): Promise<CredentialRecord | null> {
    return ownedTransaction(this.pool, 'runtime', async c => {
      const row = (await c.query(
        'SELECT user_id AS "userId",password_credential AS credential,credential_revision::text AS revision,disabled FROM workspace.auth_account WHERE username=$1',
        [username],
      )).rows[0];
      return row ?? null;
    });
  }

  async establish(userId: string, credentialRevision: string, correlationId?: string): Promise<IssueResult> {
    return ownedTransaction(this.pool, 'runtime', async c => {
      const clock = await lockClock(c);
      const account = (await c.query('SELECT disabled,revision FROM workspace.lock_auth_account($1)', [userId])).rows[0];
      if (!account || account.disabled || account.revision !== credentialRevision) return { kind: 'unauthenticated' };
      const now = await observeClock(c, clock, this.time);
      if (now === null) return { kind: 'unavailable' };

      const token = randomBytes(32).toString('base64url');
      const sessionId = randomUUID();
      const row = (await c.query(
        `INSERT INTO workspace.session(session_id,user_id,expires_at) VALUES($1,$2,$3::timestamptz + $4 * interval '1 second') RETURNING session_id AS "sessionId",user_id AS "userId",to_char(expires_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS "expiresAt"`,
        [sessionId, userId, now, this.policy.idleSeconds],
      )).rows[0] as StoredSession;
      await c.query(
        "INSERT INTO workspace.session_token(session_id,token_digest,created_at,absolute_expires_at) VALUES($1,$2,$3,$3::timestamptz+$4*interval '1 second')",
        [sessionId, tokenDigest(token), now, this.policy.absoluteSeconds],
      );
      await writeAuthenticationAudit(c, {
        action: 'session_created', entityId: sessionId, observed: now, generation: clock!.generation,
        actorUserId: userId, correlationId,
      });
      return { kind: 'created', session: row, token };
    });
  }

  async inspect(token: string): Promise<SessionResult> {
    return this.resolve(token, false);
  }

  async renew(token: string, correlationId?: string): Promise<SessionResult> {
    return this.resolve(token, true, correlationId);
  }

  private async resolve(token: string, renew: boolean, correlationId?: string): Promise<SessionResult> {
    return ownedTransaction(this.pool, 'runtime', c => this.inspectInTransaction(c, token, renew, correlationId));
  }

  /** Caller owns the transaction; typed denial commits a clock-fault latch without business effects. */
  async inspectInTransaction(c: PoolClient, token: string, renew = false, correlationId?: string): Promise<SessionResult> {
    if (!validToken(token)) return { kind: 'unauthenticated' };
    return this.inspectSession(c, { digest: tokenDigest(token) }, renew, correlationId);
  }

  async inspectServiceSession(c: PoolClient, sessionId: string, userId: string): Promise<SessionResult> {
    return this.inspectSession(c, { sessionId, userId }, false);
  }

  private async inspectSession(c: PoolClient, selector: { digest: string } | { sessionId: string; userId: string }, renew: boolean, correlationId?: string): Promise<SessionResult> {
    // Sample time after locking the clock, account and session in that order.
    const clock = await lockClock(c);
    const hint = ('digest' in selector
      ? await c.query(sessionByDigest, [selector.digest])
      : await c.query('SELECT user_id,session_id FROM workspace.session WHERE session_id=$1 AND user_id=$2', [selector.sessionId, selector.userId])).rows[0];
    if (!hint) return { kind: 'unauthenticated' };
    const account = (await c.query('SELECT disabled FROM workspace.lock_auth_account($1)', [hint.user_id])).rows[0];
    const row = (await c.query(`SELECT ${sessionFields},s.revoked FROM workspace.session s WHERE s.session_id=$1 FOR UPDATE`, [hint.session_id])).rows[0];
    if (!account || account.disabled || !row || row.revoked) return { kind: 'unauthenticated' };

    const now = await observeClock(c, clock, this.time);
    if (now === null) return { kind: 'unavailable' };
    const valid = (await c.query(
      'SELECT s.expires_at>$2::timestamptz AND t.absolute_expires_at>$2::timestamptz AS valid ' +
        'FROM workspace.session s JOIN workspace.session_token t USING(session_id) WHERE s.session_id=$1',
      [hint.session_id, now],
    )).rows[0];
    if (!valid?.valid) return { kind: 'unauthenticated' };

    if (renew) {
      const updated = (await c.query(
        "UPDATE workspace.session s SET expires_at=least(t.absolute_expires_at,greatest(s.expires_at,$2::timestamptz+$3*interval '1 second'))," +
          "revision=s.revision+1 FROM workspace.session_token t WHERE t.session_id=s.session_id AND s.session_id=$1 " +
          `AND least(t.absolute_expires_at,$2::timestamptz+$3*interval '1 second')>s.expires_at RETURNING ${sessionFields}`,
        [hint.session_id, now, this.policy.idleSeconds],
      )).rows[0];
      if (updated) {
        await writeAuthenticationAudit(c, {
          action: 'session_renewed', entityId: hint.session_id, observed: now, generation: clock!.generation,
          actorUserId: hint.user_id, correlationId,
        });
        return { kind: 'authenticated', session: updated };
      }
    }
    return { kind: 'authenticated', session: { sessionId: row.sessionId, userId: row.userId, expiresAt: row.expiresAt } };
  }

  async revoke(token: string, correlationId?: string): Promise<RevokeResult> {
    if (!validToken(token)) return { kind: 'signed_out' };
    return ownedTransaction(this.pool, 'runtime', async c => {
      const clock = await lockClock(c);
      const hint = (await c.query(sessionByDigest, [tokenDigest(token)])).rows[0];
      if (!hint) return { kind: 'signed_out' };
      if (!clock) return { kind: 'unavailable' };
      await c.query('SELECT disabled FROM workspace.lock_auth_account($1)', [hint.user_id]);
      const row = (await c.query('SELECT revoked FROM workspace.session WHERE session_id=$1 FOR UPDATE', [hint.session_id])).rows[0];
      if (!row || row.revoked) return { kind: 'signed_out' };
      // Revocation reduces access even when clock health is latched unhealthy; it never resets health.
      const now = await this.time(c);
      await c.query('UPDATE workspace.session SET revoked=true,revision=revision+1 WHERE session_id=$1', [hint.session_id]);
      await writeAuthenticationAudit(c, {
        action: 'session_revoked', entityId: hint.session_id, observed: now, generation: clock.generation,
        actorUserId: hint.user_id, correlationId,
      });
      return { kind: 'signed_out' };
    });
  }
}
