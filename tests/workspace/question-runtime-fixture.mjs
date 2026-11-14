import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createServer} from 'node:net';
import {createServer as createHttps} from 'node:https';
import {readFile} from 'node:fs/promises';

export async function freePort() {
  const listener = createServer();
  listener.listen(0, '127.0.0.1');
  await once(listener, 'listening');
  const {port} = listener.address();
  await new Promise((done, reject) => listener.close(error => error ? reject(error) : done()));
  return port;
}

export async function service(t, name, environment) {
  const port = await freePort();
  const child = spawn(process.execPath, ['services/' + name + '/src/server.ts'], {
    env: {...process.env, ...environment, PORT: String(port)},
    stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true,
  });
  const exited = once(child, 'exit');
  let diagnostics = '';
  child.stderr.on('data', chunk => { diagnostics += chunk; });
  t.after(async () => {
    if (child.exitCode === null && child.signalCode === null) child.kill();
    await exited;
  });
  const protocol = name === 'knowledge' ? 'https' : 'http';
  const base = protocol + '://localhost:' + port;
  const deadline = Date.now() + 6000;
  while (Date.now() < deadline && child.exitCode === null) {
    const response = await fetch(base + '/healthz').catch(() => null);
    if (response?.ok) return {base, stop: async () => {child.kill(); await exited;}};
    await new Promise(done => setTimeout(done, 40));
  }
  assert.fail(name + ' startup failed: ' + diagnostics.split('\n').slice(0, 12).join('\n'));
}


export async function knowledgeFaults(t, target, certificate) {
  let fault;
  const server = createHttps({cert:await readFile(certificate),key:await readFile('.tmp/local-https/localhost.key')},
    async (request, reply) => {
      try {
        const chunks = [];
        for await (const chunk of request) chunks.push(chunk);
        const raw = Buffer.concat(chunks);
        const input = raw.length ? JSON.parse(raw) : null;
        const upstream = await fetch(target + request.url, {method:request.method,headers:{
          ...request.headers, host:new URL(target).host,
        }, ...(raw.length ? {body:raw} : {})});
        const bytes = Buffer.from(await upstream.arrayBuffer());
        if (fault?.matches(request.url, input)) {
          const {apply, reached} = fault;
          fault = undefined;
          reached();
          const altered = await apply(bytes);
          if (altered === null) return reply.destroy();
          return reply.writeHead(upstream.status,{'content-type':'application/json'}).end(altered);
        }
        reply.writeHead(upstream.status,{'content-type':'application/json'}).end(bytes);
      } catch {
        reply.destroy();
      }
    });
  server.listen(0,'127.0.0.1');
  await once(server,'listening');
  t.after(()=>{server.closeAllConnections();return new Promise(done=>server.close(done));});
  return {base:'https://localhost:'+server.address().port, once(matches,apply) {
    assert.equal(fault,undefined);
    const reached = Promise.withResolvers();
    fault = {matches,apply,reached:reached.resolve};
    return reached.promise;
  }};
}
