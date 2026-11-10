import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { ProjectRWGuard } from '../../services/workspace/src/policy/guard.ts';
import { verifyServiceKey, stripInternalHeaders, buildInternalServiceHeaders } from '../../services/workspace/src/transport/service-auth.ts';

test('ProjectRWGuard - parallel shared reads within same project do not block each other', async () => {
  const guard = new ProjectRWGuard(1);
  const projectId = 'proj-parallel-1';

  let r1Active = false;
  let r2Active = false;

  const release1 = await guard.acquireShared(projectId, 1);
  r1Active = true;

  const release2 = await guard.acquireShared(projectId, 1);
  r2Active = true;

  assert.equal(r1Active && r2Active, true, 'Both readers should be active simultaneously');

  release1();
  release2();
});

test('ProjectRWGuard - writer preference blocks incoming readers when writer is waiting', async () => {
  const guard = new ProjectRWGuard(1);
  const projectId = 'proj-writer-pref-1';

  const releaseReader1 = await guard.acquireShared(projectId, 1);

  let writerAcquired = false;
  let reader2Acquired = false;

  // Queue exclusive writer while reader 1 holds shared lock
  const writerPromise = guard.acquireExclusive(projectId).then((release) => {
    writerAcquired = true;
    return release;
  });

  // Small delay to ensure writer is queued
  await new Promise((r) => setTimeout(r, 20));

  // Queue reader 2 after writer is already waiting
  const reader2Promise = guard.acquireShared(projectId, 1).then((release) => {
    reader2Acquired = true;
    return release;
  });

  await new Promise((r) => setTimeout(r, 20));
  assert.equal(writerAcquired, false, 'Writer waits for active reader 1');
  assert.equal(reader2Acquired, false, 'Reader 2 blocked behind waiting writer');

  // Release reader 1 -> Writer should acquire BEFORE reader 2
  releaseReader1();

  const releaseWriter = await writerPromise;
  assert.equal(writerAcquired, true, 'Writer acquired lock after reader 1 release');
  assert.equal(reader2Acquired, false, 'Reader 2 still blocked while writer holds lock');

  // Release writer -> Reader 2 should now acquire
  releaseWriter();
  const releaseReader2 = await reader2Promise;
  assert.equal(reader2Acquired, true, 'Reader 2 acquired lock after writer released');

  releaseReader2();
});

test('ProjectRWGuard - active socket destruction confirmed closure returns revoked', async () => {
  const guard = new ProjectRWGuard(1);
  const projectId = 'proj-socket-destroy-1';

  class MockSocket extends EventEmitter {
    constructor(id) {
      super();
      this.id = id;
      this.closed = false;
    }
    destroy() {
      // Simulate fast closure upon destruction
      setTimeout(() => {
        this.closed = true;
        this.emit('close');
      }, 20);
    }
    isClosed() {
      return this.closed;
    }
  }

  const s1 = new MockSocket('s1');
  const s2 = new MockSocket('s2');

  guard.registerSocket(projectId, 's1', s1);
  guard.registerSocket(projectId, 's2', s2);
  assert.equal(guard.getActiveSocketCount(projectId), 2);

  const result = await guard.revoke(projectId, { deadlineMs: 300 });

  assert.equal(result, 'revoked');
  assert.equal(s1.closed, true);
  assert.equal(s2.closed, true);
  assert.equal(guard.getActiveSocketCount(projectId), 0);
  assert.equal(guard.isRevoked(projectId), true);
});

test('ProjectRWGuard - socket fails to close before deadline returns unknown outcome', async () => {
  const guard = new ProjectRWGuard(1);
  const projectId = 'proj-slow-client-1';

  class StalledSocket extends EventEmitter {
    constructor(id) {
      super();
      this.id = id;
      this.closed = false;
    }
    destroy() {
      // Deliberately stalled: does not close or emit close within deadline
    }
    isClosed() {
      return this.closed;
    }
  }

  const stalled = new StalledSocket('stalled-1');
  guard.registerSocket(projectId, 'stalled-1', stalled);

  const result = await guard.revoke(projectId, { deadlineMs: 50 });

  assert.equal(result, 'unknown', 'Exceeded deadline without confirmed close must return unknown');
  assert.equal(guard.isRevoked(projectId), true, 'Project is still flagged as revoked');
});

test('ProjectRWGuard - delivery re-checks revoked flag and rejects revoked project', async () => {
  const guard = new ProjectRWGuard(1);
  const projectId = 'proj-recheck-1';

  await guard.revoke(projectId);

  assert.equal(guard.isRevoked(projectId), true);

  await assert.rejects(
    async () => {
      await guard.acquireShared(projectId, 1);
    },
    { message: 'GUARD_REVOKED' },
  );
});

test('ProjectRWGuard - generation fencing denies delivery with mismatched generation', async () => {
  const guard = new ProjectRWGuard(1);
  const projectId = 'proj-fence-1';

  // Generation mismatch
  await assert.rejects(
    async () => {
      await guard.acquireShared(projectId, 2);
    },
    { message: 'GUARD_DENIED_GENERATION' },
  );

  // Restart simulation advances generation and resets project guard state
  guard.setGeneration(2);
  assert.equal(guard.getGeneration(), 2);

  // Old generation denied
  await assert.rejects(
    async () => {
      await guard.acquireShared(projectId, 1);
    },
    { message: 'GUARD_DENIED_GENERATION' },
  );

  // Correct new generation succeeds
  const release = await guard.acquireShared(projectId, 2);
  release();
});

test('ServiceAuth - verifyServiceKey constant-time comparison', () => {
  const secretKey = 'super-secret-workspace-key-12345';

  // Valid key
  assert.equal(verifyServiceKey(secretKey, secretKey), true);

  // Wrong key same length
  assert.equal(verifyServiceKey('super-secret-workspace-key-99999', secretKey), false);

  // Wrong key different length
  assert.equal(verifyServiceKey('short-key', secretKey), false);

  // Missing / empty key
  assert.equal(verifyServiceKey(undefined, secretKey), false);
  assert.equal(verifyServiceKey('', secretKey), false);
  assert.equal(verifyServiceKey(secretKey, ''), false);
});

test('ServiceAuth - stripInternalHeaders strips gateway spoofed headers', () => {
  const incoming = {
    'content-type': 'application/json',
    'x-service-key': 'attacker-forged-key',
    'X-Actor-Session': 'spoofed-session-token',
    authorization: 'Bearer valid-user-token',
  };

  const stripped = stripInternalHeaders(incoming);

  assert.equal('x-service-key' in stripped, false);
  assert.equal('X-Actor-Session' in stripped, false);
  assert.equal(stripped['content-type'], 'application/json');
  assert.equal(stripped.authorization, 'Bearer valid-user-token');
});

test('ServiceAuth - buildInternalServiceHeaders constructs forward headers', () => {
  const headers = buildInternalServiceHeaders('key-123', 'session-abc');
  assert.deepEqual(headers, {
    'x-service-key': 'key-123',
    'x-actor-session': 'session-abc',
  });
});
