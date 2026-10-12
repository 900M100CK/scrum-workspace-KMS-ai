import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';
import { DOMParser } from '@xmldom/xmldom';

// Mermaid's flowchart label sanitiser requires a DOM, even for parsing.
const dom = new JSDOM('');
globalThis.window = dom.window;
globalThis.document = dom.window.document;
const { default: mermaid } = await import('mermaid');
mermaid.initialize({ startOnLoad: false, securityLevel: 'strict' });

export function normaliseLabel(value = '') {
  const element = dom.window.document.createElement('div');
  element.innerHTML = String(value).replace(/<br\s*\/?\s*>/gi, ' ');
  return element.textContent.replace(/\s+/g, ' ').trim();
}

export async function parseMermaid(text) {
  // Use the actual grammar, not a regex subset. The pinned DB adapter fails
  // explicitly if a new diagram type/API is introduced.
  await mermaid.parse(text);
  const diagram = await mermaid.mermaidAPI.getDiagramFromText(text);
  if (diagram.type.startsWith('flowchart')) {
    const vertices = diagram.db.getVertices();
    assert(vertices instanceof Map, 'Mermaid flowchart DB changed; update adapter');
    return {
      type: 'flowchart',
      nodes: [...vertices.values()].map(v => ({ id: v.id, label: normaliseLabel(v.text), shape: v.type })),
      edges: diagram.db.getEdges().map(e => {
        assert.equal(e.type, 'arrow_point', 'Only directed single-arrow flowchart edges are supported');
        return { source: e.start, target: e.end, label: normaliseLabel(e.text) };
      }),
    };
  }
  assert.equal(diagram.type, 'journey', 'Unsupported Mermaid diagram type: ' + diagram.type);
  return { type: 'journey', sections: diagram.db.getSections(), tasks: diagram.db.getTasks() };
}

export function parseDrawio(text) {
  const errors = [];
  const xml = new DOMParser({ onError: (level, message) => errors.push(level + ': ' + message) }).parseFromString(text, 'text/xml');
  assert.equal(errors.length, 0, 'Invalid Draw.io XML: ' + errors.join('; '));
  assert.equal(xml.documentElement.tagName, 'mxfile', 'Expected mxfile root');
  assert.equal(xml.getElementsByTagName('diagram').length, 1, 'Expected one native editable page');
  assert.equal(xml.getElementsByTagName('mxGraphModel').length, 1, 'Compressed Draw.io pages need an explicit adapter');
  const cells = [...xml.getElementsByTagName('mxCell')];
  const ids = new Set();
  for (const cell of cells) {
    const id = cell.getAttribute('id');
    assert(id && !ids.has(id), 'Duplicate/missing Draw.io cell ID: ' + id);
    ids.add(id);
  }
  assert(ids.has('0') && ids.has('1'), 'Missing Draw.io root cells');
  const nodes = cells.filter(c => c.getAttribute('vertex') === '1').map(c => ({
    id: c.getAttribute('id'), label: normaliseLabel(c.getAttribute('value')),
    style: c.getAttribute('style'),
  }));
  const vertices = new Set(nodes.map(n => n.id));
  const edges = cells.filter(c => c.getAttribute('edge') === '1').map(c => {
    const source = c.getAttribute('source'), target = c.getAttribute('target');
    assert(vertices.has(source) && vertices.has(target), 'Dangling Draw.io edge: ' + source + ' -> ' + target);
    const geometry = c.getElementsByTagName('mxGeometry')[0];
    assert(geometry?.getAttribute('relative') === '1', 'Missing relative edge geometry');
    assert(/(?:^|;)endArrow=block(?:;|$)/.test(c.getAttribute('style')), 'Unexpected Draw.io arrow direction/style');
    assert(!/(?:^|;)startArrow=(?!none(?:;|$))/.test(c.getAttribute('style')), 'Unexpected bidirectional Draw.io edge');
    return { source, target, label: normaliseLabel(c.getAttribute('value')) };
  });
  return { nodes, edges };
}

function edgeKeys(edges) {
  // Preserve multiplicity: sets alone miss duplicate parallel edges.
  return edges.map(e => JSON.stringify([e.source, e.target, e.label])).sort();
}

export function compareGraphs(mermaidGraph, drawioGraph) {
  if (mermaidGraph.type === 'flowchart') {
    const actual = drawioGraph.nodes.filter(n => n.id !== 'diagram-title');
    assert.deepEqual(actual.map(n => [n.id, n.label]).sort(), mermaidGraph.nodes.map(n => [n.id, n.label]).sort(), 'Mermaid/Draw.io node ID or label mismatch');
    assert.deepEqual(edgeKeys(drawioGraph.edges), edgeKeys(mermaidGraph.edges), 'Mermaid/Draw.io edge direction, label or count mismatch');
    return;
  }
  const sections = drawioGraph.nodes.filter(n => n.id.startsWith('section-')).sort((a, b) => Number(a.id.slice(8)) - Number(b.id.slice(8)));
  assert.deepEqual(sections.map(n => n.label), mermaidGraph.sections.map(normaliseLabel), 'Journey section/order mismatch');
  const tasks = mermaidGraph.tasks.map((task, i) => ({
    id: 'step_' + i,
    label: normaliseLabel(task.task + ' ' + task.people.join(', ') + ' · illustrative score ' + task.score),
  }));
  assert.deepEqual(drawioGraph.nodes.filter(n => n.id !== 'diagram-title' && !n.id.startsWith('section-')).map(n => [n.id, n.label]).sort(), tasks.map(n => [n.id, n.label]).sort(), 'Journey task, actor, score or order mismatch');
  const edges = [];
  mermaidGraph.tasks.forEach((task, i, list) => {
    if (i && list[i - 1].section === task.section) edges.push({ source: 'step_' + (i - 1), target: 'step_' + i, label: '' });
  });
  assert.deepEqual(edgeKeys(drawioGraph.edges), edgeKeys(edges), 'Journey sequence edge mismatch');
}

