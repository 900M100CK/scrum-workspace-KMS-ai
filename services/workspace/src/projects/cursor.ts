import {createHmac,timingSafeEqual} from 'node:crypto';
import {ProjectFault,invalid,conflict} from './outcomes.ts';

export interface CursorKey {kid:string;key:Buffer}
export function cursorKey(value:string|undefined):CursorKey|null{
 if(value===undefined)return null;
 try{
  const parsed=JSON.parse(value);
  if(!parsed||Object.keys(parsed).sort().join(',')!=='key,kid'||typeof parsed.kid!=='string'||!/^[A-Za-z0-9_-]{1,32}$/.test(parsed.kid)||typeof parsed.key!=='string')throw new Error();
  const key=Buffer.from(parsed.key,'base64');if(key.length!==32||key.toString('base64')!==parsed.key)throw new Error();
  return {kid:parsed.kid,key};
 }catch{throw new ProjectFault(503,'access_unavailable');}
}
export class ProjectCursor {
 private readonly config:CursorKey;
 readonly ttlSeconds:number;
 constructor(config:CursorKey,ttlSeconds=300){
  if(config.key.length!==32||!Number.isSafeInteger(ttlSeconds)||ttlSeconds<1||ttlSeconds>3600)throw new ProjectFault(503,'access_unavailable');
  this.config={kid:config.kid,key:Buffer.from(config.key)};this.ttlSeconds=ttlSeconds;
 }
 fingerprint(value:unknown):string{return createHmac('sha256',this.config.key).update(JSON.stringify(value)).digest('base64url');}
 encode(scope:string,generation:string,after:string,now:number):string{
  const payload=Buffer.from(JSON.stringify([1,this.config.kid,scope,generation,after,now+this.ttlSeconds*1000])).toString('base64url');
  return payload+'.'+this.fingerprint(['cursor',payload]);
 }
 decode(token:string,scope:string,generation:string,now:number,validAfter:(value:string)=>boolean=value=>/^[0-9a-f-]{36}$/.test(value)):string{
  if(token.length>4096||!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]{43}$/.test(token))throw invalid();
  const [payload,mac]=token.split('.');const expected=Buffer.from(this.fingerprint(['cursor',payload!]),'base64url'),actual=Buffer.from(mac!,'base64url');
  if(actual.length!==32||actual.toString('base64url')!==mac||!timingSafeEqual(actual,expected))throw invalid();
  let decoded:unknown;try{const raw=Buffer.from(payload!,'base64url');if(raw.toString('base64url')!==payload)throw new Error();decoded=JSON.parse(raw.toString('utf8'));}catch{throw invalid();}
  if(!Array.isArray(decoded)||decoded.length!==6||decoded[0]!==1||decoded[1]!==this.config.kid||decoded[2]!==scope||typeof decoded[3]!=='string'||typeof decoded[4]!=='string'||!validAfter(decoded[4])||!Number.isSafeInteger(decoded[5]))throw invalid();
  if(decoded[5]<=now||decoded[3]!==generation)throw conflict();return decoded[4];
 }
}
