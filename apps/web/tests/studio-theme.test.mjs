import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('Light theme tokens retain readable surfaces, controls and primary action', () => {
  const css = readFileSync(new URL('../tokens.css', import.meta.url), 'utf8');
  const tokens = Object.assign({}, ...[...css.matchAll(/:root\s*\{([^}]+)\}/g)].map(block => Object.fromEntries([...block[1].matchAll(/--([\w-]+):\s*(#[\da-f]{6})\s*;/gi)].map(match => [match[1], match[2]]))));
  const luminance = hex => {
    const [r, g, b] = [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16) / 255)
      .map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const ratio = (fg, bg) => {
    const a = luminance(tokens[fg]), b = luminance(tokens[bg]);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  };
  for (const fg of ['text', 'muted', 'faint']) for (const bg of ['ground', 'workspace-surface', 'rail-surface', 'surface', 'column-surface', 'card-surface', 'raised', 'active']) assert.ok(ratio(fg, bg) >= 4.5, `${fg}/${bg}`);
  assert.ok(ratio('source-fg', 'source-bg') >= 4.5, 'source-fg/source-bg');
  for (const bg of ['primary', 'primary-hover']) assert.ok(ratio('primary-ink', bg) >= 4.5, bg);
  for (const fg of ['control', 'accent']) for (const bg of ['ground', 'surface']) assert.ok(ratio(fg, bg) >= 3, `${fg}/${bg}`);
});
