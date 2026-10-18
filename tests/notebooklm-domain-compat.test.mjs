import assert from 'node:assert/strict';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { patchAuthSource } from '../scripts/notebooklm-domain-compat.mjs';

const upstreamCheck = 'currentUrl.startsWith("https://notebooklm.google.com/")';
const fixture = `[${Array(4).fill(upstreamCheck).join(',')}]`;

test('all four auth checks accept the original and redirected HTTPS origins', () => {
  const patched = patchAuthSource(fixture);
  for (const currentUrl of [
    'https://notebooklm.google.com/',
    'https://notebook.google.com/?original_referer=https:%2F%2Faccounts.google.com%23&pli=1',
    'https://notebook.google.com/notebook/26b517bf-d6c0-4b01-b8fc-53d53b34e7bb',
  ]) {
    assert.equal(runInNewContext(patched, { currentUrl }).every(Boolean), true);
  }
});

test('login pages, lookalike domains and insecure URLs remain unauthenticated', () => {
  const patched = patchAuthSource(fixture);
  for (const currentUrl of [
    'https://accounts.google.com/?continue=https://notebook.google.com/',
    'https://notebook.google.com.evil.example/',
    'https://notebooklm.google.com.evil.example/',
    'https://notebook.google.com@evil.example/',
    'http://notebook.google.com/',
    'https://evil.example/notebook.google.com/',
    'about:blank',
  ]) {
    assert.equal(runInNewContext(patched, { currentUrl }).some(Boolean), false);
  }
});

test('an unexpected upstream implementation fails explicitly', () => {
  assert.throws(() => patchAuthSource(upstreamCheck), /Unsupported/);
  assert.throws(() => patchAuthSource(''), /Unsupported/);
});
