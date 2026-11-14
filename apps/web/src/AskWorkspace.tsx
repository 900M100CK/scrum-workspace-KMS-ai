import {useEffect, useId, useRef, useState, type FormEvent} from 'react';

type OperationalCitation = {kind:'operational'; source_id:string; entity_kind:'project'|'sprint'|'task'; entity_id:string;
  observed_at:string; observation_revision:number};
type Citation = OperationalCitation |
  {kind:'document'; source_id:string; document_id:string; version_id:string; passage_id:string};
type Choice = {id:string; label:string};
type ScopeKind = 'project'|'sprint'|'task';
type CurrentEntity = {title?:string; name?:string; goal?:string; blocked?:boolean; state?:string; revision:number};
type Claim = {kind: 'fact' | 'synthesis' | 'uncertain'; text: string; source_ids: string[]};
type Answer =
  | {status: 'insufficient_evidence'; message: string}
  | {status: 'answered' | 'partially_answered' | 'conflict'; claims: Claim[]; citations: Citation[]; missing_components?: string[]};
type Passage = {title: string; excerpt: string; validity: string; version_id: string} |
  {state: 'unavailable'; message: string; version_id: string};

export function AskWorkspace({projectId, onSessionLost}: {projectId: string; onSessionLost: () => void}) {
  const resourceId = useId();
  const [mode,setMode] = useState<'documents'|'work'>('documents');
  const [kind,setKind] = useState<ScopeKind>('project');
  const [choices,setChoices] = useState<Choice[]>([]);
  const [optionsStatus,setOptionsStatus] = useState('');
  const [operational,setOperational] = useState<{citation:OperationalCitation; entity:CurrentEntity; original?:string} | null>(null);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [source, setSource] = useState<Passage | null>(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');
  const active = useRef<AbortController | null>(null);
  const prefix = '/api/projects/' + projectId;
  const lost = useRef(onSessionLost);
  lost.current = onSessionLost;
  useEffect(() => () => active.current?.abort(), []);

  useEffect(() => {
    setChoices([]);
    setOptionsStatus('');
    if (mode !== 'work' || kind === 'project') return;
    const controller = new AbortController();
    async function load() {
      const path = prefix + (kind === 'task' ? '/tasks' : '/sprints');
      let cursor: string | null = null;
      const values: Choice[] = [];
      setOptionsStatus('Loading scope…');
      try {
        do {
          const response = await fetch(path + (cursor ? '?cursor='+encodeURIComponent(cursor) : ''),{signal:controller.signal});
          if (controller.signal.aborted) return;
          if (response.status === 401) {lost.current();return;}
          if (!response.ok) throw new Error('Unavailable scope');
          const page: {items:Array<{task_id?:string;sprint_id?:string;title?:string;goal?:string}>;next_cursor:string|null} = await response.json();
          for (const item of page.items) values.push({id:item.task_id??item.sprint_id!,label:item.title??item.goal!});
          cursor = page.next_cursor;
        } while (cursor && !controller.signal.aborted);
        if (!controller.signal.aborted) {
          setChoices(values);
          setOptionsStatus(values.length?'':'No readable resources.');
        }
      } catch {
        if (!controller.signal.aborted) setOptionsStatus('Scope unavailable.');
      }
    }
    void load();
    return () => controller.abort();
  },[mode,kind,prefix]);

  async function request<T>(path: string, received: (value: T) => void, body?: object) {
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    const {signal} = controller;
    setBusy(true);
    setFeedback('');
    try {
      const response = await fetch(path, {
        signal, headers: {'x-sacw-request': '1', ...(body ? {'Content-Type': 'application/json'} : {})},
        ...(body ? {method: 'POST', body: JSON.stringify(body)} : {}),
      });
      const value = await response.json();
      if (signal.aborted) return;
      if (response.ok) received(value as T);
      else if (response.status === 401) onSessionLost();
      else {
        if (response.status === 404 || (!body && response.status === 503)) setAnswer(null);
        setFeedback(response.status === 404 ? 'Resource unavailable.' :
          value.code === 'answer_withheld' ? 'Unable to provide this answer.' :
          response.status === 400 ? 'Check the question and try again.' :
          value.message === 'Question provider timed out' ? 'Question provider timed out. You can still use Search.' :
          value.message === 'Question provider budget exhausted' ? 'Question provider budget exhausted. You can still use Search.' :
          'Question service unavailable. You can still use Search.');
      }
    } catch {
      if (!signal.aborted) setFeedback(body ?
        'The outcome is unknown. To start a new question, submit it yourself.' : 'Source unavailable.');
    } finally {
      if (!signal.aborted) setBusy(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = new FormData(event.currentTarget);
    const question = String(input.get('question') ?? '').trim();
    if (!question) return;
    setAnswer(null);
    setSource(null);
    setOperational(null);
    const selector = mode === 'work' ? {kind,...(kind==='project'?{}:{id:input.get('resource')}),
      include_documents:input.has('documents')} : undefined;
    void request<Answer>(prefix+'/questions', setAnswer, {question, scope: input.get('scope'),
      ...(selector ? {current_work:selector} : {})});
  }

  function open(citation: Citation, original?:string) {
    setSource(null);
    setOperational(null);
    if (citation.kind === 'operational') {
      const path = '/api/'+citation.entity_kind+'s/'+encodeURIComponent(citation.entity_id);
      void request<CurrentEntity>(path,entity=>setOperational({citation,entity,...(original ? {original} : {})}));
      return;
    }
    const path = [citation.document_id, citation.version_id, citation.passage_id].map(encodeURIComponent).join('/');
    void request<Passage>(prefix+'/citations/' + path, setSource);
  }

  return <section className="knowledge-panel" aria-labelledby="ask-heading" aria-busy={busy}>
    <h3 id="ask-heading">Ask project knowledge</h3>
    <form className="keyword-form" onSubmit={submit}>
      <label>Question<textarea name="question" maxLength={1000} required /></label>
      <label>Ask mode<select value={mode} onChange={event=>setMode(event.currentTarget.value==='work'?'work':'documents')}>
        <option value="documents">Documents</option><option value="work">Current work</option></select></label>
      {mode==='work'?<>
        <label>Work scope<select value={kind} onChange={event=>setKind(event.currentTarget.value as ScopeKind)}>
          <option value="project">Project</option><option value="sprint">Sprint</option><option value="task">Task</option></select></label>
        {kind!=='project'?<div><label htmlFor={resourceId}>Resource</label><select id={resourceId} key={kind} name="resource" required defaultValue="">
          <option value="" disabled>Select a resource</option>
          {choices.map(choice=><option key={choice.id} value={choice.id}>{choice.label}</option>)}
        </select></div>:null}
        <label><input type="checkbox" name="documents"/> Include document evidence</label>
        {optionsStatus?<p role="status">{optionsStatus}</p>:null}
      </>:null}
      <label>Version scope<select name="scope"><option value="current">Current</option><option value="historical">History</option></select></label>
      <button className="primary" disabled={busy}>Ask question</button>
    </form>
    <p role="status">{busy ? 'Loading knowledge…' : feedback}</p>
    <div className="knowledge-results">
      <div>
        {mode==='work'&&!answer&&!busy?<p>Original cited observation unavailable. Ask a question to capture a new observation.</p>:null}
        {answer?.status === 'insufficient_evidence' ? <p>{answer.message}</p> : null}
        {answer && answer.status !== 'insufficient_evidence' ? <>
          {answer.status === 'conflict' ? <h4>Conflicting evidence</h4> : null}
          {answer.claims.map((claim, index) => <article className="knowledge-result" key={index}>
            <span className="badge project_shared">{claim.kind === 'fact' ? 'Fact' : claim.kind === 'synthesis' ? 'Synthesis' : 'Uncertain'}</span>
            <p>{claim.text}</p>
            {claim.source_ids.map(id => {
              const citation = answer.citations.find(item => item.source_id === id);
              return citation ? <button key={id} disabled={busy} onClick={() => open(citation,claim.text)}>Open source {id}</button> : null;
            })}
          </article>)}
          {answer.missing_components?.length ? <section><h4>Missing evidence</h4>
            <ul>{answer.missing_components.map(item => <li key={item}>{item}</li>)}</ul></section> : null}
        </> : null}
      </div>
      {operational ? <aside className="knowledge-result" aria-label="Work citation">
        <button onClick={()=>setOperational(null)}>Close source</button>
        <h4>Original cited observation</h4>
        <p>{operational.original ?? 'Original cited observation unavailable.'}</p>
        <p>{operational.citation.observed_at} · Observation {operational.citation.observation_revision}</p>
        <h4>Current state</h4>
        <p>{operational.entity.title??operational.entity.goal??operational.entity.name}</p>
        <p>{typeof operational.entity.blocked==='boolean'?(operational.entity.blocked?'Blocked':'Not blocked'):operational.entity.state} · Revision {operational.entity.revision}</p>
        <button disabled={busy} onClick={()=>open(operational.citation,operational.original)}>Refresh current state</button>
      </aside> : null}
      {source ? <aside className="knowledge-result" aria-label="Cited passage">
        <button onClick={() => setSource(null)}>Close source</button>
        {'state' in source ? <p>{source.message}</p> : <>
          <h4>{source.title}</h4>
          <p className="muted">{source.validity} · Version {source.version_id}</p>
          <blockquote>{source.excerpt}</blockquote>
        </>}
      </aside> : null}
    </div>
  </section>;
}
