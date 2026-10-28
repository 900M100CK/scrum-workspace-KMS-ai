import { readFileSync } from 'node:fs';
import type { ServerOptions } from 'node:https';

export function localHttps(environment: Record<string, string | undefined>): ServerOptions | undefined {
 const keyPath = environment.SACW_DEV_TLS_KEY;
 const certPath = environment.SACW_DEV_TLS_CERT;
 if (keyPath === undefined && certPath === undefined) return undefined;
 if (!keyPath || !certPath) throw new Error('Set both SACW_DEV_TLS_KEY and SACW_DEV_TLS_CERT');
 return {key:readFileSync(keyPath),cert:readFileSync(certPath)};
}
