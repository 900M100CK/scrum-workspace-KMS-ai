export interface Session {user_id:string;expires_at:string}
export type SessionState={phase:'checking'|'signing-in'|'signing-out'|'signed-out'|'expired'|'unavailable';session:null;message:string}|{phase:'authenticated';session:Session;message:string};
type Method='GET'|'POST'|'DELETE';
type Transport=(input:string,init:RequestInit)=>Promise<Response>;
const messages={signedOut:'Sign in to your workspace.',expired:'Your session has ended. Sign in again.',unavailable:'Unable to confirm your session. Check your connection and try again.'};
function sessionBody(value:unknown):value is Session{
 if(typeof value!=='object'||value===null)return false;
 const body=value as Record<string,unknown>;
 return Object.keys(body).sort().join(',')==='expires_at,user_id'&&typeof body.user_id==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.user_id)&&typeof body.expires_at==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z$/.test(body.expires_at)&&Number.isFinite(Date.parse(body.expires_at))&&new Date(body.expires_at).toISOString().slice(0,19)===body.expires_at.slice(0,19);
}

/** Only the server cookie authenticates. This memory state is a UI observation, never authority. */
export class SessionController {
 private state:SessionState={phase:'checking',session:null,message:'Checking your session…'};
 private listeners=new Set<()=>void>();
 private generation=0;
 private request:AbortController|null=null;
 private transport:Transport;
 constructor(transport:Transport=(input,init)=>fetch(input,init)){this.transport=transport;}
 getSnapshot=():SessionState=>this.state;
 subscribe=(listener:()=>void):(()=>void)=>{this.listeners.add(listener);return()=>this.listeners.delete(listener);};
 private publish(state:SessionState):void{this.state=state;for(const listener of this.listeners)listener();}
 cancel=():void=>{this.generation++;this.request?.abort();this.request=null;};
 expire=():void=>{this.cancel();this.publish({phase:'expired',session:null,message:messages.expired});};
 check=():Promise<void>=>this.run('GET');
 signIn=(username:string,password:string):Promise<void>=>this.run('POST',{username,password});
 signOut=():Promise<void>=>this.run('DELETE');
 private async run(method:Method,credentials?:{username:string;password:string}):Promise<void>{
  const hadSession=this.state.session!==null||this.state.phase==='expired';
  this.cancel();const generation=this.generation,request=new AbortController();this.request=request;
  this.publish({phase:method==='GET'?'checking':method==='POST'?'signing-in':'signing-out',session:null,message:method==='GET'?'Checking your session…':method==='POST'?'Signing in…':'Signing out…'});
  const timeout=setTimeout(()=>request.abort(),10000);
  try{
   const response=await this.transport('/api/session',{method,credentials:'same-origin',cache:'no-store',redirect:'error',signal:request.signal,headers:{'X-SACW-Request':'1',...(credentials?{'Content-Type':'application/json'}:{})},...(credentials?{body:JSON.stringify(credentials)}:{})});
   if(generation!==this.generation)return;
   if(method==='DELETE'){
    if(response.status!==204)throw new Error('Unconfirmed sign-out');
    this.publish({phase:'signed-out',session:null,message:'You have signed out.'});return;
   }
   if(response.status===401){this.publish({phase:method==='GET'&&hadSession?'expired':'signed-out',session:null,message:method==='POST'?'Unable to sign in. Check your username and password.':hadSession?messages.expired:messages.signedOut});return;}
   if(response.status!==200||!response.headers.get('content-type')?.includes('application/json'))throw new Error('Unavailable session');
   const body:unknown=await response.json();if(generation!==this.generation)return;
   if(!sessionBody(body))throw new Error('Invalid session');
   // A local clock can hide UI early; it never authorizes a server operation or renews a session.
   if(Date.parse(body.expires_at)<=Date.now()){this.expire();return;}
   this.publish({phase:'authenticated',session:body,message:'You are signed in.'});
  }catch{
   if(generation===this.generation)this.publish({phase:'unavailable',session:null,message:method==='DELETE'?'Sign-out could not be confirmed. Your workspace is hidden. Retry sign-out or check your session.':method==='POST'?'Sign-in could not be confirmed. Check your session before trying again.':messages.unavailable});
  }finally{clearTimeout(timeout);if(generation===this.generation)this.request=null;}
 }
}
