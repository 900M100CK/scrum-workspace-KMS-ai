import { createHash,randomBytes,randomUUID } from 'node:crypto';
import type { Pool,PoolClient } from 'pg';
import { ownedTransaction } from './database.ts';
import type { SessionPolicy } from './config.ts';

export interface CredentialRecord {userId:string;credential:string;revision:string;disabled:boolean}
export interface StoredSession {sessionId:string;userId:string;expiresAt:string}
export type SessionResult={kind:'authenticated';session:StoredSession}|{kind:'unauthenticated'}|{kind:'unavailable'};
export type IssueResult={kind:'created';session:StoredSession;token:string}|{kind:'unauthenticated'}|{kind:'unavailable'};
export type RevokeResult={kind:'signed_out'}|{kind:'unavailable'};
// Test-only injection; production wiring always samples PostgreSQL after acquiring locks.
export type SessionTimeSource=(client:PoolClient)=>Promise<string>;
const databaseTime:SessionTimeSource=async c=>(await c.query('SELECT clock_timestamp()::text AS observed')).rows[0].observed;
export const tokenDigest=(token:string):string=>createHash('sha256').update(token).digest('hex');
const validToken=(token:string)=>/^[A-Za-z0-9_-]{43}$/.test(token)&&Buffer.from(token,'base64url').toString('base64url')===token;
type ClockRow={last_observed:string|null;healthy:boolean;generation:string};

async function clockLock(c:PoolClient):Promise<ClockRow|null>{
 return (await c.query('SELECT last_observed::text,healthy,recovery_generation::text AS generation FROM workspace.auth_clock_state WHERE singleton=true FOR UPDATE')).rows[0]??null;
}
async function audit(c:PoolClient,action:string,entityId:string|null,observed:string,generation:string,operatorRef:string|null=null,evidenceRef:string|null=null,actorUserId:string|null=null,correlationId:string=randomUUID()):Promise<void>{
 await c.query('INSERT INTO workspace.authentication_audit(event_id,action,entity_id,operator_ref,observed_at,recovery_generation,correlation_id,evidence_ref,actor_user_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)',[randomUUID(),action,entityId,operatorRef,observed,generation,correlationId,evidenceRef,actorUserId]);
}
async function observe(c:PoolClient,state:ClockRow|null,time:SessionTimeSource=databaseTime):Promise<string|null>{
 if(!state?.healthy||state.last_observed===null)return null;
 const sample=(await c.query('SELECT $1::timestamptz::text AS observed,$1::timestamptz >= $2::timestamptz AS valid',[await time(c),state.last_observed])).rows[0];
 if(!sample.valid){
  await c.query('UPDATE workspace.auth_clock_state SET healthy=false WHERE singleton=true');
  await audit(c,'clock_fault',null,sample.observed,state.generation);return null;
 }
 await c.query('UPDATE workspace.auth_clock_state SET last_observed=$1 WHERE singleton=true',[sample.observed]);
 return sample.observed;
}
const sessionFields="s.session_id AS \"sessionId\",s.user_id AS \"userId\",to_char(s.expires_at AT TIME ZONE 'UTC','YYYY-MM-DD\"T\"HH24:MI:SS.US\"Z\"') AS \"expiresAt\"";

