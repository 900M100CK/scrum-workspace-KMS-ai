export interface GuardSocket {
  id: string;
  destroy(): void;
  isClosed?(): boolean;
  on?(event: 'close', cb: () => void): void;
  once?(event: 'close', cb: () => void): void;
}

interface ProjectLockState {
  revision: number;
  readers: number;
  writerActive: boolean;
  waitingWriters: Array<() => void>;
  waitingReaders: Array<() => void>;
  revoked: boolean;
  activeSockets: Map<string, GuardSocket>;
}

export class ProjectRWGuard {
  private generation: number;
  snapshot(projectId: string): number {
    return this.projects.get(projectId)?.revision ?? 0;
  }

  async change<T>(projectId: string, work: () => Promise<T>): Promise<T> {
    const state = this.getOrCreateProject(projectId);
    const exclusive = this.acquireExclusive(projectId);
    for (const socket of state.activeSockets.values()) socket.destroy();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const deadline = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('GUARD_CLOSE_UNCONFIRMED')), 500);
    });
    let release: () => void;
    try {
      release = await Promise.race([exclusive, deadline]);
    } catch (error) {
      void exclusive.then(unlock => unlock());
      throw error;
    } finally {
      clearTimeout(timer);
    }
    try {
      state.revision++;
      return await work();
    } finally {
      release();
    }
  }
  private projects = new Map<string, ProjectLockState>();

  constructor(initialGeneration = 1) {
    this.generation = initialGeneration;
  }

  getGeneration(): number {
    return this.generation;
  }

  setGeneration(gen: number): void {
    this.generation = gen;
    // Clearing active projects on generation change simulates process restart fence
    this.projects.clear();
  }

  private getOrCreateProject(projectId: string): ProjectLockState {
    let state = this.projects.get(projectId);
    if (!state) {
      state = {
        revision: 0,
        readers: 0,
        writerActive: false,
        waitingWriters: [],
        waitingReaders: [],
        revoked: false,
        activeSockets: new Map(),
      };
      this.projects.set(projectId, state);
    }
    return state;
  }

  isRevoked(projectId: string): boolean {
    const state = this.projects.get(projectId);
    return state ? state.revoked : false;
  }

  async acquireShared(projectId: string, generation: number): Promise<() => void> {
    if (generation !== this.generation) {
      throw new Error('GUARD_DENIED_GENERATION');
    }

    const state = this.getOrCreateProject(projectId);
    if (state.revoked) {
      throw new Error('GUARD_REVOKED');
    }

    // Writer preference: if a writer is currently active or writers are queued, readers must wait
    if (state.writerActive || state.waitingWriters.length > 0) {
      await new Promise<void>((resolve) => {
        state.waitingReaders.push(resolve);
      });
    }

    // Re-check revoked flag and generation after waking up
    if (generation !== this.generation) {
      throw new Error('GUARD_DENIED_GENERATION');
    }
    if (state.revoked) {
      throw new Error('GUARD_REVOKED');
    }

    state.readers++;
    let released = false;

    return () => {
      if (released) return;
      released = true;
      state.readers--;

      if (state.readers === 0) {
        if (state.waitingWriters.length > 0) {
          const nextWriter = state.waitingWriters.shift();
          if (nextWriter) {
            state.writerActive = true;
            nextWriter();
          }
        } else {
          while (state.waitingReaders.length > 0) {
            const nextReader = state.waitingReaders.shift();
            if (nextReader) nextReader();
          }
        }
      }
    };
  }

  async acquireExclusive(projectId: string): Promise<() => void> {
    const state = this.getOrCreateProject(projectId);

    // If readers are present or another writer is active, queue
    if (state.writerActive || state.readers > 0) {
      await new Promise<void>((resolve) => {
        state.waitingWriters.push(resolve);
      });
    }

    state.writerActive = true;
    let released = false;

    return () => {
      if (released) return;
      released = true;
      state.writerActive = false;

      // Prefer queued writers first
      if (state.waitingWriters.length > 0) {
        const nextWriter = state.waitingWriters.shift();
        if (nextWriter) {
          state.writerActive = true;
          nextWriter();
        }
      } else {
        // Otherwise wake all queued readers
        while (state.waitingReaders.length > 0) {
          const nextReader = state.waitingReaders.shift();
          if (nextReader) nextReader();
        }
      }
    };
  }

  registerSocket(projectId: string, socketId: string, socket: GuardSocket): () => void {
    const state = this.getOrCreateProject(projectId);
    state.activeSockets.set(socketId, socket);

    const cleanup = () => {
      state.activeSockets.delete(socketId);
    };

    if (socket.once) {
      socket.once('close', cleanup);
    }

    return cleanup;
  }

  getActiveSocketCount(projectId: string): number {
    const state = this.projects.get(projectId);
    return state ? state.activeSockets.size : 0;
  }

  async revoke(projectId: string, options: { deadlineMs?: number } = {}): Promise<'revoked' | 'unknown'> {
    const deadlineMs = options.deadlineMs ?? 500;
    const release = await this.acquireExclusive(projectId);

    try {
      const state = this.getOrCreateProject(projectId);
      state.revoked = true;

      const sockets = Array.from(state.activeSockets.values());
      if (sockets.length === 0) {
        return 'revoked';
      }

      // Actively destroy all sockets associated with this project
      for (const s of sockets) {
        try {
          s.destroy();
        } catch {
          // Ignore immediate destruction errors
        }
      }

      // Await confirmation of closure for all sockets up to deadlineMs
      const start = Date.now();
      while (Date.now() - start < deadlineMs) {
        let allClosed = true;
        for (const s of sockets) {
          if (s.isClosed && !s.isClosed()) {
            allClosed = false;
            break;
          }
        }
        if (allClosed && state.activeSockets.size === 0) {
          return 'revoked';
        }
        await new Promise((r) => setTimeout(r, 10));
      }

      // Check if all sockets were cleaned up or closed before deciding
      let stillOpen = false;
      for (const s of sockets) {
        if (s.isClosed && !s.isClosed()) {
          stillOpen = true;
          break;
        }
      }

      if (!stillOpen && state.activeSockets.size === 0) {
        return 'revoked';
      }

      // Deadline expired without confirmed closure
      return 'unknown';
    } finally {
      release();
    }
  }
}
