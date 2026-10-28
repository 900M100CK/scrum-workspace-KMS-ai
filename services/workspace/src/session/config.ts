export interface SessionPolicy {
 readonly idleSeconds: number;
 readonly absoluteSeconds: number;
}

export function readSessionPolicy(environment: Record<string, string | undefined>): SessionPolicy {
 const seconds = (name: string, fallback: number): number => {
  const value = environment[name];
  if (value === undefined) return fallback;
  if (!/^[1-9]\d*$/.test(value)) throw new Error(`${name} must be positive integer seconds`);
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed > Math.floor(Number.MAX_SAFE_INTEGER / 1000)) throw new Error(`${name} is too large`);
  return parsed;
 };
 const idleSeconds = seconds('SESSION_IDLE_SECONDS', 30 * 60);
 const absoluteSeconds = seconds('SESSION_ABSOLUTE_SECONDS', 8 * 60 * 60);
 if (idleSeconds > absoluteSeconds) throw new Error('Session idle limit cannot exceed absolute limit');
 return { idleSeconds, absoluteSeconds };
}
