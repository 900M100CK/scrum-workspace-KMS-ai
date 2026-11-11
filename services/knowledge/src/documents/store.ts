import {randomUUID, createHash} from 'node:crypto';
import type {Pool} from 'pg';
import type {PersistDocumentInput, KnowledgeDocument, DocumentKind} from './types.ts';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (s: string) => typeof s === 'string' && uuidRegex.test(s);
export const requestHash = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex');

export class KnowledgeFault extends Error {
  readonly status: number;
  readonly code: string;
  constructor(status: number, code: string) {
    super(code);
    this.status = status;
    this.code = code;
  }
}

export const invalid = () => new KnowledgeFault(400, 'validation_failed');
export const missing = () => new KnowledgeFault(404, 'not_found');
export const conflict = () => new KnowledgeFault(409, 'state_conflict');

export function splitPassages(content: string): string[] {
  const rawBlocks = content.split(/\n\s*\n/);
  const passages: string[] = [];
  for (const block of rawBlocks) {
    const trimmed = block.trim();
    if (trimmed.length > 0) {
      passages.push(trimmed);
    }
  }
  return passages.length > 0 ? passages : [content.trim()];
}

export class KnowledgeDocumentStore {
  readonly pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async persistDocument(
    actor: string,
    input: PersistDocumentInput,
    key: string,
    correlation: string = randomUUID()
  ): Promise<{status: 200 | 201; document: KnowledgeDocument}> {
    if (!isUuid(actor) || !input || typeof input !== 'object') throw invalid();
    if (!isUuid(input.document_id) || !isUuid(input.project_id) || !isUuid(input.owner_id)) throw invalid();
    if (typeof input.title !== 'string' || !input.title.trim()) throw invalid();
    if (typeof input.content !== 'string' || !input.content.trim()) throw invalid();
    if (typeof key !== 'string' || !key) throw invalid();

    const kind: DocumentKind = input.kind === 'decision' ? 'decision' : 'document';
    const labels = Array.isArray(input.labels) ? input.labels.filter(l => typeof l === 'string') : [];
    const hash = requestHash(['persistDocument', input.document_id, input.project_id, input.owner_id, input.title.trim(), kind, labels, input.content]);

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const existing = (
        await client.query(
          `SELECT payload_hash, state, result_ref FROM knowledge.idempotency_record
            WHERE actor_id = $1 AND operation = 'persistDocument' AND idempotency_key = $2`,
          [actor, key]
        )
      ).rows[0];

      if (existing) {
        if (existing.payload_hash !== hash || existing.state !== 'committed') {
          await client.query('ROLLBACK');
          throw conflict();
        }
        const docRow = (
          await client.query(
            `SELECT document_id, project_id, kind, title, owner_id, labels, current_version_id, revision::text rev
               FROM knowledge.document WHERE document_id = $1`,
            [existing.result_ref]
          )
        ).rows[0];
        if (!docRow) {
          await client.query('ROLLBACK');
          throw conflict();
        }
        await client.query('COMMIT');
        return {
          status: 200,
          document: {
            document_id: docRow.document_id,
            project_id: docRow.project_id,
            kind: docRow.kind,
            title: docRow.title,
            owner_id: docRow.owner_id,
            labels: docRow.labels,
            current_version_id: docRow.current_version_id,
            revision: Number(docRow.rev),
          },
        };
      }

      const docExists = (
        await client.query('SELECT 1 FROM knowledge.document WHERE document_id = $1', [input.document_id])
      ).rowCount;
      if (docExists && docExists > 0) {
        await client.query('ROLLBACK');
        throw conflict();
      }

      const versionId = randomUUID();

      await client.query(
        `INSERT INTO knowledge.document(document_id, project_id, kind, title, owner_id, labels, current_version_id, revision, processing_generation, unavailable)
          VALUES($1, $2, $3, $4, $5, $6, $7, 1, 1, false)`,
        [input.document_id, input.project_id, kind, input.title.trim(), input.owner_id, labels, versionId]
      );

      await client.query(
        `INSERT INTO knowledge.document_version(document_id, version_id, state, immutable_content, revision)
          VALUES($1, $2, 'current', $3, 1)`,
        [input.document_id, versionId, input.content]
      );

      const passages = splitPassages(input.content);
      for (let i = 0; i < passages.length; i++) {
        await client.query(
          `INSERT INTO knowledge.passage(document_id, version_id, passage_id, locator, immutable_excerpt)
            VALUES($1, $2, $3, $4, $5)`,
          [input.document_id, versionId, randomUUID(), `p:${i + 1}`, passages[i]]
        );
      }

      await client.query(
        `INSERT INTO knowledge.business_audit(event_id, actor_id, project_id, action, entity_id, correlation_id, after_ref)
          VALUES($1, $2, $3, 'document-create', $4, $5, $6)`,
        [
          randomUUID(),
          actor,
          input.project_id,
          input.document_id,
          correlation,
          JSON.stringify({version_id: versionId, passages: passages.length}),
        ]
      );

      await client.query(
        `INSERT INTO knowledge.idempotency_record(actor_id, operation, idempotency_key, payload_hash, state, result_ref, expires_at)
          VALUES($1, 'persistDocument', $2, $3, 'committed', $4, 'infinity')`,
        [actor, key, hash, input.document_id]
      );

      await client.query('COMMIT');

      return {
        status: 201,
        document: {
          document_id: input.document_id,
          project_id: input.project_id,
          kind,
          title: input.title.trim(),
          owner_id: input.owner_id,
          labels,
          current_version_id: versionId,
          revision: 1,
        },
      };
    } catch (error) {
      try {
        await client.query('ROLLBACK');
      } catch {}
      throw error;
    } finally {
      client.release();
    }
  }

  async getDocument(documentId: string): Promise<{document: KnowledgeDocument; content: string} | null> {
    if (!isUuid(documentId)) return null;
    const res = await this.pool.query(
      `SELECT d.document_id, d.project_id, d.kind, d.title, d.owner_id, d.labels, d.current_version_id, d.revision::text rev,
              v.immutable_content
         FROM knowledge.document d
         JOIN knowledge.document_version v ON v.document_id = d.document_id AND v.version_id = d.current_version_id
        WHERE d.document_id = $1 AND NOT d.unavailable AND v.state = 'current'`,
      [documentId]
    );
    if (!res.rowCount || res.rowCount === 0) return null;
    const row = res.rows[0];
    return {
      document: {
        document_id: row.document_id,
        project_id: row.project_id,
        kind: row.kind,
        title: row.title,
        owner_id: row.owner_id,
        labels: row.labels,
        current_version_id: row.current_version_id,
        revision: Number(row.rev),
      },
      content: row.immutable_content,
    };
  }
}