/** Persistence only: no HTTP, public recovery or end-user permission policy. */
export class WorkspaceSessionStore {
 private readonly pool:Pool;
 private readonly policy:SessionPolicy;
 private readonly time:SessionTimeSource;
 constructor(pool:Pool,policy:SessionPolicy,time:SessionTimeSource=databaseTime){this.pool=pool;this.policy=policy;this.time=time;}
 async credential(username:string):Promise<CredentialRecord|null>{
  return ownedTransaction(this.pool,'runtime',async c=>{
   const row=(await c.query('SELECT user_id AS "userId",password_credential AS credential,credential_revision::text AS revision,disabled FROM workspace.auth_account WHERE username=$1',[username])).rows[0];
   return row??null;
  });
 }
 async establish(userId:string,credentialRevision:string,correlationId?:string):Promise<IssueResult>{
  return ownedTransaction(this.pool,'runtime',async c=>{
   const clock=await clockLock(c);
   const account=(await c.query('SELECT disabled,revision FROM workspace.lock_auth_account($1)',[userId])).rows[0];
   if(!account||account.disabled||account.revision!==credentialRevision)return {kind:'unauthenticated'};
   const now=await observe(c,clock,this.time);if(now===null)return {kind:'unavailable'};
   const token=randomBytes(32).toString('base64url'),sessionId=randomUUID();
   const row=(await c.query(`INSERT INTO workspace.session(session_id,user_id,expires_at) VALUES($1,$2,$3::timestamptz + $4 * interval '1 second') RETURNING session_id AS "sessionId",user_id AS "userId",to_char(expires_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS "expiresAt"`,[sessionId,userId,now,this.policy.idleSeconds])).rows[0] as StoredSession;
   await c.query("INSERT INTO workspace.session_token(session_id,token_digest,created_at,absolute_expires_at) VALUES($1,$2,$3,$3::timestamptz+$4*interval '1 second')",[sessionId,tokenDigest(token),now,this.policy.absoluteSeconds]);
   await audit(c,'session_created',sessionId,now,clock!.generation,null,null,userId,correlationId);
   return {kind:'created',session:row,token};
  });
 }
 async inspect(token:string):Promise<SessionResult>{
  return this.resolve(token,false);
 }
 async renew(token:string,correlationId?:string):Promise<SessionResult>{
  return this.resolve(token,true,correlationId);
 }
 private async resolve(token:string,renew:boolean,correlationId?:string):Promise<SessionResult>{
  return ownedTransaction(this.pool,'runtime',c=>this.inspectInTransaction(c,token,renew,correlationId));
 }
 /** Caller owns the transaction; typed denial commits a clock-fault latch without business effects. */
 async inspectInTransaction(c:PoolClient,token:string,renew=false,correlationId?:string):Promise<SessionResult>{
  if(!validToken(token))return {kind:'unauthenticated'};
   return this.inspectSession(c,{digest:tokenDigest(token)},renew,correlationId);
 }
 async inspectServiceSession(c:PoolClient,sessionId:string,userId:string):Promise<SessionResult>{
  return this.inspectSession(c,{sessionId,userId},false);
 }
 private async inspectSession(c:PoolClient,selector:{digest:string}|{sessionId:string;userId:string},renew:boolean,correlationId?:string):Promise<SessionResult>{
   const clock=await clockLock(c);
   const hint=('digest' in selector
     ? await c.query('SELECT s.user_id,s.session_id FROM workspace.session s JOIN workspace.session_token t USING(session_id) WHERE t.token_digest=$1',[selector.digest])
     : await c.query('SELECT user_id,session_id FROM workspace.session WHERE session_id=$1 AND user_id=$2',[selector.sessionId,selector.userId])).rows[0];
   if(!hint)return {kind:'unauthenticated'};
   const account=(await c.query('SELECT disabled FROM workspace.lock_auth_account($1)',[hint.user_id])).rows[0];
   const row=(await c.query(`SELECT ${sessionFields},s.revoked FROM workspace.session s WHERE s.session_id=$1 FOR UPDATE`,[hint.session_id])).rows[0];
   if(!account||account.disabled||!row||row.revoked)return {kind:'unauthenticated'};
   const now=await observe(c,clock,this.time);if(now===null)return {kind:'unavailable'};
   const valid=(await c.query('SELECT s.expires_at>$2::timestamptz AND t.absolute_expires_at>$2::timestamptz AS valid FROM workspace.session s JOIN workspace.session_token t USING(session_id) WHERE s.session_id=$1',[hint.session_id,now])).rows[0];
   if(!valid?.valid)return {kind:'unauthenticated'};
   if(renew){
    const updated=(await c.query(`UPDATE workspace.session s SET expires_at=least(t.absolute_expires_at,greatest(s.expires_at,$2::timestamptz+$3*interval '1 second')),revision=s.revision+1 FROM workspace.session_token t WHERE t.session_id=s.session_id AND s.session_id=$1 AND least(t.absolute_expires_at,$2::timestamptz+$3*interval '1 second')>s.expires_at RETURNING ${sessionFields}`,[hint.session_id,now,this.policy.idleSeconds])).rows[0];
    if(updated){await audit(c,'session_renewed',hint.session_id,now,clock!.generation,null,null,hint.user_id,correlationId);return {kind:'authenticated',session:updated};}
   }
   return {kind:'authenticated',session:{sessionId:row.sessionId,userId:row.userId,expiresAt:row.expiresAt}};

 }
 async revoke(token:string,correlationId?:string):Promise<RevokeResult>{
  if(!validToken(token))return {kind:'signed_out'};
  return ownedTransaction(this.pool,'runtime',async c=>{
   const clock=await clockLock(c);
   const hint=(await c.query('SELECT s.user_id,s.session_id FROM workspace.session s JOIN workspace.session_token t USING(session_id) WHERE t.token_digest=$1',[tokenDigest(token)])).rows[0];
   if(!hint)return {kind:'signed_out'};
   if(!clock)return {kind:'unavailable'};
   await c.query('SELECT disabled FROM workspace.lock_auth_account($1)',[hint.user_id]);
   const row=(await c.query('SELECT revoked FROM workspace.session WHERE session_id=$1 FOR UPDATE',[hint.session_id])).rows[0];
   if(!row||row.revoked)return {kind:'signed_out'};
   // Revocation reduces access even when clock health is latched unhealthy; it never resets health.
   const now=await this.time(c);
   await c.query('UPDATE workspace.session SET revoked=true,revision=revision+1 WHERE session_id=$1',[hint.session_id]);
   await audit(c,'session_revoked',hint.session_id,now,clock.generation,null,null,hint.user_id,correlationId);
   return {kind:'signed_out'};
  });
 }
}

