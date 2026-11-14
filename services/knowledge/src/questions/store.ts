import {createHash, randomUUID} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
import type {Pool, PoolClient} from 'pg';
import type {Passage} from '../documents/discovery.ts';
import {missing} from '../documents/store.ts';
import {configuration, embed, expectedAnswer, model, syntheticExcerpts} from './fixture.ts';

export type Scope = 'current' | 'historical';
type Locator = Pick<Passage, 'document_id' | 'version_id' | 'passage_id'>;
type Row = Omit<Passage, 'rank'> & {
  unavailable: boolean; lifecycle_revision: string; version_digest: string; excerpt_digest: string;
};
export type Evidence = Locator & {
  kind: 'document'; source_id: string; project_id: string; permission_revision: string;
  lifecycle_revision: string; version_digest: string; excerpt_digest: string;
};
export type Context = {
  project_id: string; session_generation: string; project_permission_revision: string;
  documents: Record<string, string>;
};
export type RunContext = Context & {run_id: string};
export type Purpose = 'provider_input' | 'answer_delivery';

const hash = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');
const fields = `d.document_id, v.version_id, p.passage_id, d.title, p.immutable_excerpt AS excerpt,
  v.state AS validity, d.unavailable, d.revision::text AS lifecycle_revision,
  encode(sha256(convert_to(v.immutable_content, 'UTF8')), 'hex') AS version_digest,
  encode(sha256(convert_to(p.immutable_excerpt, 'UTF8')), 'hex') AS excerpt_digest`;
const tables = `knowledge.document d JOIN knowledge.document_version v USING (document_id)
  JOIN knowledge.passage p USING (document_id, version_id)`;

function passage(row: Row, rank: number): Passage {
  const {document_id, version_id, passage_id, title, excerpt, validity} = row;
  return {document_id, version_id, passage_id, title, excerpt, validity, rank};
}

function evidence(row: Row, context: Context, source: string): Evidence {
  const {document_id, version_id, passage_id, lifecycle_revision, version_digest, excerpt_digest} = row;
  return {kind: 'document', source_id: source, project_id: context.project_id, document_id, version_id, passage_id,
    permission_revision: context.documents[document_id]!, lifecycle_revision, version_digest, excerpt_digest};
}

export class QuestionStore {
  private readonly pool: Pool;

  constructor(pool: Pool) { this.pool = pool; }

