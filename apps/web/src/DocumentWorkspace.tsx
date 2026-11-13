import {RelatedResources} from './KnowledgeDiscovery.tsx';
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

  function handleRevise(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!detail) return;
    const values = new FormData(e.currentTarget);
    const content = String(values.get('content') ?? '').trim();
    if (!content) return;
    void controller.revise(detail.document.document_id, content, detail.document.revision);
  }

  return (
    <section className="document-workspace" aria-labelledby="documents-title" aria-busy={state.busy}>
      {state.recoveryPending && (
        <button type="button" disabled={state.busy} onClick={() => void controller.retryPending()}>
          Retry pending version change
        </button>
      )}
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
          <RelatedResources key={detail.document.document_id} projectId={projectId} endpoint={{kind:detail.document.kind,id:detail.document.document_id}} onSessionLost={onSessionLost}/>
          <h5 id="doc-detail-title">{detail.document.title}</h5>
          <span className={`badge ${detail.document.classification}`}>
            {detail.document.classification === 'project_shared' ? 'Shared' : 'Restricted'}
          </span>
          <p className="muted">Revision {detail.document.revision}</p>

          {detail.viewingVersion ? (
            <div className="viewing-version-banner" role="region" aria-label="Historical version alert">
              <p>
                <strong>Viewing Historical Version</strong> ({detail.viewingVersion.state.toUpperCase()}) — Created at{' '}
                {detail.viewingVersion.created_at}
              </p>
              <div className="version-banner-actions">
                <button type="button" onClick={() => controller.closeVersionView()} disabled={locked}>
                  Return to Current version
                </button>
                {detail.viewingVersion.state !== 'archived' ? (
                  <button
                    type="button"
                    onClick={() =>
                      void controller.archiveVersion(
                        detail.document.document_id,
                        detail.viewingVersion!.version_id,
                        detail.document.revision
                      )
                    }
                    disabled={locked}
                  >
                    Archive this version
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="document-content">
            <pre>{detail.viewingVersion ? detail.viewingVersion.content : detail.content}</pre>
          </div>

          {!detail.viewingVersion ? (
            <form onSubmit={handleRevise} className="revise-document-form">
              <h6>Publish Revision</h6>
              <label htmlFor="revision-content">New revision content (Text / Markdown)</label>
              <textarea
                id="revision-content"
                name="content"
                rows={5}
                required
                defaultValue={detail.content}
                disabled={locked}
              />
              <button type="submit" className="primary" disabled={locked}>
                Publish revision
              </button>
            </form>
          ) : null}

          <section className="version-history-section" aria-labelledby="version-history-title">
            <h6 id="version-history-title">Version History</h6>
            {!detail.versions || detail.versions.length === 0 ? (
              <p>No historical versions recorded.</p>
            ) : (
              <ul className="version-list">
                {detail.versions.map((ver) => (
                  <li key={ver.version_id} className={`version-item ${ver.state}`}>
                    <span className={`badge ${ver.state}`}>{ver.state.toUpperCase()}</span>
                    <span className="version-date">{ver.created_at}</span>
                    <button
                      type="button"
                      disabled={locked}
                      onClick={() => void controller.openVersion(detail.document.document_id, ver.version_id)}
                    >
                      View version
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {detail.nextVersionCursor && (
              <button type="button" disabled={state.busy} onClick={() => void controller.loadMoreVersions()}>
                Load more versions
              </button>
            )}
          </section>

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
