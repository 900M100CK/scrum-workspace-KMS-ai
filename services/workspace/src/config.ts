export function readPort(value: string | undefined, fallback: number): number {
 if (value === undefined) return fallback;
 if (!/^\d+$/.test(value)) throw new Error('PORT must be an integer from 1 to 65535');
 const port = Number(value);
 if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be an integer from 1 to 65535');
 return port;
}