export function readVersion(text, id) {
  const header = text.match(/\*\*Version\/date:\*\*\s*(\d+\.\d+(?:\.\d+)?)/);
  const mmd = text.match(/^%%\s+(\S+)\s+v(\d+\.\d+(?:\.\d+)?)\s+Draft/m);
  assert(header || (mmd && mmd[1] === id), 'Missing/mismatched version header: ' + id);
  if (header) assert.equal(text.match(/\*\*Artifact ID:\*\*\s*([\w-]+)/)?.[1], id, 'Artifact ID mismatch: ' + id);
  return header?.[1] ?? mmd[2];
}

export function checkVersionTable(text, versions, location) {
  const section = text.split('## Current artifact versions\n')[1]?.split(/^## /m)[0];
  assert(section, 'Missing current version table in ' + location);
  const rows = [...section.matchAll(/^\| ([\w-]+) \| v([\d.]+) \|/gm)];
  assert.equal(rows.length, versions.size, 'Missing/extra version rows in ' + location);
  const seen = new Set();
  for (const [, id, version] of rows) {
    assert(!seen.has(id), 'Duplicate version row: ' + id);
    seen.add(id);
    assert.equal(version, versions.get(id), 'Version drift in ' + location + ': ' + id);
  }
}

export function checkCurrentReferences(text, versions, location) {
  let historical = false;
  const current = text.split('\n').filter(line => {
    if (/^## /.test(line)) historical = /^## Historical\b/i.test(line);
    return !historical;
  }).join('\n');
  for (const [id, version] of versions) {
    for (const match of current.matchAll(new RegExp('\\b' + id + '\\s+v(\\d+\\.\\d+(?:\\.\\d+)?)', 'g'))) {
      assert.equal(match[1], version, 'Current reference version drift in ' + location + ': ' + id);
    }
  }
}

async function walk(directory) {
  const files = [];
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, item.name);
    if (item.isDirectory()) files.push(...await walk(path));
    else files.push(path);
  }
  return files;
}

export async function verifyDocs(root) {
  const indexPath = 'docs/sdlc/diagrams/manifest.json';
  const manifest = JSON.parse(await readFile(resolve(root, indexPath), 'utf8'));
  const versions = new Map();
  const sourceTexts = new Map();
  for (const artifact of manifest.artifacts) {
    assert(!versions.has(artifact.id), 'Duplicate manifest artifact: ' + artifact.id);
    const text = (await readFile(resolve(root, artifact.path), 'utf8')).replace(/\r\n/g, '\n');
    versions.set(artifact.id, readVersion(text, artifact.id));
    sourceTexts.set(artifact.id, text);
  }
  const paired = manifest.artifacts.filter(a => a.drawio);
  const actualMmd = (await walk(resolve(root, 'docs/sdlc/diagrams'))).filter(p => p.endsWith('.mmd')).map(p => relative(root, p).replaceAll('\\', '/')).sort();
  assert.deepEqual(actualMmd, paired.map(a => a.path).sort(), 'Unregistered/missing Mermaid source');
  let nodes = 0, edges = 0;
  for (const artifact of paired) {
    const source = sourceTexts.get(artifact.id);
    const mmd = await parseMermaid(source);
    const xmlText = await readFile(resolve(root, artifact.drawio), 'utf8');
    const drawio = parseDrawio(xmlText);
    compareGraphs(mmd, drawio);
    const title = drawio.nodes.find(n => n.id === 'diagram-title')?.label;
    assert(title && new RegExp('^' + artifact.id + '(?: | ·)').test(title), 'Draw.io title ID mismatch: ' + artifact.id);
    assert.equal(title.match(/\bv([\d.]+)\s+Draft/)?.[1], versions.get(artifact.id), 'Draw.io version drift: ' + artifact.id);
    const origin = manifest.artifacts.find(a => a.id === artifact.origin);
    assert(origin, 'Missing origin for ' + artifact.id);
    assert(source.includes('%% Origin: ' + origin.path + ' v' + versions.get(origin.id)), 'Origin version drift: ' + artifact.id);
    nodes += drawio.nodes.length - 1;
    edges += drawio.edges.length;
  }
  for (const path of ['docs/sdlc/diagrams/README.md', 'docs/sdlc/artifact-register.md']) {
    const text = (await readFile(resolve(root, path), 'utf8')).replace(/\r\n/g, '\n');
    checkVersionTable(text, versions, path);
    checkCurrentReferences(text, versions, path);
    // Check versioned origin links in current inventory, leaving explicitly
    // historical review snapshots intact.
    const inventory = text.split('## Inventory and Trace\n')[1]?.split(/^## /m)[0];
    if (inventory) for (const [, link, version] of inventory.matchAll(/\]\(([^)]+)\) v([\d.]+)/g)) {
      const target = resolve(root, dirname(path), link);
      const artifact = manifest.artifacts.find(a => resolve(root, a.path) === target);
      assert(artifact && versions.get(artifact.id) === version, 'Inventory origin version drift: ' + link);
    }
  }
  return { diagrams: paired.length, artifacts: versions.size, nodes, edges, runtimeEvidence: 'not run' };
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { console.log(JSON.stringify(await verifyDocs(root), null, 2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
