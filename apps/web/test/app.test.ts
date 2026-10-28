import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';
test('the actual Vite-transformed React entry renders a locked checking state before server confirmation', async () => {
 const server = await createServer({ root: fileURLToPath(new URL('..', import.meta.url)), server: { middlewareMode: true, hmr: false }, appType: 'custom' });
 try {
  const { App } = await server.ssrLoadModule('/src/App.tsx');
  const html = renderToStaticMarkup(createElement(App));
  assert.match(html, /<main id="main" aria-busy="true">/);
  assert.match(html, /Checking your session/);
  assert.doesNotMatch(html, /type="password"|actor_id|user_id/);
 } finally { await server.close(); }
});
