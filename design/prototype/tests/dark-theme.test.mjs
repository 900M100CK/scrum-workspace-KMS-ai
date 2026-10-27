import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('dark theme tokens meet text and non-text contrast thresholds', () => {
  const css = readFileSync(new URL('../tokens.css', import.meta.url), 'utf8');
  const block = [...css.matchAll(/:root\[data-theme="dark"\]\s*\{([^}]+)\}/g)].map(match => match[1]).join('\n');
  const tokens = Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[\da-f]{6})\s*;/gi)].map(match => [match[1], match[2]]));
  const luminance = hex => {
    const [r, g, b] = [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16) / 255)
      .map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const contrast = (a, b) => {
    const values = [luminance(tokens[a]), luminance(tokens[b])];
    return (Math.max(...values) + 0.05) / (Math.min(...values) + 0.05);
  };
  assert.ok(contrast('blocked-text', 'blocked-bg') >= 4.5, 'blocked-text/blocked-bg');
  for (const fg of ['text', 'muted', 'faint']) {
    for (const bg of ['ground', 'surface', 'column-surface', 'card-surface', 'active', 'raised']) {
      assert.ok(contrast(fg, bg) >= 4.5, `${fg}/${bg}: ${contrast(fg, bg).toFixed(2)}`);
    }
  }
  for (const [fg, bg] of [['primary-ink', 'primary'], ['primary-ink', 'primary-hover'], ['warning', 'warning-bg'], ['source-fg', 'source-bg'], ['avatar-fg', 'avatar-bg'], ['danger', 'surface'], ['done', 'surface']]) {
    assert.ok(contrast(fg, bg) >= 4.5, `${fg}/${bg}`);
  }
  for (const fg of ['accent', 'control', 'progress', 'done']) {
    for (const bg of ['surface', 'ground', 'column-surface']) assert.ok(contrast(fg, bg) >= 3, `${fg}/${bg}`);
  }
});
