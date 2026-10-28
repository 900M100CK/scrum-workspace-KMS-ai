import { buildApp } from './app.ts';
import { readPort } from './config.ts';
import {sessionRuntime} from './session/runtime.ts';
const session=sessionRuntime(process.env);
const app = buildApp(session?{store:session.store,origin:session.origin}:{});
app.addHook('onClose',async()=>{if(session)await session.pool.end();});
for (const signal of ['SIGINT', 'SIGTERM'] as const) process.once(signal, () => { void app.close().catch(() => { process.exitCode = 1; }); });
try {
 await app.listen({ host: '127.0.0.1', port: readPort(process.env.PORT, 3001) });
} catch (error) {
 await app.close();
 throw error;
}
