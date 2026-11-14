import {captureWork, type WorkScope, type WorkSnapshot} from '../observations/store.ts';
import {createHash, randomUUID} from 'node:crypto';
import {isDeepStrictEqual, TextDecoder} from 'node:util';
import type {PoolClient} from 'pg';
import type {DocumentOrchestrator} from '../documents/orchestration.ts';
import {projectAccess, uuid} from '../projects/store.ts';
import {ProjectFault} from '../projects/outcomes.ts';
import {ownedTransaction} from '../session/database.ts';
import {discoveryScope} from '../documents/discovery.ts';

export type Identity = {actor: string; session: string};
export type Context = {
  project_id: string; session_generation: string; project_permission_revision: string;
  membership_generation: string; documents: Record<string, string>;
};
export type Run = Context & {run_id: string};
export type DocumentEvidence = {
  kind: 'document'; source_id: string; project_id: string; document_id: string; version_id: string;
  passage_id: string; permission_revision: string; lifecycle_revision: string; version_digest: string; excerpt_digest: string;
};
export type Evidence = DocumentEvidence | {kind:'operational'; source_id:string; project_id:string;
  entity_kind:string; entity_id:string; entity_revision:string; observation_revision:number; observed_at:string; entity_digest:string};
export type Purpose = 'provider_input' | 'answer_delivery';
export type SendOutcome = 'completed' | 'aborted' | 'unknown';
export type SendResult<T> = {outcome: SendOutcome; value?: T};
export type KnowledgeCall = <T>(action: string, body: object) => Promise<T>;

type Manifest = {
  handoff_id: string; run_id: string; attempt_id: string; actor_id: string; project_id: string;
  purpose: Purpose; access_context_ref: string; session_generation: string; project_permission_revision: string;
  destination_ref: string; payload_digest: string; payload_length: number; evidence_set: Evidence[];
  prepared_at: string; complete: boolean;
};
type Receipt = {manifest: Manifest; manifest_bytes_base64: string; manifest_digest: string; durable_commit_ref: string};

export const unavailable = () => new ProjectFault(503, 'access_unavailable');
const processRef = randomUUID();
const digest = (value: Buffer) => createHash('sha256').update(value).digest('hex');

export async function currentContext(client: PoolClient, who: Identity, projectId: string): Promise<Context> {
  const {project, member} = await projectAccess(client, who.actor, projectId);
  const session = (await client.query<{revision: string}>(
    'SELECT revision::text FROM workspace.session WHERE session_id=$1 AND user_id=$2 AND NOT revoked',
    [who.session, who.actor])).rows[0];
  if (!session) throw unavailable();
  const access = await discoveryScope(client, who.actor, projectId, false);
  return {project_id: projectId, session_generation: session.revision, project_permission_revision: project.revision,
    membership_generation: member.membership_generation, documents: Object.fromEntries(access.policy.map(row => [row.document_id, row.permission_revision]))};
}

function decode(value: string, max: number): Buffer {
  if (typeof value !== 'string' || !value || value.length > Math.ceil(max / 3) * 4) throw unavailable();
  const bytes = Buffer.from(value, 'base64');
  if (bytes.length > max || bytes.toString('base64') !== value) throw unavailable();
  return bytes;
}

function parseFrozen(bytes: Buffer): unknown {
  const parsed = JSON.parse(new TextDecoder('utf-8', {fatal: true, ignoreBOM: true}).decode(bytes));
  // The fixture wire format is compact server-generated JSON. Round-tripping
  // rejects duplicate keys and altered number tokens before the byte checks.
  if (!bytes.equals(Buffer.from(JSON.stringify(parsed)))) throw unavailable();
  return parsed;
}

export class Handoff {
  private readonly orchestrator: DocumentOrchestrator;

  constructor(orchestrator: DocumentOrchestrator) { this.orchestrator = orchestrator; }

