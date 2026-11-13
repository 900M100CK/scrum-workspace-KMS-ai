import {DocumentController} from './documents.ts';
import {SprintController} from './sprints.ts';
import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import {SessionController} from './session.ts';
import {ProjectWorkspace} from './ProjectWorkspace.tsx';
import {ProjectController} from './projects.ts';
import {TaskController} from './tasks.ts';

export function App({controller:provided}:{controller?:SessionController}={}) {
 const [controller]=useState(()=>provided??new SessionController());
 const state=useSyncExternalStore(controller.subscribe,controller.getSnapshot,controller.getSnapshot);
 const [route,setRoute]=useState(()=>typeof location==='undefined'?'#session':location.hash);
 const feedback=useRef<HTMLParagraphElement>(null),heading=useRef<HTMLHeadingElement>(null);
 const previousPhase=useRef(state.phase);
 const busy=['checking','signing-in','signing-out'].includes(state.phase);
 useEffect(()=>{
  void controller.check();
  const recheck=()=>{if(!['checking','signing-in','signing-out'].includes(controller.getSnapshot().phase))void controller.check();};
  const visible=()=>{if(document.visibilityState==='visible')recheck();};
  const navigate=()=>{setRoute(location.hash);recheck();};
  window.addEventListener('focus',recheck);window.addEventListener('pageshow',recheck);document.addEventListener('visibilitychange',visible);window.addEventListener('hashchange',navigate);
  return()=>{controller.cancel();window.removeEventListener('focus',recheck);window.removeEventListener('pageshow',recheck);document.removeEventListener('visibilitychange',visible);window.removeEventListener('hashchange',navigate);};
 },[controller]);
 useEffect(()=>{
  if(!state.session)return;
  const timer=setTimeout(controller.expire,Math.max(0,Math.min(2147483647,Date.parse(state.session.expires_at)-Date.now())));
  return()=>clearTimeout(timer);
 },[controller,state.session]);
 useEffect(()=>{
  if(state.phase==='unavailable'||(state.phase==='signed-out'&&previousPhase.current==='signing-in'))feedback.current?.focus();
  else if(state.phase==='expired'||state.phase==='authenticated'||(state.phase==='signed-out'&&previousPhase.current==='signing-out'))heading.current?.focus();
  if(state.phase==='signing-out')ProjectController.clearPending();
  previousPhase.current=state.phase;
 },[state.phase]);
 function signIn(event:React.SubmitEvent<HTMLFormElement>){
  event.preventDefault();if(busy)return;
  const form=event.currentTarget,values=new FormData(form),username=String(values.get('username')??''),password=String(values.get('password')??'');
  (form.elements.namedItem('password') as HTMLInputElement).value='';
  void controller.signIn(username,password);
 }
 function signOut(){DocumentController.clearPending();SprintController.clearPending();TaskController.clearPending();void controller.signOut();}
 return <>
  <a className="skip-link" href="#main">Skip to content</a>
  <header className="brand"><span className="brand-mark" aria-hidden="true">tw</span><span translate="no">Threadwork</span></header>
  <main id="main" aria-busy={busy}>
   <section className="session-card" aria-labelledby="session-title">
    <p className="eyebrow">Your workspace</p>
    <h1 id="session-title" tabIndex={-1} ref={heading}>{state.session?'Work and its context, together.':state.phase==='expired'?'Your session has ended.':'A little focus. A clearer day.'}</h1>
    <p className="feedback" role="status" aria-live="polite" tabIndex={-1} ref={feedback}>{state.message}</p>
    {state.session?<>
     <nav aria-label="Workspace"><a href="#session" aria-current={route!=='#workspace'?'page':undefined}>Your session</a><a href="#workspace" aria-current={route==='#workspace'?'page':undefined}>Workspace</a></nav>
     {route==='#workspace'?<ProjectWorkspace key={state.session.user_id} userId={state.session.user_id} onSessionLost={controller.expire}/>:<p className="session-detail">Session available until <time dateTime={state.session.expires_at}>{new Intl.DateTimeFormat(undefined,{dateStyle:'medium',timeStyle:'short'}).format(new Date(state.session.expires_at))}</time></p>}
     <div className="actions"><button className="primary" onClick={signOut}>Sign out</button><button onClick={()=>void controller.check()}>Check session</button></div>
    </>:<>
     {(state.phase==='signed-out'||state.phase==='expired'||state.phase==='signing-in')?<form onSubmit={signIn}>
      <label htmlFor="username">Username</label><input id="username" name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} required disabled={busy}/>
      <label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required disabled={busy}/>
      <button type="submit" className="primary" disabled={busy}>{state.phase==='signing-in'?'Signing in…':'Sign in'}</button>
      <p className="muted">Use the account provided by your workspace administrator.</p>
     </form>:null}
     {state.phase==='unavailable'?<div className="actions"><button className="primary" onClick={()=>void controller.check()}>Check session</button><button onClick={signOut}>Retry sign-out</button></div>:null}
     {busy?<p className="muted">Please wait while your session is confirmed.</p>:null}
    </>}
   </section>
   <p className="scope-note">Projects, membership and task creation are connected. Knowledge features are being prepared.</p>
  </main>
 </>;
}
