import {useEffect, useId, useRef, useState, type FormEvent} from 'react';

type Kind = 'task' | 'sprint' | 'document' | 'decision';
type Endpoint = {kind: Kind; id: string};
type Link = {link_id: string; from_kind: Kind; from_id: string; to_kind: Kind; to_id: string; relation: string};
type Passage = {document_id: string; version_id: string; passage_id: string; title: string; excerpt: string; validity: string};
type Page<T> = {items: T[]; next_cursor: string | null};
type Query = {query: string; scope: 'current' | 'historical'};
type Version = {version_id: string; state: string; content: string};
type Choice = Endpoint & {label: string};

class ResponseError extends Error {
  readonly status: number;
  constructor(status: number) { super('Request rejected'); this.status = status; }
}

async function api<T>(path: string, signal: AbortSignal, body?: object, key?: string): Promise<T> {
  const result = await fetch('/api' + path, {
    signal, headers: {'x-sacw-request': '1', ...(body ? {'Content-Type': 'application/json'} : {}),
      ...(key ? {'Idempotency-Key': key} : {})},
    ...(body ? {method: 'POST', body: JSON.stringify(body)} : {}),
  });
  if (!result.ok) throw new ResponseError(result.status);
  return result.json();
}

function useRequest(onSessionLost: () => void) {
  const active = useRef<AbortController | null>(null);
  const lost = useRef(onSessionLost);
  lost.current = onSessionLost;
  useEffect(() => () => active.current?.abort(), []);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');
  async function run(work: (signal: AbortSignal) => Promise<void>, failed: (error: unknown) => void) {
    active.current?.abort();
    const request = new AbortController();
    active.current = request;
    setBusy(true);
    setFeedback('');
    try {
      await work(request.signal);
    } catch (error) {
      if (request.signal.aborted) return;
      failed(error);
      const status = error instanceof ResponseError ? error.status : 0;
      if (status === 401) lost.current();
      else setFeedback(status === 404 ? 'Resource unavailable.' :
        status === 403 ? 'This action is unavailable for your account.' :
        status === 409 ? 'Results changed. Refresh to start again.' :
        status === 400 ? 'Check the request and try again.' : 'Knowledge is temporarily unavailable.');
    } finally {
      if (!request.signal.aborted) setBusy(false);
    }
  }
  return {run, busy, feedback, setFeedback};
}