  async send<T>(options: {
    who: Identity; token: string; run: Run; call: KnowledgeCall; purpose: Purpose; destination: string;
    work?: {selector:WorkScope; snapshot:WorkSnapshot};
    question: string; draft?: unknown; expectedPayload: unknown; evidence: Evidence[];
    signal: AbortSignal; transmit: (payload: Buffer, signal: AbortSignal) => Promise<SendResult<T>>;
  }): Promise<T> {
    const {who, token, run, call, purpose, destination, question, draft, expectedPayload, evidence, signal, transmit, work} = options;
    const project = run.project_id;
    const {guard, docsStore} = this.orchestrator;
    const snapshot = guard.snapshot(project);
    const generation = guard.getGeneration();
    const attempt = work ? run.run_id + ':' + work.snapshot.fingerprint : run.run_id;
    const prepared = await call<{handoff_id: string; payload_bytes_base64: string}>('prepare',
      {...run, purpose, destination, question, draft, evidence, work:work?.snapshot});
    const receipt = await call<Receipt>('get-handoff-manifest', {...run, handoff_id: prepared.handoff_id});
    const bytes = decode(prepared.payload_bytes_base64, 65536);
    const manifestBytes = decode(receipt.manifest_bytes_base64, 65536);
    const manifest = parseFrozen(manifestBytes) as Manifest;
    const providerBytes = purpose === 'provider_input' ? Buffer.from(JSON.stringify(expectedPayload)) : null;
    const verify = () => {
      const {prepared_at, ...bound} = manifest;
      const expected = {handoff_id: prepared.handoff_id, run_id: run.run_id, attempt_id: attempt, purpose,
        actor_id: who.actor, project_id: project, access_context_ref: who.session,
        session_generation: run.session_generation, project_permission_revision: run.project_permission_revision,
        evidence_set: evidence, payload_digest: digest(bytes), payload_length: bytes.length, destination_ref: destination,
        complete: true};
      if (!uuid(prepared.handoff_id) || !uuid(receipt.durable_commit_ref) || digest(manifestBytes) !== receipt.manifest_digest ||
          !isDeepStrictEqual(manifest, receipt.manifest) || !isDeepStrictEqual(bound, expected) ||
          !Number.isFinite(Date.parse(prepared_at)) ||
          (providerBytes ? !bytes.equals(providerBytes) :
            !isDeepStrictEqual(parseFrozen(bytes), expectedPayload))) throw unavailable();
    };
    verify();
    if (signal.aborted) throw unavailable();
    const claim = await ownedTransaction(docsStore.projects.pool, 'runtime', async client => {
      // Persist the project in the permanent identity so a restarted gateway can
      // quarantine an unconfirmed claim before either subsequent handoff.
      const id = project + ':' + manifest.handoff_id;
      await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))', ['sp09:' + project]);
      const blocked = await client.query(`SELECT 1 FROM workspace.idempotency_record c
        WHERE operation='protected_handoff' AND split_part(idempotency_key, ':', 1)=$1
        AND NOT EXISTS (SELECT 1 FROM workspace.protected_handoff_outcome o
          WHERE o.actor_id=c.actor_id AND o.handoff_id=c.idempotency_key AND o.claim_fence=c.claim_fence
            AND o.status IN ('completed','aborted')) LIMIT 1`, [project]);
      if (blocked.rowCount) throw unavailable();
      const {rows} = await client.query<{fence: string | null}>(
        'SELECT workspace.claim_protected_handoff($1,$2,$3,$4) AS fence',
        [who.actor, id, receipt.manifest_digest, processRef]);
      const fence = rows[0]?.fence;
      if (!fence) throw unavailable();
      return {id, fence};
    });

    let result: SendResult<T> = {outcome: 'aborted'};
    try {
      const release = await guard.acquireShared(project, generation);
      const controller = new AbortController();
      const cancellation = AbortSignal.any([signal, controller.signal]);
      const unregister = guard.registerSocket(project, manifest.handoff_id, {
        id: manifest.handoff_id, destroy: () => controller.abort(),
      });
      try {
        await docsStore.projects.transaction(token, async (client, actor, current) => {
          if (actor !== who.actor || cancellation.aborted || guard.snapshot(project) !== snapshot ||
              guard.getGeneration() !== generation) throw unavailable();
          const now = await currentContext(client, who, project);
          if (now.session_generation !== run.session_generation ||
              now.project_permission_revision !== run.project_permission_revision || now.membership_generation !== run.membership_generation ||
              evidence.some(source => source.kind === 'document' && now.documents[source.document_id] !== source.permission_revision)) throw unavailable();
          if (work && (await captureWork(client,actor,project,work.selector)).fingerprint !== work.snapshot.fingerprint) {
            throw unavailable();
          }
          verify();
          const checked = await call<{valid: boolean}>('recheck', {...now, run_id: run.run_id, evidence});
          if (!checked.valid || cancellation.aborted) throw unavailable();
          if (!await current()) return null;
          if (cancellation.aborted || guard.getGeneration() !== generation) throw unavailable();
          result = {outcome: 'unknown'};
          result = await transmit(bytes, cancellation);
          return true;
        });
      } finally {
        unregister();
        release();
      }
    } finally {
      const {outcome} = result;
      // Record observed transport outcome after releasing locks, including zero-byte refusals.
      await ownedTransaction(docsStore.projects.pool, 'runtime', async client => {
        await client.query(`INSERT INTO workspace.protected_handoff_outcome(actor_id,handoff_id,claim_fence,status,enforcement_ref)
          VALUES($1,$2,$3,$4,$5)`, [who.actor, claim.id, claim.fence, outcome, processRef]);
      });
      await call('record-handoff', {...run, handoff_id: manifest.handoff_id, outcome, enforcement_ref: claim.fence});
    }
    if (result.outcome !== 'completed') throw unavailable();
    return result.value as T;
  }
}
