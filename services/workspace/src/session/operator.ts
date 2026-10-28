import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { workspacePool } from './database.ts';
import { ScryptVerifier } from './kdf.ts';
import { WorkspaceSessionOperator } from './store.ts';
import type { RecoveryInput } from './store.ts';

async function input():Promise<Record<string,unknown>>{
 let bytes=0;const chunks:Buffer[]=[];
 for await(const chunk of process.stdin){const buffer=Buffer.from(chunk);bytes+=buffer.length;if(bytes>8192)throw new Error('Operator input too large');chunks.push(buffer);}
 const parsed:unknown=JSON.parse(Buffer.concat(chunks).toString('utf8'));
 if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw new Error('Object input required');
 return parsed as Record<string,unknown>;
}
function text(value:unknown):string{if(typeof value!=='string'||value.length===0)throw new Error('Required text input missing');return value;}
async function main():Promise<void>{
 const url=process.env.SACW_OPERATOR_DATABASE_URL,operatorRef=process.env.SACW_OPERATOR_REF;
 if(!url||!operatorRef)throw new Error('Operator configuration required');
 const pool=workspacePool(url),operator=new WorkspaceSessionOperator(pool);
 try{
  const command=process.argv[2];
  if(command==='state'){process.stdout.write(JSON.stringify(await operator.state())+'\n');return;}
  const data=await input();
  if(command==='provision'){
   const credential=await new ScryptVerifier().hash(text(data.password));const userId=randomUUID();
   await operator.provision(userId,text(data.username),credential,operatorRef);process.stdout.write(JSON.stringify({status:'provisioned',user_id:userId})+'\n');
  }else if(command==='disable'){
   await operator.disable(text(data.user_id),operatorRef);process.stdout.write('{"status":"disabled"}\n');
  }else if(command==='recover'){
   if(data.expectedLastObserved!==null&&typeof data.expectedLastObserved!=='string')throw new Error('Recovery snapshot required');
   if(typeof data.maxSkewMs!=='number')throw new Error('Explicit time comparison bound required');
   const recovery:RecoveryInput={expectedGeneration:text(data.expectedGeneration),expectedLastObserved:data.expectedLastObserved,attestedTime:text(data.attestedTime),maxSkewMs:data.maxSkewMs,evidenceId:text(data.evidenceId),operatorRef};
   await operator.recover(recovery);process.stdout.write('{"status":"recovered","allPriorSessionsRevoked":true}\n');
  }else throw new Error('Unknown operator command');
 }finally{await pool.end();}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 main().catch(()=>{process.stderr.write('Operator operation failed; no success confirmed. Inspect authorised database evidence before retrying.\n');process.exitCode=1;});
}
