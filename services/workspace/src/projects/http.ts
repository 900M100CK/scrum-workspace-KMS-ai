import type {FastifyInstance} from 'fastify';
import cookie from '@fastify/cookie';
import {SESSION_COOKIE,sessionOrigin} from '../session/http.ts';
import {WorkspaceProjectStore} from './store.ts';
import {ProjectFault,projectFailure} from './outcomes.ts';
import {sessionValidators} from '../session/schemas.ts';
import {readFileSync} from 'node:fs';
import {Ajv2020} from 'ajv/dist/2020.js';

const api=JSON.parse(readFileSync(new URL('../../../../contracts/openapi/workspace.openapi.json',import.meta.url),'utf8'));
const ajv=new Ajv2020({strict:false,removeAdditional:false,coerceTypes:false,useDefaults:false});
ajv.addSchema({$id:'urn:sacw:projects',components:api.components});
export const projectValidators=Object.fromEntries(['CreateProject','AddMember','Project','ProjectList','Member','MemberList','AllowedActions'].map(name=>[name,ajv.compile({$ref:`urn:sacw:projects#/components/schemas/${name}`})]));
const responses=(status:number,name:string)=>Object.fromEntries([[status,{$ref:`urn:sacw:projects#/components/schemas/${name}`}],...[400,401,403,404,409,413,415,503].map(n=>[n,{}])]);
export interface ProjectHttpOptions {projects?:WorkspaceProjectStore;origin?:string}
export async function registerProjectHttp(app:FastifyInstance,options:ProjectHttpOptions){
 await app.register(cookie);const origin=options.origin?sessionOrigin(options.origin):null;
 app.setSerializerCompiler(({httpStatus,schema})=>{
  const status=Number(httpStatus),validator=status>=400?sessionValidators.Error!:ajv.compile(schema as object);
  return value=>{
   if(status===404){if(JSON.stringify(value)!==JSON.stringify({code:'not_found',message:'Resource unavailable'}))throw new Error('Invalid not-found output');}
   else if(!validator(value))throw new Error('Invalid project response');
   return JSON.stringify(value);
  };
 });
 app.addHook('onRequest',async(request,reply)=>{
  reply.header('Cache-Control','no-store');
  if(!options.projects||!origin)throw new ProjectFault(503,'access_unavailable');
  const fields=(request.headers.cookie??'').split(';').filter(v=>v.trim().split('=')[0]===SESSION_COOKIE);
  if(fields.length!==1||!request.cookies[SESSION_COOKIE])throw new ProjectFault(401,'authentication_required');
  if(!['GET','HEAD'].includes(request.method)&&(request.headers.origin!==origin||request.headers['x-sacw-request']!=='1'))throw new ProjectFault(403,'forbidden');
 });
 app.setErrorHandler((error,_request,reply)=>{
  const native=error&&typeof error==='object'&&'statusCode' in error?Number(error.statusCode):0;
  const fault=[400,413,415].includes(native)?new ProjectFault(native,'validation_failed'):projectFailure(error);
  const body=fault.status===404?{code:'not_found',message:'Resource unavailable'}:{code:fault.code,message:fault.status===401?'Authentication required':fault.status===503?'Access unavailable':fault.status===409?'State conflict':'Request denied',run_id:null};
  return reply.code(fault.status).send(body);
 });
 app.addHook('preSerialization',async(_request,reply,payload)=>{
  if(reply.statusCode>=400){if(reply.statusCode===404){if(JSON.stringify(payload)!==JSON.stringify({code:'not_found',message:'Resource unavailable'}))throw new Error('Invalid denial');}else if(!sessionValidators.Error!(payload))throw new Error('Invalid error output');}
  return payload;
 });
 app.post('/projects',{bodyLimit:8192,schema:{response:responses(201,'Project')}},async(request,reply)=>{
  if(!projectValidators.CreateProject!(request.body)||Object.keys(request.query as object).length)throw new ProjectFault(400,'validation_failed');
  const key=request.headers['idempotency-key'];if(typeof key!=='string'||!key)throw new ProjectFault(400,'validation_failed');
  const result=await options.projects!.create(request.cookies[SESSION_COOKIE]!,request.body as {name:string;description?:string},key,request.id);
  if(!projectValidators.Project!(result.body))throw new Error('Invalid project output');return reply.code(result.status).send(result.body);
 });
 app.get('/projects',{schema:{response:responses(200,'ProjectList')}},async(request)=>{
  const q=request.query as Record<string,unknown>;
  if(Object.keys(q).some(k=>k!=='cursor')||(q.cursor!==undefined&&(typeof q.cursor!=='string'||!q.cursor)))throw new ProjectFault(400,'validation_failed');
  return options.projects!.list(request.cookies[SESSION_COOKIE]!,q.cursor as string|undefined);
 });
 app.get('/projects/:project_id',{schema:{response:responses(200,'Project')}},async(request)=>{
  if(Object.keys(request.query as object).length)throw new ProjectFault(400,'validation_failed');
  return options.projects!.get(request.cookies[SESSION_COOKIE]!,(request.params as {project_id:string}).project_id);
 });
 app.post('/projects/:project_id/members',{bodyLimit:8192,schema:{response:responses(201,'Member')}},async(request,reply)=>{
  if(!projectValidators.AddMember!(request.body)||Object.keys(request.query as object).length)throw new ProjectFault(400,'validation_failed');
  const key=request.headers['idempotency-key'];if(typeof key!=='string'||!key)throw new ProjectFault(400,'validation_failed');
  const result=await options.projects!.add(request.cookies[SESSION_COOKIE]!, (request.params as {project_id:string}).project_id,request.body as {user_id:string;role:string},key,request.id);
  return reply.code(result.status).send(result.body);
 });
 app.get('/projects/:project_id/members',{schema:{response:responses(200,'MemberList')}},async(request)=>{
  const q=request.query as Record<string,unknown>;
  if(Object.keys(q).some(k=>!['cursor','limit'].includes(k))||(q.cursor!==undefined&&(typeof q.cursor!=='string'||!q.cursor))||(q.limit!==undefined&&(typeof q.limit!=='string'||!/^\d{1,3}$/.test(q.limit))))throw new ProjectFault(400,'validation_failed');
  return options.projects!.members(request.cookies[SESSION_COOKIE]!, (request.params as {project_id:string}).project_id,q.limit===undefined?50:Number(q.limit),q.cursor as string|undefined);
 });
 app.delete('/projects/:project_id/members/:user_id',{bodyLimit:8192,schema:{response:{...responses(204,'Member'),204:{type:'null'}}}},async(request,reply)=>{
  const key=request.headers['idempotency-key'],expected=request.headers['x-expected-revision'];
  if(typeof key!=='string'||!key||typeof expected!=='string'||request.body!==undefined||Object.keys(request.query as object).length)throw new ProjectFault(400,'validation_failed');
  const params=request.params as {project_id:string;user_id:string};
  await options.projects!.remove(request.cookies[SESSION_COOKIE]!,params.project_id,params.user_id,expected,key,request.id);return reply.code(204).send();
 });
 app.get('/access/allowed-actions',{schema:{response:responses(200,'AllowedActions')}},async(request)=>{
  const q=request.query as Record<string,unknown>,kind=q.resource_kind,ids=['project_id','resource_id','document_id','version_id'];
  if(Object.keys(q).some(k=>!['resource_kind',...ids].includes(k))||typeof kind!=='string'||!['global','project','task','sprint','document','version','link','run'].includes(kind)||Object.values(q).some(v=>typeof v!=='string'||!v))throw new ProjectFault(400,'validation_failed');
  const supplied=ids.filter(k=>q[k]!==undefined),expected=kind==='global'?[]:kind==='project'?['project_id']:kind==='version'?['project_id','document_id','version_id']:['project_id','resource_id'];
  if(supplied.sort().join(',')!==expected.sort().join(','))throw new ProjectFault(400,'validation_failed');
  return options.projects!.actions(request.cookies[SESSION_COOKIE]!,kind,q.project_id as string|undefined);
 });
}
