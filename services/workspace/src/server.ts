import {WorkspaceSprintStore} from './sprints/store.ts';
import { buildApp } from './app.ts';
import { readPort } from './config.ts';
import {sessionRuntime} from './session/runtime.ts';
import {WorkspaceProjectStore} from './projects/store.ts';
import {cursorKey} from './projects/cursor.ts';
import {WorkspaceTaskStore} from './tasks/store.ts';
const session=sessionRuntime(process.env);
const key=session?cursorKey(process.env.SACW_PROJECT_CURSOR_KEY):null;
const app = buildApp(session?{store:session.store,origin:session.origin,projects:new WorkspaceProjectStore(session.pool,session.store,key),tasks:new WorkspaceTaskStore(session.pool,session.store,key),sprints:new WorkspaceSprintStore(session.pool,session.store,key)}:{});
app.addHook('onClose',async()=>{if(session)await session.pool.end();});
for (const signal of ['SIGINT', 'SIGTERM'] as const) process.once(signal, () => { void app.close().catch(() => { process.exitCode = 1; }); });
try {
 await app.listen({ host: '127.0.0.1', port: readPort(process.env.PORT, 3001) });
} catch (error) {
 await app.close();
 throw error;
}
