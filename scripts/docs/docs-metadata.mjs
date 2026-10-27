import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const manifestPath = 'docs/sdlc/diagrams/manifest.json';
const slash = value => value.replaceAll('\\', '/');
const xmlEscape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

// Expand full IDs, slash shorthand and inclusive ranges without interpreting versions as IDs.
export function adrIds(text) {
  const result = new Set();
  for (const match of text.matchAll(/ADR-(\d{4})((?:(?:\s*(?:\/|–|—|-|through)\s*)(?:ADR-)?\d{4})*)/g)) {
    let previous = Number(match[1]);
    result.add('ADR-' + String(previous).padStart(4, '0'));
    for (const tail of match[2].matchAll(/(\/|–|—|-|through)\s*(?:ADR-)?(\d{4})/g)) {
      const next = Number(tail[2]);
      assert(next >= 1 && next <= 9999, 'Invalid ADR number');
      if (tail[1] === '/') result.add('ADR-' + String(next).padStart(4, '0'));
      else {
        assert(next >= previous && next - previous < 100, 'Invalid ADR range');
        for (let id = previous; id <= next; id++) result.add('ADR-' + String(id).padStart(4, '0'));
      }
      previous = next;
    }
  }
  return [...result].sort();
}

export async function loadManifest(root) {
  const manifest = JSON.parse(await readFile(resolve(root, manifestPath), 'utf8'));
  const seenIds = new Set(), seenPaths = new Set();
  for (const artifact of manifest.artifacts) {
    assert(!seenIds.has(artifact.id) && !seenPaths.has(artifact.path), 'Duplicate manifest ID/path');
    assert(/^[\w-]+$/.test(artifact.id) && /^\d+\.\d+(?:\.\d+)?$/.test(artifact.version), 'Invalid manifest ID/version');
    for (const path of [artifact.path, artifact.drawio].filter(Boolean)) {
      assert(!path.includes('..') && !/^[A-Za-z]:|^[/\\]/.test(path), 'Manifest path must stay relative to workspace');
    }
    assert.deepEqual(artifact.adrs, [...new Set(artifact.adrs)].sort(), 'ADR list must be sorted and unique: ' + artifact.id);
    assert(artifact.adrs.every(id => /^ADR-\d{4}$/.test(id)), 'Invalid manifest ADR ID: ' + artifact.id);
    seenIds.add(artifact.id); seenPaths.add(artifact.path);
  }
  return manifest;
}

export function sourceHeader(artifact, manifest) {
  const byId = new Map(manifest.artifacts.map(a => [a.id, a]));
  const sources = [...new Set([artifact.origin, ...(artifact.sources ?? [])].filter(Boolean))].map(id => {
    const source = byId.get(id);
    assert(source, 'Unknown metadata source: ' + id);
    return id + ' v' + source.version;
  });
  return [...sources, ...artifact.adrs].join('; ');
}

export function replaceGenerated(text, name, body) {
  const begin = `<!-- BEGIN GENERATED:${name} -->`, end = `<!-- END GENERATED:${name} -->`;
  assert(text.split(begin).length === 2 && text.split(end).length === 2, 'Missing/duplicate generated region: ' + name);
  const start = text.indexOf(begin), stop = text.indexOf(end, start) + end.length;
  return text.slice(0, start) + begin + '\n' + body.trim() + '\n' + end + text.slice(stop);
}

