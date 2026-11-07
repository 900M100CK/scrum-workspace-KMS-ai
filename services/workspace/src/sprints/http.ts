import type {FastifyInstance} from 'fastify';
import cookie from '@fastify/cookie';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {Ajv2020} from 'ajv/dist/2020.js';
import {SESSION_COOKIE,sessionOrigin} from '../session/http.ts';
import {sessionValidators} from '../session/schemas.ts';
import {ProjectFault,projectFailure} from '../projects/outcomes.ts';
import type {WorkspaceSprintStore} from './store.ts';
import type {SprintOperation,CreateSprint,Allocation,ExpectedRevision,Reorder} from './types.ts';
const addFormats=createRequire(import.meta.url)('ajv-formats') as typeof import('ajv-formats').default;
const api=JSON.parse(readFileSync(new URL('../../../../contracts/openapi/workspace.openapi.json',import.meta.url),'utf8'));
const ajv=new Ajv2020({strict:false,removeAdditional:false,coerceTypes:false,useDefaults:false});addFormats(ajv);ajv.addSchema({$id:'urn:sacw:sprints',components:api.components});
export const sprintValidators=Object.fromEntries(['Sprint','SprintList','SprintItemList','SprintCompletion','ReorderResult','CreateSprint','Allocation','ExpectedRevision','Reorder','EditSprint'].map(name=>[name,ajv.compile({$ref:'urn:sacw:sprints#/components/schemas/'+name})]));
export const SPRINT_OPERATIONS:ReadonlySet<string>=new Set(['createSprint','listSprints','getSprint','listSprintItems','allocateTask','startSprint','completeSprint','reorderBacklog','editSprint','removeAllocation']);
export interface SprintHttpOptions {sprints?:WorkspaceSprintStore;origin?:string}
const responses=(status:number,name:string)=>Object.fromEntries([[status,{$ref:'urn:sacw:sprints#/components/schemas/'+name}],...[400,401,403,404,409,413,415,503].map(n=>[n,{}])]);
export async function registerSprintHttp(app:FastifyInstance,options:SprintHttpOptions){
 await app.register(cookie);const origin=options.origin?sessionOrigin(options.origin):null;
 app.setSerializerCompiler(({httpStatus,schema})=>{
  const status=Number(httpStatus),validator=status>=400?sessionValidators.Error!:ajv.compile(schema as object);
  return value=>{
   if(status===404){if(JSON.stringify(value)!==JSON.stringify({code:'not_found',message:'Resource unavailable'}))throw Error('Invalid not-found output');}
   else if(!validator(value))throw Error('Invalid Sprint response');
   return JSON.stringify(value);
  };
 });
 app.addHook('onRequest',async(request,reply)=>{
  reply.header('Cache-Control','no-store');
  if(!options.sprints||!origin)throw new ProjectFault(503,'access_unavailable');
  const fields=(request.headers.cookie??'').split(';').filter(v=>v.trim().split('=')[0]===SESSION_COOKIE);
  if(fields.length!==1||!request.cookies[SESSION_COOKIE])throw new ProjectFault(401,'authentication_required');
  if(!['GET','HEAD'].includes(request.method)&&(request.headers.origin!==origin||request.headers['x-sacw-request']!=='1'))throw new ProjectFault(403,'forbidden');
 });
 app.setErrorHandler((error,_request,reply)=>{
  const native=error&&typeof error==='object'&&'statusCode' in error?Number(error.statusCode):0;
  const fault=[400,413,415].includes(native)?new ProjectFault(native,'validation_failed'):projectFailure(error);
  return reply.code(fault.status).send(fault.status===404?{code:'not_found',message:'Resource unavailable'}:{code:fault.code,message:fault.status===401?'Authentication required':fault.status===503?'Access unavailable':fault.status===409?'State conflict':'Request denied',run_id:null});
 });
 for(const [url,operation,requestName,responseName,status] of [
 ['/projects/:project_id/sprints','createSprint','CreateSprint','Sprint',201],['/sprints/:sprint_id/items','allocateTask','Allocation','Sprint',200],['/sprints/:sprint_id/start','startSprint','ExpectedRevision','Sprint',200],['/sprints/:sprint_id/complete','completeSprint','ExpectedRevision','SprintCompletion',200],['/projects/:project_id/backlog-order','reorderBacklog','Reorder','ReorderResult',200]
 ] as const){app.post(url,{bodyLimit:operation==='reorderBacklog'?1048576:8192,onRequest:async request=>{if(!/^application\/json(?:\s*;|$)/i.test(request.headers['content-type']??''))throw new ProjectFault(415,'validation_failed');},schema:{response:responses(status,responseName)}},async(request,reply)=>{
  if(Object.keys(request.query as object).length||!sprintValidators[requestName]!(request.body))throw new ProjectFault(400,'validation_failed');
  const key=request.headers['idempotency-key'];if(typeof key!=='string'||!key)throw new ProjectFault(400,'validation_failed');
  const params=request.params as {sprint_id?:string;project_id?:string};const result=await options.sprints!.execute(request.cookies[SESSION_COOKIE]!,operation as SprintOperation,(params.sprint_id??params.project_id)!,request.body as CreateSprint|Allocation|ExpectedRevision|Reorder,key,request.id);return reply.code(result.status).send(result.body);
 });}
 app.patch('/sprints/:sprint_id',{bodyLimit:8192,onRequest:async request=>{if(!/^application\/json(?:\s*;|$)/i.test(request.headers['content-type']??''))throw new ProjectFault(415,'validation_failed');},schema:{response:responses(200,'Sprint')}},async(request,reply)=>{
  if(Object.keys(request.query as object).length||!sprintValidators.EditSprint!(request.body))throw new ProjectFault(400,'validation_failed');
  const key=request.headers['idempotency-key'];if(typeof key!=='string'||!key)throw new ProjectFault(400,'validation_failed');
  const result=await options.sprints!.execute(request.cookies[SESSION_COOKIE]!,'editSprint',(request.params as {sprint_id:string}).sprint_id,request.body as ExpectedRevision,key,request.id);return reply.code(result.status).send(result.body);
 });
 app.delete('/sprints/:sprint_id/items/:task_id',{bodyLimit:8192,schema:{response:responses(200,'Sprint')}},async(request,reply)=>{
  const header=request.headers['x-expected-revision'],key=request.headers['idempotency-key'];
  if(request.body!==undefined||Object.keys(request.query as object).length||typeof header!=='string'||! /^[1-9][0-9]*$/.test(header)||!Number.isSafeInteger(Number(header))||typeof key!=='string'||!key)throw new ProjectFault(400,'validation_failed');
  const params=request.params as {sprint_id:string;task_id:string};
  const result=await options.sprints!.execute(request.cookies[SESSION_COOKIE]!,'removeAllocation',params.sprint_id,{task_id:params.task_id,expected_revision:Number(header)},key,request.id);return reply.code(result.status).send(result.body);
 });
 for(const [url,kind,responseName] of [['/projects/:project_id/sprints','list','SprintList'],['/sprints/:sprint_id','get','Sprint'],['/sprints/:sprint_id/items','items','SprintItemList']] as const){app.get(url,{schema:{response:responses(200,responseName)}},async request=>{
  const q=request.query as Record<string,unknown>;if(Object.keys(q).some(k=>k!=='cursor'||kind==='get')||(q.cursor!==undefined&&(typeof q.cursor!=='string'||!q.cursor)))throw new ProjectFault(400,'validation_failed');
  const p=request.params as {sprint_id?:string;project_id?:string},token=request.cookies[SESSION_COOKIE]!;
  return kind==='get'?options.sprints!.get(token,p.sprint_id!):kind==='list'?options.sprints!.list(token,p.project_id!,q.cursor as string|undefined):options.sprints!.items(token,p.sprint_id!,q.cursor as string|undefined);
 });}
}