export function KeywordWorkspace({projectId, onSessionLost}: {projectId: string; onSessionLost: () => void}) {
  const {run, busy, feedback, setFeedback} = useRequest(onSessionLost);
  const [results, setResults] = useState<Passage[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [query, setQuery] = useState<Query | null>(null);
  const [source, setSource] = useState<{title: string; version: Version} | null>(null);
  const prefix = '/projects/' + projectId;
  function clear() {setResults([]); setCursor(null); setSource(null);}
  function search(input: Query, after?: string) {
    if (!after) clear();
    setSource(null);
    setQuery(input);
    void run(async signal => {
      const page = await api<Page<Passage>>(prefix + '/search/keyword', signal, {...input, ...(after ? {cursor: after} : {})});
      if (signal.aborted) return;
      setResults(previous => after ? [...previous, ...page.items] : page.items);
      setCursor(page.next_cursor);
      if (!after && !page.items.length) setFeedback('No matching passages.');
    }, clear);
  }
  function open(item: Passage) {
    setSource(null);
    void run(async signal => {
      const version = await api<Version>(prefix + '/documents/' + item.document_id + '/versions/' + item.version_id, signal);
      if (!signal.aborted) setSource({title: item.title, version});
    }, clear);
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const text = String(values.get('query') ?? '').trim();
    if (text) search({query: text, scope: values.get('scope') === 'historical' ? 'historical' : 'current'});
  }
  return <section className="knowledge-panel" aria-labelledby="keyword-heading" aria-busy={busy}>
    <h3 id="keyword-heading">Search knowledge</h3>
    <form className="keyword-form" onSubmit={submit}>
      <label>Keyword<input name="query" type="search" maxLength={300} required /></label>
      <label>Version scope<select name="scope"><option value="current">Current</option><option value="historical">History</option></select></label>
      <button className="primary" disabled={busy}>Search</button>
    </form>
    <p role="status">{busy ? 'Loading knowledge…' : feedback}</p>
    <div className="knowledge-results">
      <div>{results.map(item => <article className="knowledge-result" key={item.document_id + item.version_id + item.passage_id}>
        <button disabled={busy} onClick={() => open(item)}>{item.title}</button>
        <span className="badge project_shared">{item.validity}</span>
        <p>{item.excerpt}</p><small>Version {item.version_id}</small>
      </article>)}
      {cursor && query ? <button disabled={busy} onClick={() => search(query, cursor)}>More results</button> : null}</div>
      {source ? <aside className="knowledge-result" aria-label="Source detail">
        <button onClick={() => setSource(null)}>Close source</button>
        <h4>{source.title}</h4><p>{source.version.state} · {source.version.version_id}</p>
        <div className="document-content"><pre>{source.version.content}</pre></div>
      </aside> : null}
    </div>
  </section>;
}

export function RelatedResources({projectId, endpoint, onSessionLost}: {
  projectId: string; endpoint: Endpoint; onSessionLost: () => void;
}) {
  const heading = useId();
  const {run, busy, feedback, setFeedback} = useRequest(onSessionLost);
  const [links, setLinks] = useState<Link[]>([]);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [detail, setDetail] = useState<string | null>(null);
  const [next, setNext] = useState<string | null>(null);
  const [allowed, setAllowed] = useState(false);
  const [pending, setPending] = useState<{body: object; key: string} | null>(null);
  const prefix = '/projects/' + projectId;
  function clear() {setLinks([]); setChoices([]); setNext(null); setDetail(null); setAllowed(false);}
  async function read(signal: AbortSignal, after?: string) {
    const query = new URLSearchParams({from_id: endpoint.id, ...(after ? {cursor: after} : {})});
    const page = await api<Page<Link>>(prefix + '/links?' + query, signal);
    const rights = after ? null : await api<{actions: string[]}>(prefix + '/links/allowed-actions', signal);
    if (signal.aborted) return;
    setLinks(old => after ? [...old, ...page.items] : page.items);
    setNext(page.next_cursor);
    if (rights) setAllowed(rights.actions.includes('createLink'));
    if (!after && !page.items.length) setFeedback('No related resources.');
  }
  function load(after?: string) {
    if (!after) clear();
    void run(signal => read(signal, after), clear);
  }
  function targets() {
    setChoices([]);
    void run(async signal => {
      async function all<T>(path: string) {
        const items: T[] = [];
        let cursor: string | null = null;
        do {
          const page: Page<T> = await api<Page<T>>(prefix + path + (cursor ? '?' + new URLSearchParams({cursor}) : ''), signal);
          items.push(...page.items);
          cursor = page.next_cursor;
        } while (cursor && !signal.aborted);
        return items;
      }
      const [documents, tasks, sprints] = await Promise.all([
        all<{document_id: string; title: string; kind: 'document' | 'decision'}>('/documents'),
        all<{task_id: string; title: string}>('/tasks'),
        all<{sprint_id: string; goal: string}>('/sprints'),
      ]);
      if (signal.aborted) return;
      const visible = [
        ...documents.map(item => ({kind: item.kind, id: item.document_id, label: item.title})),
        ...tasks.map(item => ({kind: 'task' as const, id: item.task_id, label: item.title})),
        ...sprints.map(item => ({kind: 'sprint' as const, id: item.sprint_id, label: item.goal})),
      ].filter(choice => choice.id !== endpoint.id || choice.kind !== endpoint.kind);
      setChoices(visible);
      if (!visible.length) setFeedback('No resources available to link.');
    }, clear);
  }
  function save(command: {body: object; key: string}) {
    setPending(command);
    void run(async signal => {
      await api<Link>(prefix + '/links', signal, command.body, command.key);
      if (signal.aborted) return;
      setPending(null);
      setChoices([]);
      await read(signal);
    }, error => {
      if (error instanceof ResponseError && [400, 403, 404].includes(error.status)) setPending(null);
      clear();
    });
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const target = choices.find(choice => choice.kind + ':' + choice.id === form.get('target'));
    const relation = String(form.get('relation') ?? '').trim();
    if (!target || !relation || pending) return;
    save({key: crypto.randomUUID(), body: {
      from_kind: endpoint.kind, from_id: endpoint.id, to_kind: target.kind, to_id: target.id, relation,
    }});
  }
  function open(target: Endpoint) {
    setDetail(null);
    void run(async signal => {
      const url = target.kind === 'task' ? '/tasks/' : target.kind === 'sprint' ? '/sprints/' : prefix + '/documents/';
      const value = await api<{title?: string; goal?: string; description?: string; document?: {title: string}; content?: string}>(url + target.id, signal);
      if (!signal.aborted) setDetail([value.title ?? value.goal ?? value.document?.title, value.description ?? value.content].filter(Boolean).join('\n'));
    }, clear);
  }
  return <section className="knowledge-panel related-resources" aria-labelledby={heading} aria-busy={busy}>
    <h5 id={heading}>Related resources</h5>
    <p role="status">{busy ? 'Loading resources…' : feedback}</p>
    <div className="actions">
      <button type="button" disabled={busy} onClick={() => load()}>Load related resources</button>
      {allowed && !pending ? <button type="button" disabled={busy} onClick={targets}>Choose a resource to link</button> : null}
      {pending ? <button type="button" disabled={busy} onClick={() => save(pending)}>Retry original link</button> : null}
    </div>
    {links.length ? <ul>{links.map(link => {
      const target = link.from_id === endpoint.id && link.from_kind === endpoint.kind
        ? {kind: link.to_kind, id: link.to_id} : {kind: link.from_kind, id: link.from_id};
      return <li key={link.link_id}><button type="button" disabled={busy} onClick={() => open(target)}>Open {target.kind} · {link.relation}</button></li>;
    })}</ul> : null}
    {next ? <button type="button" disabled={busy} onClick={() => load(next)}>More links</button> : null}
    {detail ? <div className="document-content"><pre>{detail}</pre></div> : null}
    {choices.length ? <form onSubmit={submit}>
      <div><label htmlFor={heading + "-target"}>Resource</label><select id={heading + "-target"} name="target" required><option value="">Select a resource</option>
        {choices.map(choice => <option key={choice.kind + ':' + choice.id} value={choice.kind + ':' + choice.id}>{choice.kind} · {choice.label}</option>)}
      </select></div>
      <label>Relationship<input name="relation" defaultValue="relates to" required maxLength={120} /></label>
      <button disabled={busy}>Create link</button>
    </form> : null}
  </section>;
}
