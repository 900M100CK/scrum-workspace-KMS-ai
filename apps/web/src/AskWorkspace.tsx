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

function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function strings(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

function isResourceId(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(value);
}

function isCitation(value: unknown): value is Citation {
  if (!object(value) || typeof value.source_id !== 'string') return false;
  if (value.kind === 'document') return isResourceId(value.document_id) &&
    isResourceId(value.version_id) && isResourceId(value.passage_id);
  return value.kind === 'operational' && (value.entity_kind === 'project' ||
    value.entity_kind === 'sprint' || value.entity_kind === 'task') &&
    isResourceId(value.entity_id) && typeof value.observed_at === 'string' &&
    Number.isSafeInteger(value.observation_revision);
}

function isAnswer(value: unknown): value is Answer {
  if (!object(value)) return false;
  if (value.status === 'insufficient_evidence') return typeof value.message === 'string';
  return (value.status === 'answered' || value.status === 'partially_answered' || value.status === 'conflict') &&
    Array.isArray(value.claims) && value.claims.every(claim => object(claim) &&
      (claim.kind === 'fact' || claim.kind === 'synthesis' || claim.kind === 'uncertain') &&
      typeof claim.text === 'string' && strings(claim.source_ids)) &&
    Array.isArray(value.citations) && value.citations.every(isCitation) &&
    (strings(value.missing_components) || (value.status !== 'partially_answered' && value.missing_components === undefined));
}

function isPassage(value: unknown): value is Passage {
  return object(value) && typeof value.version_id === 'string' &&
    (value.state === 'unavailable' ? typeof value.message === 'string' :
      !('state' in value) && typeof value.title === 'string' &&
      typeof value.excerpt === 'string' && typeof value.validity === 'string');
}

function isCurrentEntity(value: unknown): value is CurrentEntity {
  return object(value) && Number.isSafeInteger(value.revision) &&
    ['title', 'name', 'goal', 'state'].every(key => value[key] === undefined || typeof value[key] === 'string') &&
    (value.blocked === undefined || typeof value.blocked === 'boolean');
}

function WorkResourcePicker({path, kind, onSessionLost}: {
  path: string; kind: 'task' | 'sprint'; onSessionLost: () => void;
}) {
  const resourceId = useId();
  const [choices, setChoices] = useState<Choice[]>([]);
  const [status, setStatus] = useState('Loading scope…');
  const [more, setMore] = useState(false);
  const load = useRef<(() => void) | null>(null);
  const lost = useRef(onSessionLost);
  lost.current = onSessionLost;

  useEffect(() => {
    const controller = new AbortController();
    const {signal} = controller;
    const seen = new Set<string>();
    const values = new Map<string, Choice>();
    let cursor: string | null = null;
    let loading = false;
    async function loadPage() {
      if (loading || signal.aborted) return;
      loading = true;
      setStatus('Loading scope…');
      try {
        const response = await fetch(path + (cursor ? '?cursor=' + encodeURIComponent(cursor) : ''), {signal});
        if (signal.aborted) return;
        if (response.status === 401) lost.current();
        if (!response.ok) throw new Error('Unavailable scope');
        const page: unknown = await response.json();
        if (signal.aborted) return;
        if (!object(page) || !Array.isArray(page.items) ||
            (page.next_cursor !== null && (typeof page.next_cursor !== 'string' || !page.next_cursor))) {
          throw new Error('Invalid scope page');
        }
        for (const item of page.items) {
          if (!object(item)) throw new Error('Invalid scope item');
          const id = item[kind + '_id'];
          const label = item[kind === 'task' ? 'title' : 'goal'];
          if (!isResourceId(id) || typeof label !== 'string') throw new Error('Invalid scope item');
          values.set(id, {id, label});
        }
        cursor = page.next_cursor;
        const repeated = cursor !== null && seen.has(cursor);
        if (cursor !== null) seen.add(cursor);
        setChoices([...values.values()]);
        setMore(cursor !== null && !repeated);
        setStatus(repeated ? 'No more resources could be loaded.' :
          (values.size || cursor ? '' : 'No readable resources.'));
      } catch {
        if (!signal.aborted) {
          setChoices([]);
          setMore(false);
          setStatus('Scope unavailable.');
        }
      } finally {
        loading = false;
      }
    }
    load.current = () => { void loadPage(); };
    load.current();
    return () => { controller.abort(); load.current = null; };
  }, [kind, path]);

  return <div>
    <label htmlFor={resourceId}>Resource</label>
    <select id={resourceId} name="resource" required defaultValue="">
      <option value="" disabled>Select a resource</option>
      {choices.map(choice => <option key={choice.id} value={choice.id}>{choice.label}</option>)}
    </select>
    {more ? <button type="button" disabled={status !== ''} onClick={() => load.current?.()}>Load more resources</button> : null}
    {status ? <p role="status">{status}</p> : null}
  </div>;
}

export function AskWorkspace({projectId, onSessionLost}: {projectId: string; onSessionLost: () => void}) {
  const [mode,setMode] = useState<'documents'|'work'>('documents');
  const [kind,setKind] = useState<ScopeKind>('project');
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

  async function request<T>(path: string, valid: (value: unknown) => value is T,
    received: (value: T) => void, body?: object) {
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
      if (signal.aborted) return;
      if (response.status === 401) { lost.current(); return; }
      const value: unknown = await response.json().catch(() => null);
      if (signal.aborted) return;
      if (response.ok) {
        if (valid(value)) received(value);
        else setFeedback(body ? 'Question service returned an invalid response. You can still use Search.' : 'Source unavailable.');
      } else {
        const error = object(value) ? value : {};
        if (response.status === 404 || (!body && response.status === 503)) setAnswer(null);
        setFeedback(response.status === 404 ? 'Resource unavailable.' :
          error.code === 'answer_withheld' ? 'Unable to provide this answer.' :
          response.status === 400 ? 'Check the question and try again.' :
          error.message === 'Question provider timed out' ? 'Question provider timed out. You can still use Search.' :
          error.message === 'Question provider budget exhausted' ? 'Question provider budget exhausted. You can still use Search.' :
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
    const resource = input.get('resource');
    if (!question || (mode === 'work' && kind !== 'project' && !resource)) return;
    setAnswer(null);
    setSource(null);
    setOperational(null);
    const selector = mode === 'work' ? {kind,...(kind==='project'?{}:{id:resource}),
      include_documents:input.has('documents')} : undefined;
    void request(prefix+'/questions', isAnswer, setAnswer, {question, scope: input.get('scope'),
      ...(selector ? {current_work:selector} : {})});
  }

  function open(citation: Citation, original?:string) {
    setSource(null);
    setOperational(null);
    if (citation.kind === 'operational') {
      const path = '/api/'+citation.entity_kind+'s/'+encodeURIComponent(citation.entity_id);
      void request(path,isCurrentEntity,entity=>setOperational({citation,entity,...(original ? {original} : {})}));
      return;
    }
    const path = [citation.document_id, citation.version_id, citation.passage_id].map(encodeURIComponent).join('/');
    void request(prefix+'/citations/' + path, isPassage, setSource);
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
        {kind!=='project'?<WorkResourcePicker key={prefix + kind} kind={kind}
          path={prefix + (kind === 'task' ? '/tasks' : '/sprints')} onSessionLost={onSessionLost}/>:null}
        <label><input type="checkbox" name="documents"/> Include document evidence</label>
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