  private async transaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    let discard = false;
    try {
      await client.query('BEGIN');
      const value = await work(client);
      await client.query('COMMIT');
      return value;
    } catch (error) {
      discard = true;
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release(discard);
    }
  }

  private async candidates(context: Context, query: string, scope: Scope): Promise<Row[]> {
    const result = await this.pool.query<Row>(`
      WITH eligible AS MATERIALIZED (
        SELECT ${fields}, e.embedding
        FROM ${tables}
        JOIN knowledge.passage_embedding e USING (document_id, version_id, passage_id)
        JOIN knowledge.embedding_configuration cfg USING (configuration_id, dimensions)
        JOIN knowledge.search_job j ON j.job_id=e.job_id
        WHERE d.project_id=$1 AND d.document_id=ANY($2::uuid[]) AND NOT d.unavailable
          AND p.immutable_excerpt=ANY($7::text[])
          AND cfg.configuration_id=$3 AND cfg.model=$6 AND cfg.model_version='1'
          AND cfg.distance_metric='cosine' AND cfg.dimensions=3 AND j.readiness='ready' AND NOT j.tombstone
          AND ((v.state='current' AND d.current_version_id=v.version_id AND j.aggregate_revision=d.revision
                AND j.processing_generation=d.processing_generation)
               OR ($5='historical' AND v.state IN ('superseded','archived')))
      ), ranked AS (
        SELECT eligible.*, embedding OPERATOR(public.<=>) $4::public.vector AS distance FROM eligible
      )
      SELECT * FROM ranked WHERE distance < 0.25 ORDER BY distance,document_id,version_id,passage_id LIMIT 6`,
      [context.project_id, Object.keys(context.documents), configuration, JSON.stringify(embed(query)), scope, model, syntheticExcerpts]);
    return result.rows;
  }

  async search(context: Context, query: string, scope: Scope) {
    const rows = await this.candidates(context, query, scope);
    return {items: rows.map((row, index) => passage(row, index + 1)), next_cursor: null};
  }

  async lookup(project: string, locator: Locator): Promise<Row> {
    const {rows} = await this.pool.query<Row>(`SELECT ${fields} FROM ${tables}
      WHERE d.project_id=$1 AND d.document_id=$2 AND v.version_id=$3 AND p.passage_id=$4
      AND v.state IN ('current','superseded','archived')`,
    [project, locator.document_id, locator.version_id, locator.passage_id]);
    if (!rows[0]) throw missing();
    return rows[0];
  }

  async citation(project: string, locator: Locator) {
    const row = await this.lookup(project, locator);
    return row.unavailable
      ? {state: 'unavailable', ...locator, message: 'Cited content unavailable'}
      : passage(row, 1);
  }

  async start(actor: string, context: Context, question: string, scope: Scope) {
    const run = randomUUID();
    const rows = await this.candidates(context, question, scope);
    const entries = rows.map((row, index) => evidence(row, context, 'S' + (index + 1)));
    await this.transaction(async client => {
      await client.query(`INSERT INTO knowledge.execution(run_id,actor_id,project_id,configuration_id)
        VALUES($1,$2,$3,(SELECT configuration_id FROM knowledge.embedding_configuration WHERE configuration_id=$4))`,
      [run, actor, context.project_id, configuration]);
      for (const entry of entries) {
        await client.query(`INSERT INTO knowledge.provenance(run_id,source_id,document_id,version_id,passage_id)
          VALUES($1,$2,$3,$4,$5)`, [run, entry.source_id, entry.document_id, entry.version_id, entry.passage_id]);
      }
    });
    return {run_id: run, evidence: entries, sources: rows.map((row, index) => ({...passage(row, index + 1), source_id: entries[index]!.source_id}))};
  }

  async assertRun(actor: string, context: RunContext) {
    const row = await this.pool.query('SELECT 1 FROM knowledge.execution WHERE run_id=$1 AND actor_id=$2 AND project_id=$3',
      [context.run_id, actor, context.project_id]);
    if (!row.rowCount) throw missing();
  }

  async prepare(actor: string, session: string, context: RunContext, purpose: Purpose,
    destination: string, question: string, draft: unknown, original: Evidence[]) {
    await this.assertRun(actor, context);
    const {rows} = await this.pool.query<Row & {source_id: string}>(`
      SELECT ${fields}, b.source_id FROM ${tables}
      JOIN knowledge.provenance b USING(document_id,version_id,passage_id)
      WHERE b.run_id=$1 AND d.project_id=$2 ORDER BY b.source_id`, [context.run_id, context.project_id]);
    const complete = rows.map(row => evidence(row, context, row.source_id));
    if (!isDeepStrictEqual(complete, original) || rows.some(row => row.unavailable)) throw missing();
    const sources = rows.map((row, index) => ({...passage(row, index + 1), source_id: row.source_id}));
    let payload: unknown;
    if (purpose === 'provider_input') {
      payload = {model, run_id: context.run_id, question, sources: sources.map(
        ({source_id, document_id, version_id, passage_id, excerpt}) => ({source_id, document_id, version_id, passage_id, excerpt}))};
    } else {
      const expected = expectedAnswer(context.run_id, question, sources);
      if (!isDeepStrictEqual(draft, expected)) throw missing();
      payload = expected;
    }
    const bytes = Buffer.from(JSON.stringify(payload));
    const manifest = {
      handoff_id: randomUUID(), run_id: context.run_id, attempt_id: context.run_id,
      purpose, actor_id: actor, project_id: context.project_id, access_context_ref: session,
      session_generation: context.session_generation, project_permission_revision: context.project_permission_revision,
      evidence_set: complete, payload_digest: hash(bytes), payload_length: bytes.length,
      destination_ref: destination, prepared_at: new Date().toISOString(), complete: true,
    };
    await this.transaction(async client => {
      if (purpose === 'answer_delivery') {
        await client.query(`UPDATE knowledge.execution SET validation_outcomes=jsonb_build_object(
          'claim_support','verified_fixture','exact_locators',true,'prepared_status',$2::text) WHERE run_id=$1`,
        [context.run_id, (payload as {status: string}).status]);
      }
      await client.query(`INSERT INTO knowledge.handoff_manifest(handoff_id,run_id,actor_id,project_id,manifest,manifest_bytes)
        VALUES($1,$2,$3,$4,$5,$6)`,
      [manifest.handoff_id, context.run_id, actor, context.project_id, manifest, Buffer.from(JSON.stringify(manifest))]);
    });
    return {handoff_id: manifest.handoff_id, payload_bytes_base64: bytes.toString('base64')};
  }

  async receipt(actor: string, session: string, context: RunContext, id: string) {
    const {rows} = await this.pool.query(`SELECT manifest, replace(encode(manifest_bytes,'base64'), chr(10), '') AS manifest_bytes_base64,
        manifest_digest, durable_commit_ref::text
      FROM knowledge.handoff_manifest WHERE handoff_id=$1 AND actor_id=$2 AND project_id=$3 AND run_id=$4
        AND manifest->>'access_context_ref'=$5 AND manifest->>'session_generation'=$6
        AND manifest->>'project_permission_revision'=$7`,
    [id, actor, context.project_id, context.run_id, session, context.session_generation, context.project_permission_revision]);
    if (!rows[0]) throw missing();
    return rows[0];
  }

  async recheck(context: Context, entries: Evidence[]) {
    for (const entry of entries) {
      const row = await this.lookup(context.project_id, entry);
      if (row.unavailable || !context.documents[row.document_id] ||
          !isDeepStrictEqual(entry, evidence(row, context, entry.source_id))) throw missing();
    }
    return {valid: true};
  }

  async recordHandoff(actor: string, context: RunContext, id: string, outcome: string, fence: string) {
    const result = await this.pool.query(`INSERT INTO knowledge.handoff_outcome(handoff_id,status,enforcement_ref)
      SELECT handoff_id,$5,$6 FROM knowledge.handoff_manifest
      WHERE handoff_id=$1 AND actor_id=$2 AND project_id=$3 AND run_id=$4`,
    [id, actor, context.project_id, context.run_id, outcome, fence]);
    if (!result.rowCount) throw missing();
  }

  async record(actor: string, context: RunContext, result: {status: string; duration: number; bytes: number}) {
    await this.assertRun(actor, context);
    await this.pool.query(`UPDATE knowledge.execution SET duration_ms=$2, usage=jsonb_build_object('provider_bytes',$3::integer),
      errors=CASE WHEN $4='completed' THEN '{}'::text[] ELSE ARRAY[$4::text] END,
      validation_outcomes=validation_outcomes || jsonb_build_object('fixture_outcome',$4::text) WHERE run_id=$1`,
    [context.run_id, result.duration, result.bytes, result.status]);
  }
}
