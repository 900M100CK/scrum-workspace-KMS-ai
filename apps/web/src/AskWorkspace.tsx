import {useEffect, useRef, useState, type FormEvent} from 'react';

type Citation = {source_id: string; document_id: string; version_id: string; passage_id: string};
type Claim = {kind: 'fact' | 'synthesis' | 'uncertain'; text: string; source_ids: string[]};
type Answer =
  | {status: 'insufficient_evidence'; message: string}
  | {status: 'answered' | 'partially_answered' | 'conflict'; claims: Claim[]; citations: Citation[]; missing_components?: string[]};
type Passage = {title: string; excerpt: string; validity: string; version_id: string} |
  {state: 'unavailable'; message: string; version_id: string};

export function AskWorkspace({projectId, onSessionLost}: {projectId: string; onSessionLost: () => void}) {
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [source, setSource] = useState<Passage | null>(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');
  const active = useRef<AbortController | null>(null);
  const prefix = '/api/projects/' + projectId;
  useEffect(() => () => active.current?.abort(), []);

  async function request<T>(path: string, received: (value: T) => void, body?: object) {
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    const {signal} = controller;
    setBusy(true);
    setFeedback('');
    try {
      const response = await fetch(prefix + path, {
        signal, headers: {'x-sacw-request': '1', ...(body ? {'Content-Type': 'application/json'} : {})},
        ...(body ? {method: 'POST', body: JSON.stringify(body)} : {}),
      });
      const value = await response.json();
      if (signal.aborted) return;
      if (response.ok) received(value as T);
      else if (response.status === 401) onSessionLost();
      else {
        if (response.status === 404) setAnswer(null);
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
    void request<Answer>('/questions', setAnswer, {question, scope: input.get('scope')});
  }

  function open(citation: Citation) {
    setSource(null);
    const path = [citation.document_id, citation.version_id, citation.passage_id].map(encodeURIComponent).join('/');
    void request<Passage>('/citations/' + path, setSource);
  }

  return <section className="knowledge-panel" aria-labelledby="ask-heading" aria-busy={busy}>
    <h3 id="ask-heading">Ask project knowledge</h3>
    <form className="keyword-form" onSubmit={submit}>
      <label>Question<textarea name="question" maxLength={1000} required /></label>
      <label>Version scope<select name="scope"><option value="current">Current</option><option value="historical">History</option></select></label>
      <button className="primary" disabled={busy}>Ask question</button>
    </form>
    <p role="status">{busy ? 'Loading knowledge…' : feedback}</p>
    <div className="knowledge-results">
      <div>
        {answer?.status === 'insufficient_evidence' ? <p>{answer.message}</p> : null}
        {answer && answer.status !== 'insufficient_evidence' ? <>
          {answer.status === 'conflict' ? <h4>Conflicting evidence</h4> : null}
          {answer.claims.map((claim, index) => <article className="knowledge-result" key={index}>
            <span className="badge project_shared">{claim.kind === 'fact' ? 'Fact' : claim.kind === 'synthesis' ? 'Synthesis' : 'Uncertain'}</span>
            <p>{claim.text}</p>
            {claim.source_ids.map(id => {
              const citation = answer.citations.find(item => item.source_id === id);
              return citation ? <button key={id} disabled={busy} onClick={() => open(citation)}>Open source {id}</button> : null;
            })}
          </article>)}
          {answer.missing_components?.length ? <section><h4>Missing evidence</h4>
            <ul>{answer.missing_components.map(item => <li key={item}>{item}</li>)}</ul></section> : null}
        </> : null}
      </div>
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