export async function generatedOutputs(root, manifest) {
  const outputs = new Map();
  const byId = new Map(manifest.artifacts.map(a => [a.id, a]));
  const link = (from, target) => slash(relative(dirname(from), target));
  const table = path => '| Artifact ID | Version | Canonical source |\n| --- | --- | --- |\n' + manifest.artifacts.map(a => `| ${a.id} | v${a.version} | [Source](${link(path, a.path)}) |`).join('\n');
  for (const artifact of manifest.artifacts) {
    let text = (await readFile(resolve(root, artifact.path), 'utf8')).replaceAll('\r\n', '\n');
    if (artifact.drawio) {
      const origin = byId.get(artifact.origin);
      const date = artifact.date ?? manifest.date;
      const header = [`%% Origin: ${origin.path} v${origin.version}`, `%% ${artifact.id} v${artifact.version} Draft - ${date}`, `%% Sources: ${sourceHeader(artifact, manifest)}`];
      text = text.replace(/^%% (?:Origin:|Sources:|DGM-\S+ v[\d.]+ Draft)[^\n]*\n?/gm, '');
      text = header.join('\n') + '\n' + text;
      const drawio = await readFile(resolve(root, artifact.drawio), 'utf8');
      const title = `${artifact.id} v${artifact.version} Draft | ${artifact.purpose} | ${date} | Sources: ${sourceHeader(artifact, manifest)}`;
      const pattern = /(<mxCell\b[^>]*\bid="diagram-title"[^>]*\bvalue=")[^"]*(")/;
      assert(pattern.test(drawio), 'Missing native diagram title: ' + artifact.id);
      outputs.set(artifact.drawio, drawio.replace(pattern, (_, before, after) => before + xmlEscape(title) + after));
    } else {
      assert(text.includes('**Artifact ID:** ' + artifact.id), 'Metadata ID mismatch: ' + artifact.path);
      text = text.replace(/(\*\*Version\/date:\*\*\s*)[\d.]+/, (_, prefix) => prefix + artifact.version);
    }
    outputs.set(artifact.path, text);
  }
  for (const path of ['docs/sdlc/diagrams/README.md', 'docs/sdlc/artifact-register.md']) {
    let text = outputs.get(path);
    text = replaceGenerated(text, 'artifact-versions', table(path));
    if (path.endsWith('/diagrams/README.md')) {
      const rows = manifest.artifacts.filter(a => a.drawio).map(a => `| ${a.id} | [Draw.io](${link(path, a.drawio)}) / [Mermaid](${link(path, a.path)}) | ${a.purpose} | ${a.adrs.join(', ')} |`);
      text = replaceGenerated(text, 'diagram-inventory', '| ID | Sources | Purpose | ADR inputs |\n| --- | --- | --- | --- |\n' + rows.join('\n'));
    }
    outputs.set(path, text);
  }
  for (const group of [...new Set(manifest.artifacts.filter(a => a.drawio).map(a => a.path.split('/').at(-2)))]) {
    const path = `docs/sdlc/diagrams/${group}/README.md`;
    const diagrams = manifest.artifacts.filter(a => a.drawio && a.path.startsWith(`docs/sdlc/diagrams/${group}/`));
    outputs.set(path, `# ${group} diagrams\n\n<!-- Generated by npm run docs:sync-metadata. Edit manifest.json and canonical sources. -->\n\nInventory: UML-07 v${byId.get('UML-07').version} · ${byId.get('UML-07').date ?? manifest.date}. See the [central index](../README.md) and [design foundation](../design-foundation-2026-10-17.md) and [nine-pair correction review](../review-2026-10-17.md) for evidence and remaining gaps.\n\n` + diagrams.map(a => `- **${a.id} v${a.version} Draft**: [Draw.io](${link(path, a.drawio)}) · [Mermaid](${link(path, a.path)}). ${a.purpose}. ADRs: ${a.adrs.join(', ')}.`).join('\n') + '\n');
  }
  return outputs;
}

export async function syncMetadata(root, { check = false } = {}) {
  const manifest = await loadManifest(root);
  const outputs = await generatedOutputs(root, manifest);
  const drift = [];
  for (const [path, expected] of outputs) {
    const actual = (await readFile(resolve(root, path), 'utf8')).replaceAll('\r\n', '\n');
    if (actual !== expected.replaceAll('\r\n', '\n')) {
      drift.push(path);
      if (!check) await writeFile(resolve(root, path), expected, 'utf8');
    }
  }
  if (check) assert.equal(drift.length, 0, 'Generated metadata drift; run npm run docs:sync-metadata: ' + drift.join(', '));
  return { checked: outputs.size, changed: drift };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
  try { console.log(JSON.stringify(await syncMetadata(root, { check: process.argv.includes('--check') }), null, 2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
