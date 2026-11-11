import {timingSafeEqual} from 'node:crypto';

export function verifyServiceKey(receivedKey: string | undefined, expectedKey: string): boolean {
  if (!receivedKey || !expectedKey) {
    return false;
  }

  const expectedBuf = Buffer.from(expectedKey, 'utf8');
  const receivedBuf = Buffer.from(receivedKey, 'utf8');

  if (expectedBuf.length !== receivedBuf.length) {
    timingSafeEqual(expectedBuf, expectedBuf);
    return false;
  }

  return timingSafeEqual(receivedBuf, expectedBuf);
}
