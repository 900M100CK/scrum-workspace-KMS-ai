import {randomBytes} from 'node:crypto';
import {resolve} from 'node:path';
import {docker,image,migrate,root,waitReady} from '../../scripts/database.mjs';
import {workspacePool} from '../../services/workspace/src/session/database.ts';

export async function sessionFixture(){
 const name=`sp01-p08-test-${randomBytes(6).toString('hex')}`,volume=name+'-data';
 const passwords={POSTGRES_PASSWORD:randomBytes(24).toString('hex'),WORKSPACE_DB_PASSWORD:randomBytes(24).toString('hex'),KNOWLEDGE_DB_PASSWORD:randomBytes(24).toString('hex')};
 const pools=[];let started=false,created=false;
 let admin,runtime;
 function url(user,password,database){const port=docker(['port',name,'5432/tcp']).stdout.trim().split(':').at(-1);return `postgresql://${user}:${password}@127.0.0.1:${port}/${database}`;}
 function connections(){admin=workspacePool(url('postgres',passwords.POSTGRES_PASSWORD,'workspace_db'));runtime=workspacePool(url('workspace_app',passwords.WORKSPACE_DB_PASSWORD,'workspace_db'));pools.push(admin,runtime);}
 async function close(){
  await Promise.all(pools.map(pool=>pool.ending?undefined:pool.end()));
  if(!/^sp01-p08-test-[a-f0-9]{12}$/.test(name)||volume!==name+'-data')throw new Error('Unsafe task resource');
  if(started)docker(['rm','--force',name]);if(created)docker(['volume','rm',volume]);
 }
 try{
  docker(['volume','create','--label','sacw.task=SP01-P08',volume]);created=true;
  docker(['run','-d','--name',name,'--label','sacw.task=SP01-P08','-e','POSTGRES_PASSWORD','-e','WORKSPACE_DB_PASSWORD','-e','KNOWLEDGE_DB_PASSWORD','-e','POSTGRES_INITDB_ARGS=--auth-host=scram-sha-256','--mount',`type=volume,source=${volume},target=/var/lib/postgresql/data`,'--publish','127.0.0.1::5432','-v',`${resolve(root,'infra/postgres/bootstrap.sh')}:/docker-entrypoint-initdb.d/10-bootstrap.sh:ro`,'-v',`${resolve(root,'infra/postgres/bootstrap.sql')}:/bootstrap.sql:ro`,image],{env:passwords});started=true;
  await waitReady(name);migrate(name,'workspace');connections();
  return {name,volume,image,get admin(){return admin;},get runtime(){return runtime;},get runtimeEnvironment(){return {SACW_WORKSPACE_DATABASE_URL:url('workspace_app',passwords.WORKSPACE_DB_PASSWORD,'workspace_db')};},get operatorEnvironment(){return {SACW_OPERATOR_DATABASE_URL:url('postgres',passwords.POSTGRES_PASSWORD,'workspace_db'),SACW_OPERATOR_REF:'synthetic-cli-operator'};},migrate(){migrate(name,'workspace');},async restart(){await Promise.all([admin.end(),runtime.end()]);docker(['restart','--time','10',name]);await waitReady(name);connections();},extraPool(database){const pool=workspacePool(url('workspace_app',passwords.WORKSPACE_DB_PASSWORD,database));pools.push(pool);return pool;},close};
 }catch(error){await close();throw error;}
}
