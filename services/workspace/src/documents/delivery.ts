import {randomUUID} from 'node:crypto';
import type {FastifyReply} from 'fastify';
import {canManageDocumentAccess, canReadDocument} from './authority.ts';
import type {DocumentOrchestrator} from './orchestration.ts';
import {conflict, missing, ProjectFault} from '../projects/outcomes.ts';
import {projectAccess, uuid} from '../projects/store.ts';

export async function deliverDocument<T>(
  orchestrator: DocumentOrchestrator,
  token: string,
  project: string,
  reply: FastifyReply,
  prepare: () => Promise<T>,
  documentIds: (value: T) => string[],
  management = false,
  status: (value: T) => number = () => 200,
  body: (value: T) => unknown = value => value
): Promise<void> {
  if (!uuid(project)) throw missing();
  project = project.toLowerCase();
  const guard = orchestrator.guard;
  const generation = guard.getGeneration();
  const snapshot = guard.snapshot(project);
  const value = await prepare();
  const release = await guard.acquireShared(project, generation);
  const response = reply.raw;
  const socket = response.socket;
  const id = randomUUID();
  const unregister = guard.registerSocket(project, id, {
    id,
    destroy: () => response.destroy(),
    isClosed: () => response.closed,
  });
  try {
    await orchestrator.docsStore.projects.transaction(token, async (client, actor, current) => {
      await projectAccess(client, actor, project);
      for (const id of documentIds(value)) {
        const allowed = management ? await canManageDocumentAccess(client, actor, project, id) :
          await canReadDocument(client, actor, project, id);
        if (!allowed) throw missing();
        const pending = await client.query('SELECT 1 FROM workspace.document_command_journal WHERE document_id = $1 AND pending', [id]);
        if (pending.rowCount) throw new ProjectFault(503, 'access_unavailable');
      }
      if (snapshot !== guard.snapshot(project) || generation !== guard.getGeneration()) throw conflict();
      if (!await current()) return null;
      if (response.destroyed || socket?.destroyed) throw new ProjectFault(503, 'access_unavailable');
      await new Promise<void>(resolve => {
        const finish = () => {
          clearTimeout(deadline);
          response.off('finish', finish);
          response.off('close', finish);
          resolve();
        };
        const deadline = setTimeout(() => response.destroy(), 500);
        response.once('finish', finish);
        response.once('close', finish);
        reply.code(status(value)).send(body(value));
      });
      return true;
    });
  } finally {
    unregister();
    release();
  }
}
