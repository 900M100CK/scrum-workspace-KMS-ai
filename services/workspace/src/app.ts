import Fastify from 'fastify';
import {randomUUID} from 'node:crypto';
import type {ServerOptions} from 'node:https';
import type {Writable} from 'node:stream';
import {registerSessionHttp} from './session/http.ts';
import type {SessionHttpOptions} from './session/http.ts';
export function buildApp(options:SessionHttpOptions&{tls?:ServerOptions;logStream?:Writable}={}) {
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
 app.register(async scope=>registerSessionHttp(scope,options));
 app.get('/healthz', async () => ({ status: 'ok', service: 'workspace' }));
 app.setNotFoundHandler((_request, reply) => reply.code(404).send({ code: 'not_found', message: 'Resource unavailable' }));
 return app;
}
