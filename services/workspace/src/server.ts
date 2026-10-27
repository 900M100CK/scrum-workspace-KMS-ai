import { buildApp } from './app.ts';
import { readPort } from './config.ts';
const app = buildApp();
for (const signal of ['SIGINT', 'SIGTERM'] as const) process.once(signal, () => { void app.close().catch(() => { process.exitCode = 1; }); });
try {
 await app.listen({ host: '127.0.0.1', port: readPort(process.env.PORT, 3001) });
} catch (error) {
 await app.close();
 throw error;
}
