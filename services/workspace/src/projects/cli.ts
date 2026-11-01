import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {workspacePool} from '../session/database.ts';
import {WorkspaceProjectOperator} from './operator.ts';

async function main(){
 const url=process.env.SACW_OPERATOR_DATABASE_URL,operatorRef=process.env.SACW_OPERATOR_REF;
 if(!url||!operatorRef)throw new Error('Private operator configuration required');
 let bytes=0;const chunks:Buffer[]=[];
 for await(const chunk of process.stdin){const b=Buffer.from(chunk);bytes+=b.length;if(bytes>8192)throw new Error('Input too large');chunks.push(b);}
 const data=JSON.parse(Buffer.concat(chunks).toString('utf8')) as Record<string,unknown>;
 const text=(name:string)=>{const value=data[name];if(typeof value!=='string'||!value)throw new Error('Required input missing');return value;};
 const pool=workspacePool(url),operator=new WorkspaceProjectOperator(pool);
 try{
  let result:unknown;
  if(process.argv[2]==='state')result=await operator.state(text('user_id'),data.project_id===undefined?undefined:text('project_id'));
  else if(process.argv[2]==='global')result=await operator.global(text('user_id'),data.allowed as boolean,text('expected_revision'),operatorRef,text('reason'));
  else if(process.argv[2]==='project'){
   const action=text('action');if(action!=='membership-manage'&&action!=='project-administrator')throw new Error('Unsupported action');
   result=await operator.project(text('user_id'),text('project_id'),action,data.allowed as boolean,text('expected_revision'),operatorRef,text('reason'));
  }else throw new Error('Unknown command');
  process.stdout.write(JSON.stringify(result)+'\n');
 }finally{await pool.end();}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)main().catch(()=>{
 process.stderr.write('Authority operation not confirmed. Inspect the same target/revision/private audit before retrying.\n');process.exitCode=1;
});
