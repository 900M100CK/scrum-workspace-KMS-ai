import {workspacePool} from './database.ts';
import {WorkspaceSessionStore} from './store.ts';
import {readSessionPolicy} from './config.ts';
import {sessionOrigin} from './http.ts';

export function sessionRuntime(environment:Record<string,string|undefined>){
 const connectionString=environment.SACW_WORKSPACE_DATABASE_URL,configuredOrigin=environment.SACW_SESSION_ORIGIN;
 if(connectionString===undefined&&configuredOrigin===undefined)return null;
 if(!connectionString||!configuredOrigin)throw new Error('Both runtime Workspace database URL and session origin are required');
 let url:URL;try{url=new URL(connectionString);}catch{throw new Error('Invalid Workspace runtime database configuration');}
 if(!['postgres:','postgresql:'].includes(url.protocol)||decodeURIComponent(url.username)!=='workspace_app'||url.pathname!=='/workspace_db')throw new Error('Use the Workspace runtime database identity');
 const origin=sessionOrigin(configuredOrigin),policy=readSessionPolicy(environment),pool=workspacePool(connectionString);
 return {pool,origin,store:new WorkspaceSessionStore(pool,policy)};
}
