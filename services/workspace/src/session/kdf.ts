import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import type { PasswordVerifier } from './ports.ts';

export const KDF_PARAMETERS = Object.freeze({N:131072,r:8,p:1,maxmem:192*1024*1024});
export class KdfBusy extends Error { constructor(){super('Authentication capacity unavailable');} }
export class InvalidCredential extends Error { constructor(){super('Stored credential unavailable');} }

function parse(encoded:string): {salt:Buffer;hash:Buffer} {
 if(encoded.length>512)throw new InvalidCredential();
 const fields=encoded.split('$');
 if(fields.length!==7||fields[0]!=='scrypt'||fields[1]!=='v1'||fields[2]!=='131072'||fields[3]!=='8'||fields[4]!=='1')throw new InvalidCredential();
 const saltText=fields[5]!,hashText=fields[6]!;
 const salt=Buffer.from(saltText,'base64url'),hash=Buffer.from(hashText,'base64url');
 if(salt.length<16||salt.length>64||hash.length!==32||salt.toString('base64url')!==saltText||hash.toString('base64url')!==hashText)throw new InvalidCredential();
 return {salt,hash};
}

/** One instance per process. Async scrypt shares libuv; this is not a deployment capacity SLA. */
export class ScryptVerifier implements PasswordVerifier {
 private static active=0;
 readonly dummyCredential=`scrypt$v1$131072$8$1$${randomBytes(16).toString('base64url')}$${randomBytes(32).toString('base64url')}`;
 private async run(password:string,salt:Buffer):Promise<Buffer>{
  if(Buffer.byteLength(password,'utf8')>8192)throw new RangeError('Credential input too large');
  if(ScryptVerifier.active>=2)throw new KdfBusy();
  ScryptVerifier.active++;
  try{return await new Promise<Buffer>((resolve,reject)=>scrypt(password,salt,32,KDF_PARAMETERS,(error,key)=>error?reject(error):resolve(key)));}finally{ScryptVerifier.active--;}
 }
 async hash(password:string):Promise<string>{
  const salt=randomBytes(16),hash=await this.run(password,salt);
  return `scrypt$v1$131072$8$1$${salt.toString('base64url')}$${hash.toString('base64url')}`;
 }
 async verify(password:string,encoded:string):Promise<boolean>{
  const {salt,hash}=parse(encoded);
  return timingSafeEqual(await this.run(password,salt),hash);
 }
}
