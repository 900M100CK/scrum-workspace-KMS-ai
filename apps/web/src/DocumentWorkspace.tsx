import {useEffect, useRef, useState, useSyncExternalStore} from 'react';
import {DocumentController, type DocumentClassification} from './documents.ts';

export function DocumentWorkspace({
  userId,
  projectId,
  onSessionLost,
  controller: provided,
}: {
  userId: string;
  projectId: string;
  onSessionLost: () => void;
  controller?: DocumentController;
}) {
  const [controller] = useState(() => provided ?? new DocumentController(userId, projectId, onSessionLost));
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
  const feedback = useRef<HTMLParagraphElement>(null);
  const previousBusy = useRef(false);

  useEffect(() => {
    void controller.refresh();
    return () => controller.cancel();
  }, [controller]);

  useEffect(() => {
    if (previousBusy.current && !state.busy) feedback.current?.focus();
    previousBusy.current = state.busy;
  }, [state.busy]);

  const locked = state.busy;
  const detail = state.detail;

  function handleCreate(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const values = new FormData(form);
    const title = String(values.get('title') ?? '').trim();
    const classification = String(values.get('classification') ?? 'restricted') as DocumentClassification;
    const content = String(values.get('content') ?? '').trim();

    if (!title || !content) return;
    void controller.create(title, classification, content);
    form.reset();
  }

  function handleGrant(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!detail?.policy) return;
    const values = new FormData(e.currentTarget);
    const targetUserId = String(values.get('user_id') ?? '').trim();
    if (!targetUserId) return;
    void controller.grantRead(detail.document.document_id, targetUserId, detail.policy.permission_revision);
    e.currentTarget.reset();
  }

  function handleSetClassification(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!detail?.policy) return;
    const values = new FormData(e.currentTarget);
    const newClass = String(values.get('classification') ?? '') as DocumentClassification;
    void controller.setClassification(detail.document.document_id, newClass, detail.policy.permission_revision);
  }

  return (
    <section className="document-workspace" aria-labelledby="documents-title" aria-busy={state.busy}>
      <h4 id="documents-title">Documents</h4>
      <p role="status" aria-live="polite" tabIndex={-1} ref={feedback} className="feedback">
        {state.message}
      </p>

      <div className="actions">
        <button disabled={state.busy} onClick={() => void controller.refresh()}>
          Refresh documents
        </button>
      </div>

      {!state.busy && !detail ? (
        <>
          <h5>Project Documents</h5>
          {!state.items.length ? (
            <p>No readable documents in this project.</p>
          ) : (
            <ul className="document-list">
              {state.items.map((doc) => (
                <li key={doc.document_id}>
                  <button onClick={() => void controller.open(doc.document_id)} className="document-link">
                    {doc.title}
                  </button>
                  <span className={`badge ${doc.classification}`}>
                    {doc.classification === 'project_shared' ? 'Shared' : 'Restricted'}
                  </span>
                  <p className="muted">Revision {doc.revision}</p>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleCreate} autoComplete="off" className="create-document-form">
            <h5>Create a Document</h5>
            <label htmlFor="doc-title">Document title</label>
            <input id="doc-title" name="title" required disabled={locked} />

            <label htmlFor="doc-classification">Classification</label>
            <select id="doc-classification" name="classification" defaultValue="restricted" disabled={locked}>
              <option value="restricted">Restricted (Grant access explicitly)</option>
              <option value="project_shared">Project Shared (Readable by all members)</option>
            </select>

            <label htmlFor="doc-content">Content (Text / Markdown)</label>
            <textarea id="doc-content" name="content" rows={5} required disabled={locked} />

            <button type="submit" className="primary" disabled={locked}>
              Create document
            </button>
          </form>
        </>
      ) : null}

      {!state.busy && detail ? (
        <article className="document-detail" aria-labelledby="doc-detail-title">
          <h5 id="doc-detail-title">{detail.document.title}</h5>
          <span className={`badge ${detail.document.classification}`}>
            {detail.document.classification === 'project_shared' ? 'Shared' : 'Restricted'}
          </span>
          <p className="muted">Revision {detail.document.revision}</p>

          <div className="document-content">
            <pre>{detail.content}</pre>
          </div>

          <div className="actions">
            <button onClick={() => void controller.open(detail.document.document_id)} disabled={locked}>
              Refresh document
            </button>
            <button onClick={() => void controller.refresh()} disabled={locked}>
              Back to documents
            </button>
          </div>

          {detail.policy ? (
            <section className="access-management-section" aria-labelledby="access-mgmt-title">
              <h5 id="access-mgmt-title">Manage Access</h5>
              <p className="muted">Policy permission revision: {detail.policy.permission_revision}</p>

              <form onSubmit={handleSetClassification} className="inline-form">
                <label htmlFor="change-classification">Change classification</label>
                <select
                  id="change-classification"
                  name="classification"
                  defaultValue={detail.policy.classification}
                  disabled={locked}
                >
                  <option value="restricted">Restricted</option>
                  <option value="project_shared">Project Shared</option>
                </select>
                <button type="submit" disabled={locked}>
                  Update classification
                </button>
              </form>

              <h6>Current Read Grantees</h6>
              {!detail.grants || detail.grants.length === 0 ? (
                <p>No individual read grants recorded.</p>
              ) : (
                <ul className="grant-list">
                  {detail.grants.map((g) => (
                    <li key={g.user_id}>
                      <span className="member-id">{g.user_id}</span>
                      <button
                        type="button"
                        disabled={locked}
                        onClick={() =>
                          void controller.revokeRead(
                            detail.document.document_id,
                            g.user_id,
                            detail.policy!.permission_revision
                          )
                        }
                      >
                        Revoke
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <form onSubmit={handleGrant} className="grant-read-form">
                <label htmlFor="grant-user-id">Grant read to member (User ID)</label>
                <input
                  id="grant-user-id"
                  name="user_id"
                  placeholder="00000000-0000-0000-0000-000000000000"
                  required
                  disabled={locked}
                  pattern="[0-9a-fA-F-]{36}"
                />
                <button type="submit" className="primary" disabled={locked}>
                  Grant read
                </button>
              </form>
            </section>
          ) : null}
        </article>
      ) : null}
    </section>
  );
}
