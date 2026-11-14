import {registerWorkObservations} from './observations/http.ts';
import {projectFailure} from './projects/outcomes.ts';
import {registerSprintHttp,SPRINT_OPERATIONS,type SprintHttpOptions} from './sprints/http.ts';
import {registerDocumentHttp,type DocumentHttpOptions} from './documents/http.ts';
import Fastify from 'fastify';
import {randomUUID} from 'node:crypto';
import type {ServerOptions} from 'node:https';
import type {Writable} from 'node:stream';
import {registerSessionHttp} from './session/http.ts';
import type {SessionHttpOptions} from './session/http.ts';
import {registerProjectHttp} from './projects/http.ts';
import type {ProjectHttpOptions} from './projects/http.ts';
import {registerTaskHttp,TASK_OPERATIONS} from './tasks/http.ts';
import type {TaskHttpOptions} from './tasks/http.ts';
export function buildApp(options:SessionHttpOptions&ProjectHttpOptions&TaskHttpOptions&SprintHttpOptions&Partial<DocumentHttpOptions>&{tls?:ServerOptions;logStream?:Writable}={}) {
 const app = Fastify({
  ...(options.tls?{https:options.tls}:{}),
  logger: options.logStream?{level:'info',stream:options.logStream,serializers:{req:(request:{method:string})=>({method:request.method}),res:(response:{statusCode:number})=>({statusCode:response.statusCode})},redact:['req.headers.cookie','req.body.password','res.headers["set-cookie"]']}:false,
  requestIdHeader:false,genReqId:()=>randomUUID(),
  ajv: { customOptions: { removeAdditional: false, coerceTypes: false, useDefaults: false } },
 });
 app.setErrorHandler((error,_request,reply)=>{
  reply.removeHeader('set-cookie');
  const code=typeof error==='object'&&error!==null&&'statusCode' in error&&typeof error.statusCode==='number'?error.statusCode:503;
  const status=[400,413,415].includes(code)?code:503;
  return reply.code(status).send({code:status===503?'access_unavailable':'validation_failed',message:status===503?'Session unavailable':'Invalid request',run_id:null});
 });
 app.addHook('onRequest', async request => {
  if (request.routeOptions.url === '/internal/observations') return;
  for (const name of ['x-service-key', 'x-actor-session', 'x-actor-user-id']) delete request.headers[name];
 });
 app.register(async scope=>registerSessionHttp(scope,options));
 app.register(async scope=>registerProjectHttp(scope,{...options,documentGuard:options.orchestrator?.guard,taskOperations:options.tasks?TASK_OPERATIONS:new Set(),sprintOperations:options.sprints?SPRINT_OPERATIONS:new Set()}));
 app.register(async scope=>registerTaskHttp(scope,options));
 app.register(async scope=>registerSprintHttp(scope,options));
 if(options.docs&&options.orchestrator){
  app.register(async scope=>registerDocumentHttp(scope,options as DocumentHttpOptions));
  app.register(async scope=>{
   scope.setErrorHandler((error,_request,reply)=>{
    const fault=projectFailure(error);
    return reply.code(fault.status).send(fault.status===404?{code:'not_found',message:'Resource unavailable'}:
     {code:fault.code,message:'Observation unavailable',run_id:null});
   });
   registerWorkObservations(scope,options as DocumentHttpOptions);
  });
 }
 app.get('/healthz', async () => ({ status: 'ok', service: 'workspace' }));
 app.setNotFoundHandler((_request, reply) => reply.code(404).send({ code: 'not_found', message: 'Resource unavailable' }));
 return app;
}
