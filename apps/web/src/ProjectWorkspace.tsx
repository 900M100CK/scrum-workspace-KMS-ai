import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import {ProjectController,type Member} from './projects.ts';

export function ProjectWorkspace({userId,onSessionLost,controller:provided}:{userId:string;onSessionLost:()=>void;controller?:ProjectController}){
 const [controller]=useState(()=>provided??new ProjectController(userId,onSessionLost));
 const state=useSyncExternalStore(controller.subscribe,controller.getSnapshot,controller.getSnapshot);
 useEffect(()=>{void controller.refresh();return()=>controller.cancel();},[controller]);
 const [removing,setRemoving]=useState<Member|null>(null);
 const feedback=useRef<HTMLParagraphElement>(null),previousBusy=useRef(false);
 useEffect(()=>{if(previousBusy.current&&!state.busy)feedback.current?.focus();previousBusy.current=state.busy;if(state.busy)setRemoving(null);},[state.busy]);
 const locked=state.busy||state.pending;
 function create(event:React.SubmitEvent<HTMLFormElement>){event.preventDefault();const values=new FormData(event.currentTarget);void controller.create(String(values.get('name')??''),String(values.get('description')??''));}
 function add(event:React.SubmitEvent<HTMLFormElement>){event.preventDefault();const values=new FormData(event.currentTarget);void controller.add(String(values.get('user_id')??''),String(values.get('role')??''));}
 return <section className="project-workspace" aria-labelledby="workspace-title" aria-busy={state.busy}>
  <p className="eyebrow">Workspace</p><h2 id="workspace-title">Your projects</h2>
  <p role="status" aria-live="polite" tabIndex={-1} ref={feedback}>{state.message}</p>
  <div className="actions"><button onClick={()=>void controller.refresh()} disabled={state.busy}>Refresh projects</button>{state.pending?<button className="primary" disabled={state.busy} onClick={()=>void controller.retry()}>Check original operation</button>:null}</div>
  {!state.busy&&!state.project?<>
   <ul className="project-list">{state.projects.map(p=><li key={p.project_id}><button onClick={()=>void controller.select(p.project_id)}>{p.name}</button><p>{p.description}</p></li>)}</ul>
   {!state.projects.length&&!state.message?<p>You have no projects yet.</p>:null}
   {state.projectCursor?<button onClick={()=>void controller.moreProjects()}>More projects</button>:null}
   {state.global.includes('createProject')?<form onSubmit={create} autoComplete="off"><h3>Create a project</h3><label htmlFor="project-name">Name</label><input id="project-name" name="name" maxLength={200} required disabled={locked}/><label htmlFor="project-description">Description</label><textarea id="project-description" name="description" maxLength={4000} disabled={locked}/><button className="primary" disabled={locked}>Create project</button></form>:null}
  </>:null}
  {state.project?<section aria-labelledby="selected-project-title"><h3 id="selected-project-title">{state.project.name}</h3><p>{state.project.description}</p><p className="muted">Project revision {state.project.revision}</p><h3>Members</h3>
   <ul className="member-list">{state.members.map(m=><li key={m.user_id}><div><span className="member-id" translate="no">{m.user_id}</span><p className="muted">{m.role.replaceAll('_',' ')} · revision {m.revision}</p></div>{state.actions.includes('removeMember')?<button disabled={locked} aria-label={'Remove member '+m.user_id} onClick={()=>setRemoving(m)}>Remove</button>:null}</li>)}</ul>
   {removing?<div className="removal-confirmation" role="group" aria-label="Confirm member removal"><p>Remove member <span translate="no">{removing.user_id}</span>? This revokes individual access and clears current task assignments. Rejoining does not restore old grants.</p><button disabled={locked} onClick={()=>void controller.remove(removing)}>Confirm removal</button><button disabled={locked} onClick={()=>setRemoving(null)}>Cancel removal</button></div>:null}
   {state.memberCursor?<button disabled={state.busy} onClick={()=>void controller.moreMembers()}>More members</button>:null}
   {state.actions.includes('addMember')?<form onSubmit={add} autoComplete="off"><h3>Add a member</h3><label htmlFor="member-user-id">Registered user ID</label><input id="member-user-id" name="user_id" autoCapitalize="none" spellCheck={false} required disabled={locked} pattern="[0-9a-fA-F-]{36}"/><label htmlFor="member-role">Descriptive role</label><select id="member-role" name="role" defaultValue="viewer" disabled={locked}>{['viewer','developer','scrum_master','product_owner'].map(role=><option key={role} value={role}>{role.replaceAll('_',' ')}</option>)}</select><p className="muted">A role describes participation. Access is granted separately.</p><button className="primary" disabled={locked}>Add member</button></form>:null}
  </section>:null}
 </section>;
}