export interface RecoveryInput {expectedGeneration:string;expectedLastObserved:string|null;attestedTime:string;maxSkewMs:number;evidenceId:string;operatorRef:string}
function reference(value:string):void {if(!value||Buffer.byteLength(value)>1024)throw new Error('Operator reference required');}
export class WorkspaceSessionOperator {
 private readonly pool:Pool;
 constructor(pool:Pool){this.pool=pool;}
 async state():Promise<ClockRow|null>{return ownedTransaction(this.pool,'operator',clockLock);}
 async provision(userId:string,username:string,credential:string,operatorRef:string):Promise<void>{
  reference(operatorRef);
  await ownedTransaction(this.pool,'operator',async c=>{
   const clock=await clockLock(c);if(!clock)throw new Error('Missing clock state');
   await c.query('INSERT INTO workspace.auth_account(user_id,username,password_credential) VALUES($1,$2,$3)',[userId,username,credential]);
   const now=(await c.query('SELECT clock_timestamp()::text AS observed')).rows[0].observed;
   await audit(c,'account_provisioned',userId,now,clock.generation,operatorRef);
  });
 }
 async disable(userId:string,operatorRef:string):Promise<void>{
  reference(operatorRef);
  await ownedTransaction(this.pool,'operator',async c=>{
   const clock=await clockLock(c);if(!clock)throw new Error('Missing clock state');
   const row=(await c.query('SELECT disabled FROM workspace.auth_account WHERE user_id=$1 FOR UPDATE',[userId])).rows[0];
   if(!row)throw new Error('Account unavailable');if(row.disabled)return;
   await c.query('UPDATE workspace.auth_account SET disabled=true,credential_revision=credential_revision+1 WHERE user_id=$1',[userId]);
   await c.query('UPDATE workspace.session SET revoked=true,revision=revision+1 WHERE user_id=$1 AND NOT revoked',[userId]);
   const now=(await c.query('SELECT clock_timestamp()::text AS observed')).rows[0].observed;
   await audit(c,'account_disabled',userId,now,clock.generation,operatorRef);
  });
 }
 async recover(input:RecoveryInput):Promise<void>{
  reference(input.operatorRef);reference(input.evidenceId);
  if(!/^(0|[1-9]\d*)$/.test(input.expectedGeneration)||!Number.isSafeInteger(input.maxSkewMs)||input.maxSkewMs<0||!Number.isFinite(Date.parse(input.attestedTime)))throw new Error('Explicit valid recovery preconditions required');
  await ownedTransaction(this.pool,'operator',async c=>{
   const clock=await clockLock(c);
   if(!clock||clock.healthy||clock.generation!==input.expectedGeneration)throw new Error('Stale recovery precondition');
   const match=(await c.query('SELECT $1::timestamptz IS NOT DISTINCT FROM $2::timestamptz AS valid',[clock.last_observed,input.expectedLastObserved])).rows[0];
   if(!match.valid)throw new Error('Stale recovery observation');
   const now=(await c.query('SELECT clock_timestamp()::text AS observed')).rows[0].observed;
   const close=(await c.query('SELECT abs(extract(epoch FROM ($1::timestamptz-$2::timestamptz)))*1000 <= $3 AS valid',[now,input.attestedTime,input.maxSkewMs])).rows[0];
   if(!close.valid)throw new Error('Clock attestation mismatch');
   await c.query('UPDATE workspace.session SET revoked=true,revision=revision+1 WHERE NOT revoked');
   const generation=(BigInt(clock.generation)+1n).toString();
   await audit(c,'clock_recovered',null,now,generation,input.operatorRef,input.evidenceId);
   await c.query('UPDATE workspace.auth_clock_state SET healthy=true,last_observed=$1,recovery_generation=$2 WHERE singleton=true',[now,generation]);
  });
 }
}
