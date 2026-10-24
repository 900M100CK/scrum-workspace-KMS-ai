import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const files = new Map([
  ['/', ['index.html', 'text/html']], ['/index.html', ['index.html', 'text/html']],
  ['/styles.css', ['styles.css', 'text/css']], ['/main.mjs', ['main.mjs', 'text/javascript']],
  ['/ui.mjs', ['ui.mjs', 'text/javascript']], ['/fixtures.mjs', ['fixtures.mjs', 'text/javascript']],
  ['/assets/Geist-Variable.ttf', ['assets/Geist-Variable.ttf', 'font/ttf']]
]);
export function createPreviewServer() {
  return createServer(async (request, response) => {
    const file = files.get(new URL(request.url, 'http://localhost').pathname);
    if (!file || !['GET', 'HEAD'].includes(request.method)) { response.writeHead(404); response.end('Not found'); return; }
    try {
      const bytes = await readFile(fileURLToPath(new URL(file[0], import.meta.url)));
      response.writeHead(200, { 'Content-Type': file[1] + (file[1].startsWith('font/') ? '' : '; charset=utf-8'), 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'self'; style-src 'self'; script-src 'self'; font-src 'self'; connect-src 'none'; img-src 'self' data:; base-uri 'none'; frame-ancestors 'none'; form-action 'none'" });
      response.end(request.method === 'HEAD' ? undefined : bytes);
    } catch { response.writeHead(500); response.end('Preview unavailable'); }
  });
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createPreviewServer().listen(4173, '127.0.0.1', () => process.stdout.write('UI preview: http://127.0.0.1:4173\n'));
}
