import pg from 'pg';
import type { Pool, PoolClient } from 'pg';

export class SessionStoreUnavailable extends Error {
 readonly commitOutcome:'not-committed'|'unknown';
 constructor(cause:unknown,unknownCommit=false){super('Session persistence unavailable',{cause});this.commitOutcome=unknownCommit?'unknown':'not-committed';}
}
export function workspacePool(connectionString:string):Pool {
 const pool=new pg.Pool({connectionString,max:4,connectionTimeoutMillis:1200,idleTimeoutMillis:10000,application_name:'sacw-workspace-session'});
 // Background errors must not crash or leak credentials; subsequent operations still fail explicitly.
 pool.on('error',()=>{});
 return pool;
}
export async function ownedTransaction<T>(pool:Pool,role:'runtime'|'operator',work:(client:PoolClient)=>Promise<T>):Promise<T>{
 let client:PoolClient;
 try{client=await pool.connect();}catch(error){throw new SessionStoreUnavailable(error);}
 let discard=false,commitSent=false;
 const connectionFailure=()=>{discard=true;};client.on('error',connectionFailure);
 try{
  await client.query('BEGIN');
  await client.query("SET LOCAL lock_timeout='1s'; SET LOCAL statement_timeout='3s'");
  if(role==='operator')await client.query('SET LOCAL ROLE workspace_owner');
  else if((await client.query('SELECT current_user AS role')).rows[0].role!=='workspace_app')throw new Error('Wrong runtime database role');
  const result=await work(client);commitSent=true;await client.query('COMMIT');return result;
 }catch(error){
  if(commitSent)discard=true;
  else try{await client.query('ROLLBACK');}catch{discard=true;}
  throw new SessionStoreUnavailable(error,commitSent);
 }finally{client.release(discard);client.off('error',connectionFailure);}
}
