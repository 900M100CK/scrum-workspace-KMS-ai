import { timingSafeEqual } from 'node:crypto';

/**
 * Constant-time comparison of service keys to prevent timing analysis attacks.
 * If the received key is missing or length does not match expected key,
 * a dummy comparison is performed against the expected key to maintain consistent timing.
 */
export function verifyServiceKey(receivedKey: string | undefined, expectedKey: string): boolean {
  if (!receivedKey || !expectedKey) {
    return false;
  }

  const expectedBuf = Buffer.from(expectedKey, 'utf8');
  const receivedBuf = Buffer.from(receivedKey, 'utf8');

  if (expectedBuf.length !== receivedBuf.length) {
    // Constant-time dummy comparison to prevent timing leak on length mismatch
    timingSafeEqual(expectedBuf, expectedBuf);
    return false;
  }

  return timingSafeEqual(receivedBuf, expectedBuf);
}

/**
 * Strips incoming service headers from external client requests at the gateway boundary.
 * Prevents client spoofing of internal identity and service authorization.
 */
export function stripInternalHeaders<T extends Record<string, any>>(headers: T): T {
  const sanitized = { ...headers };
  const internalHeaderNames = ['x-service-key', 'x-actor-session'];

  for (const key of Object.keys(sanitized)) {
    if (internalHeaderNames.includes(key.toLowerCase())) {
      delete sanitized[key];
    }
  }

  return sanitized;
}

/**
 * Builds trusted internal headers for Workspace-Knowledge service-to-service communication.
 */
export function buildInternalServiceHeaders(serviceKey: string, actorSessionId: string): Record<string, string> {
  return {
    'x-service-key': serviceKey,
    'x-actor-session': actorSessionId,
  };
}
