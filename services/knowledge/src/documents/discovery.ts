import {randomUUID} from 'node:crypto';
import type {Pool} from 'pg';
import {conflict, isUuid, missing, requestHash} from './store.ts';

export type Endpoint = {kind: 'task' | 'sprint' | 'document' | 'decision'; id: string};
export type LinkInput = {
  project_id: string; from_kind: Endpoint['kind']; from_id: string;
  to_kind: Endpoint['kind']; to_id: string; relation: string;
};
export type Link = LinkInput & {link_id: string};
export type Passage = {
  document_id: string; version_id: string; passage_id: string;
  title: string; excerpt: string; validity: 'current' | 'superseded' | 'archived'; rank: number;
};
export type DiscoveryPage<T> = {items: T[]; generation: string; more: boolean};
export const pageSize = 20;
export const kinds = ['task', 'sprint', 'document', 'decision'];

export class KnowledgeDiscovery {
  private readonly pool: Pool;
  constructor(pool: Pool) { this.pool = pool; }

  async create(actor: string, input: LinkInput, key: string, correlation: string): Promise<Link> {
    const hash = requestHash([input.project_id, input.from_kind, input.from_id, input.to_kind, input.to_id, input.relation]);
    const client = await this.pool.connect();
    let discard = false;
    try {
      await client.query('BEGIN');
      await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
        [JSON.stringify(['createLink', actor, key])]);
      for (const endpoint of [{kind: input.from_kind, id: input.from_id}, {kind: input.to_kind, id: input.to_id}]) {
        if (endpoint.kind === 'task' || endpoint.kind === 'sprint') continue;
        const found = await client.query(
          'SELECT 1 FROM knowledge.document WHERE project_id=$1 AND document_id=$2 AND kind=$3 AND NOT unavailable FOR SHARE',
          [input.project_id, endpoint.id, endpoint.kind]);
        if (!found.rowCount) throw missing();
      }
      const previous = (await client.query(
        "SELECT payload_hash,state,result_ref FROM knowledge.idempotency_record WHERE actor_id=$1 AND operation='createLink' AND idempotency_key=$2",
        [actor, key])).rows[0];
      let result: Link;
      if (previous) {
        if (previous.payload_hash !== hash || previous.state !== 'committed') throw conflict();
        result = JSON.parse(previous.result_ref) as Link;
      } else {
        result = {...input, link_id: randomUUID()};
        await client.query(
          'INSERT INTO knowledge.link(link_id,project_id,from_kind,from_id,to_kind,to_id,relation) VALUES($1,$2,$3,$4,$5,$6,$7)',
          [result.link_id, input.project_id, input.from_kind, input.from_id, input.to_kind, input.to_id, input.relation]);
        await client.query(
          "INSERT INTO knowledge.business_audit(event_id,actor_id,project_id,action,entity_id,correlation_id,after_ref) VALUES($1,$2,$3,'relationship-create',$4,$5,$6)",
          [randomUUID(), actor, input.project_id, result.link_id, correlation, JSON.stringify(result)]);
        await client.query(
          "INSERT INTO knowledge.idempotency_record(actor_id,operation,idempotency_key,payload_hash,state,result_ref,expires_at) VALUES($1,'createLink',$2,$3,'committed',$4,'infinity')",
          [actor, key, hash, JSON.stringify(result)]);
      }
      await client.query('COMMIT');
      return result;
    } catch (error) {
      try { await client.query('ROLLBACK'); } catch { discard = true; }
      throw error;
    } finally {
      client.release(discard);
    }
  }

  async links(project: string, endpoint: string | null, tasks: string[], sprints: string[], documents: string[], offset: number): Promise<DiscoveryPage<Link>> {
    const {rows} = await this.pool.query(
      `WITH endpoints AS (
         SELECT 'task' AS kind, unnest($3::uuid[]) AS id
         UNION ALL SELECT 'sprint', unnest($4::uuid[])
         UNION ALL SELECT kind, document_id FROM knowledge.document
          WHERE project_id=$1 AND document_id=ANY($5::uuid[]) AND NOT unavailable
       ), visible AS (
         SELECT l.link_id,l.project_id,l.from_kind,l.from_id,l.to_kind,l.to_id,l.relation
         FROM knowledge.link l JOIN endpoints f ON (f.kind,f.id)=(l.from_kind,l.from_id)
         JOIN endpoints t ON (t.kind,t.id)=(l.to_kind,l.to_id)
         WHERE l.project_id=$1 AND ($2::uuid IS NULL OR $2 IN (l.from_id,l.to_id))
       )
       SELECT (SELECT md5(coalesce(jsonb_agg(to_jsonb(v) ORDER BY link_id)::text,'')) FROM visible v) AS generation,
        ARRAY(SELECT to_jsonb(v) FROM visible v ORDER BY link_id LIMIT $6 OFFSET $7) AS items,
        ($2::uuid IS NULL OR EXISTS(SELECT 1 FROM endpoints WHERE id=$2)) AS anchor_visible`,
      [project, endpoint, tasks, sprints, documents, pageSize + 1, offset]);
    if (!rows[0].anchor_visible) throw missing();
    return {generation: rows[0].generation, items: rows[0].items.slice(0, pageSize), more: rows[0].items.length > pageSize};
  }

  async keyword(project: string, documents: string[], query: string, scope: 'current' | 'historical', offset: number): Promise<DiscoveryPage<Passage>> {
    const {rows} = await this.pool.query(
      `WITH term AS (SELECT plainto_tsquery('english',$3) AS q),
       matching AS (
         SELECT p.document_id,p.version_id,p.passage_id,d.title,p.immutable_excerpt AS excerpt,v.state AS validity,
           ts_rank(to_tsvector('english',p.immutable_excerpt), term.q) AS score
         FROM knowledge.passage p JOIN knowledge.document d USING(document_id)
         JOIN knowledge.document_version v USING(document_id,version_id) CROSS JOIN term
         WHERE d.project_id=$1 AND d.document_id=ANY($2::uuid[]) AND NOT d.unavailable
          AND (($4='current' AND v.state='current' AND d.current_version_id=v.version_id)
               OR ($4='historical' AND v.state IN ('superseded','archived')))
          AND to_tsvector('english',p.immutable_excerpt) @@ term.q
       ), ranked AS (
         SELECT document_id,version_id,passage_id,title,excerpt,validity,
           row_number() OVER(ORDER BY score DESC,document_id,version_id,passage_id)::integer AS rank FROM matching
       )
       SELECT (SELECT md5(coalesce(string_agg(document_id::text || version_id::text || passage_id::text || validity || md5(title),',' ORDER BY rank),'')) FROM ranked) AS generation,
         ARRAY(SELECT to_jsonb(r) FROM ranked r ORDER BY rank LIMIT $5 OFFSET $6) AS items`,
      [project, documents, query, scope, pageSize + 1, offset]);
    return {generation: rows[0].generation, items: rows[0].items.slice(0, pageSize), more: rows[0].items.length > pageSize};
  }
}

export function validIds(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isUuid);
}
