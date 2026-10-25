import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';
import { DOMParser } from '@xmldom/xmldom';
import { adrIds, loadManifest, syncMetadata } from './docs-metadata.mjs';
import { verifyDesignPair } from './design-diagrams.mjs';

// Mermaid's flowchart label sanitiser requires a DOM, even for parsing.
const dom = new JSDOM('');
globalThis.window = dom.window;
globalThis.document = dom.window.document;
const { default: mermaid } = await import('mermaid');
mermaid.initialize({ startOnLoad: false, securityLevel: 'strict' });

export function normaliseLabel(value = '') {
  const element = dom.window.document.createElement('div');
  element.innerHTML = String(value ?? '').replace(/<br\s*\/?\s*>/gi, ' ');
  return element.textContent.replace(/\s+/g, ' ').trim();
}

export async function parseMermaid(text, { kind = 'flowchart' } = {}) {
  // Use the actual grammar, not a regex subset. The pinned DB adapter fails
  // explicitly if a new diagram type/API is introduced.
  await mermaid.parse(text);
  const diagram = await mermaid.mermaidAPI.getDiagramFromText(text);
  if (diagram.type.startsWith('flowchart')) {
    const vertices = diagram.db.getVertices();
    assert(vertices instanceof Map, 'Mermaid flowchart DB changed; update adapter');
    if (kind === 'use-case') {
      const boundary = diagram.db.getSubGraphs().find(group => group.id === 'Boundary');
      assert(boundary && boundary.nodes.length === 13 && boundary.nodes.every(id => /^uc\d\d$/.test(id)), 'Mermaid system boundary must contain exactly the 13 use cases');
    }
    return {
      type: kind === 'use-case' ? 'use-case' : 'flowchart',
      nodes: [...vertices.values()].map(v => ({ id: v.id, label: normaliseLabel(v.text), shape: v.type })),
      edges: diagram.db.getEdges().map(e => {
        if (kind === 'use-case') {
          const label = normaliseLabel(e.text);
          const relation = label === 'specializes' ? 'generalization' : label === '«include»' ? 'include' : 'association';
          assert(relation !== 'association' || e.type === 'arrow_open', 'Use-case association must be undirected');
          assert(relation !== 'include' || e.stroke === 'dotted', 'Use-case include must be dashed');
          assert(relation === 'association' || e.type === 'arrow_point', 'Directed UML relation is missing its arrow');
          return { source: e.start, target: e.end, relation };
        }
        assert.equal(e.type, 'arrow_point', 'Only directed single-arrow flowchart edges are supported');
        return { source: e.start, target: e.end, label: normaliseLabel(e.text) };
      }),
    };
  }
  assert.equal(diagram.type, 'journey', 'Unsupported Mermaid diagram type: ' + diagram.type);
  return { type: 'journey', sections: diagram.db.getSections(), tasks: diagram.db.getTasks() };
}

export function parseDrawio(text, { kind = 'flowchart' } = {}) {
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
  if (kind === 'use-case') {
    const boundary = cells.find(c => c.getAttribute('id') === 'sys-boundary');
    assert(boundary && /swimlane/.test(boundary.getAttribute('style')), 'Missing UML system boundary');
    assert.equal(cells.filter(c => c.getAttribute('vertex') === '1' && /^uc\d\d$/.test(c.getAttribute('id')) && c.getAttribute('parent') === 'sys-boundary').length, 13, 'All 13 use cases must be inside the system boundary');
    for (const node of nodes.filter(n => /^uc\d\d$/.test(n.id))) assert(/ellipse/.test(node.style), 'Use case must retain native ellipse: ' + node.id);
    for (const node of nodes.filter(n => n.id.startsWith('actor-'))) assert(/umlActor/.test(node.style), 'Actor must retain native UML shape: ' + node.id);
  }
  const edges = cells.filter(c => c.getAttribute('edge') === '1').map(c => {
    const source = c.getAttribute('source'), target = c.getAttribute('target');
    assert(vertices.has(source) && vertices.has(target), 'Dangling Draw.io edge: ' + source + ' -> ' + target);
    const geometry = c.getElementsByTagName('mxGeometry')[0];
    assert(geometry?.getAttribute('relative') === '1', 'Missing relative edge geometry');
    if (kind === 'use-case') {
      const style = c.getAttribute('style');
      const label = normaliseLabel(c.getAttribute('value'));
      assert(!/(?:^|;)startArrow=(?!none(?:;|$))/.test(style), 'Unexpected UML start arrow');
      if (/endArrow=none(?:;|$)/.test(style)) {
        assert(!label && !/dashed=1/.test(style), 'Association must be plain and undirected');
        return { source, target, relation: 'association' };
      }
      if (/endArrow=open(?:;|$)/.test(style)) {
        assert(label === '«include»' && /dashed=1/.test(style), 'Include relation must retain dashed open arrow and label');
        return { source, target, relation: 'include' };
      }
      assert(/endArrow=block(?:;|$)/.test(style) && /endFill=0(?:;|$)/.test(style) && !/dashed=1/.test(style), 'Generalization must retain hollow triangle');
      assert(!label, 'Unexpected generalization label');
      return { source, target, relation: 'generalization' };
    }
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
  if (mermaidGraph.type === 'use-case') {
    const id = value => value.startsWith('actor_') ? value.replaceAll('_', '-') : value;
    const label = value => value.replace(/^(UC-\d\d):?\s*/, '$1 ');
    const actual = drawioGraph.nodes.filter(n => n.id !== 'diagram-title' && n.id !== 'sys-boundary');
    assert.deepEqual(actual.map(n => [n.id, label(n.label)]).sort(), mermaidGraph.nodes.map(n => [id(n.id), label(n.label)]).sort(), 'Use-case node/actor mismatch');
    const keys = edges => edges.map(e => {
      const ends = [id(e.source), id(e.target)];
      if (e.relation === 'association') ends.sort();
      return JSON.stringify([...ends, e.relation]);
    }).sort();
    assert.deepEqual(keys(drawioGraph.edges), keys(mermaidGraph.edges), 'Use-case relation kind/direction/count mismatch');
    return;
  }
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

export function checkUnselectedSearchTerms(text, location) {
  const term = /\b(?:trigram|pg_trgm|trgm|rrf|reciprocal|fusion)\b/i;
  const status = /\b(?:unselected|not adopted)\b/i;
  const labels = location.endsWith('.drawio')
    ? [...new DOMParser().parseFromString(text, 'text/xml').getElementsByTagName('mxCell')].map(cell => normaliseLabel(cell.getAttribute('value')))
    : text.split(/\r?\n/);
  for (const [index, line] of labels.entries()) {
    if (/^services\/[^/]+\/migrations\/.*\.sql$/i.test(location)) {
      assert(!term.test(line), `Unselected search mechanism in applied migration: ${location}:${index + 1}`);
    }
    assert(!term.test(line) || status.test(line), `Unselected search mechanism presented as current: ${location}:${index + 1}`);
  }
}

export function checkSourceAdrs(text, location) {
  const lines = text.split(/\r?\n/);
  const index = lines.findIndex(line => /^(?:%% Sources:|\*\*Sources:\*\*|Sources:)/.test(line));
  assert(index >= 0, 'Missing Sources header: ' + location);
  const listed = new Set(adrIds(lines[index]));
  const missing = adrIds(lines.filter((_, i) => i !== index).join('\n')).filter(id => !listed.has(id));
  assert.equal(missing.length, 0, 'Sources omit body ADRs in ' + location + ': ' + missing.join(', '));
}

export function checkOperationRefs(graph, refs, contracts) {
  for (const ref of refs ?? []) {
    const operation = contracts.get(ref.service)?.paths[ref.path]?.[ref.method.toLowerCase()];
    assert.equal(operation?.operationId, ref.id, 'Operation ID/path drift: ' + ref.id);
    assert(graph.nodes.find(n => n.id === ref.node)?.label.includes(ref.label), 'Operation label drift: ' + ref.id);
  }
}

export function checkInputHeader(text, versions, location) {
  const header = text.split(/\r?\n/).find(line => /^\*\*Inputs:\*\*/.test(line));
  if (!header) return;
  const highest = value => Math.max(0, ...[...value.matchAll(/ADR-00(\d\d)/g)].map(match => Number(match[1])));
  const cited = highest(text);
  const listed = highest(header);
  if (listed && cited > listed) {
    assert.fail(`ADR input header is behind body in ${location}: ADR-00${String(listed).padStart(2, '0')} < ADR-00${String(cited).padStart(2, '0')}`);
  }
  for (const [, id, version] of header.matchAll(/\b([A-Z][A-Z-]*-\d\d)\s+v(\d+\.\d+(?:\.\d+)?)/g)) {
    if (versions.has(id)) assert.equal(version, versions.get(id), `Input version drift in ${location}: ${id}`);
  }
}

export function versionedInputLinks(text) {
  const header = text.split(/\r?\n/).find(line => /^\*\*(?:Inputs|Sources|Source versions):\*\*/.test(line));
  if (!header) return [];
  return [...header.matchAll(/\[[^\]]+\]\(([^)]+)\)\s+v(\d+\.\d+(?:\.\d+)?)/g)]
    .filter(([, href]) => !/^[a-z]+:/i.test(href))
    .map(([, href, version]) => ({href, version}));
}

export function checkLinkedInputVersions(text, versionsByLink, location) {
  for (const {href, version} of versionedInputLinks(text)) {
    if (versionsByLink.has(href)) assert.equal(version, versionsByLink.get(href), 'Linked input version drift in ' + location + ': ' + href);
  }
}

async function checkSearchTerminology(root) {
  const locations = ['docs', 'contracts', 'specs', 'eval', 'services/workspace/migrations', 'services/knowledge/migrations'];
  for (const location of locations) {
    for (const path of await walk(resolve(root, location))) {
      const relativePath = relative(root, path).replaceAll('\\', '/');
      if (relativePath.split('/').some(part => /history|^CHANGELOG/i.test(part))) continue;
      // These dated reports describe old diagrams; current canonical sources are checked separately.
      if (/^docs\/sdlc\/documentation-freshness(?:-inventory)?-2026-10-17\.md$/.test(relativePath)) continue;
      if (!/\.(?:md|mmd|drawio|json|sql|ya?ml)$/i.test(path)) continue;
      checkUnselectedSearchTerms(await readFile(path, 'utf8'), relativePath);
    }
  }
}

export async function verifyDocs(root) {
  await checkSearchTerminology(root);
  await syncMetadata(root, { check: true });
  const manifest = await loadManifest(root);
  const contracts = new Map(await Promise.all(['workspace', 'knowledge'].map(async service => [service, JSON.parse(await readFile(resolve(root, 'contracts/openapi/' + service + '.openapi.json'), 'utf8'))])));
  const versions = new Map();
  const sourceTexts = new Map();
  for (const artifact of manifest.artifacts) {
    assert(!versions.has(artifact.id), 'Duplicate manifest artifact: ' + artifact.id);
    const text = (await readFile(resolve(root, artifact.path), 'utf8')).replace(/\r\n/g, '\n');
    assert.equal(readVersion(text, artifact.id), artifact.version, 'Manifest version mismatch: ' + artifact.id);
    versions.set(artifact.id, artifact.version);
    sourceTexts.set(artifact.id, text);
  }
  const inputVersions = new Map(versions);
  const activeDocs = ['docs/architecture.md', 'contracts/README.md',
    ...(await walk(resolve(root, 'docs/sdlc')))
      .map(path => relative(root, path).replaceAll('\\', '/'))
      .filter(path => path.endsWith('.md') && !path.startsWith('docs/sdlc/diagrams/') && !/history|CHANGELOG/i.test(path)),
    ...((await readdir(resolve(root, 'specs'))).filter(name => name.endsWith('.md')).map(name => 'specs/' + name)),
    ...(await walk(resolve(root, 'docs/ux'))).filter(path => path.endsWith('.md')).map(path => relative(root, path).replaceAll('\\','/')),
  ];
  const activeTexts = new Map();
  for (const path of activeDocs) {
    const source = await readFile(resolve(root, path), 'utf8');
    activeTexts.set(path, source);
    const id = source.match(/\*\*Artifact ID:\*\*\s*([\w-]+)/)?.[1];
    if (id && !inputVersions.has(id)) inputVersions.set(id, readVersion(source, id));
  }
  for (const [path, source] of activeTexts) {
    checkInputHeader(source, inputVersions, path);
    const versionsByLink = new Map();
    for (const {href} of versionedInputLinks(source)) {
      const target = resolve(root, dirname(path), href.split('#')[0]);
      assert(!relative(root, target).startsWith('..'), 'Versioned input must remain inside workspace: ' + href);
      const targetText = await readFile(target, 'utf8');
      const version = targetText.match(/\*\*Version\/date:\*\*\s*(\d+\.\d+(?:\.\d+)?)/)?.[1];
      if (version) versionsByLink.set(href, version);
    }
    checkLinkedInputVersions(source, versionsByLink, path);
  }
  const paired = manifest.artifacts.filter(a => a.drawio);
  const actualMmd = (await walk(resolve(root, 'docs/sdlc/diagrams'))).filter(p => p.endsWith('.mmd')).map(p => relative(root, p).replaceAll('\\', '/')).sort();
  assert.deepEqual(actualMmd, paired.map(a => a.path).sort(), 'Unregistered/missing Mermaid source');
  const actualDrawio = (await walk(resolve(root, 'docs/sdlc/diagrams'))).filter(p => p.endsWith('.drawio')).map(p => relative(root, p).replaceAll('\\', '/')).sort();
  assert.deepEqual(actualDrawio, paired.map(a => a.drawio).sort(), 'Unregistered/missing Draw.io source');
  let nodes = 0, edges = 0;
  for (const artifact of paired) {
    const source = sourceTexts.get(artifact.id);
    checkSourceAdrs(source, artifact.path);
    if (artifact.kind === 'design') {
      const counts = await verifyDesignPair(root, artifact, text => mermaid.parse(text));
      const native = await readFile(resolve(root, artifact.drawio), 'utf8');
      const title = new DOMParser().parseFromString(native, 'text/xml').getElementsByTagName('mxCell');
      const label = [...title].find(c => c.getAttribute('id') === 'diagram-title')?.getAttribute('value');
      assert(label?.startsWith(artifact.id + ' v' + artifact.version + ' Draft'), 'Design title drift');
      nodes += counts.nodes; edges += counts.edges;
      continue;
    }
    const mmd = await parseMermaid(source, artifact);
    const xmlText = await readFile(resolve(root, artifact.drawio), 'utf8');
    const drawio = parseDrawio(xmlText, artifact);
    compareGraphs(mmd, drawio);
    checkOperationRefs(mmd, artifact.operationRefs, contracts);
    const title = drawio.nodes.find(n => n.id === 'diagram-title')?.label;
    assert(title && new RegExp('^' + artifact.id + '(?: | ·)').test(title), 'Draw.io title ID mismatch: ' + artifact.id);
    assert.equal(title.match(/\bv([\d.]+)\s+Draft/)?.[1], versions.get(artifact.id), 'Draw.io version drift: ' + artifact.id);
    const titleSources = title.slice(title.indexOf('Sources:'));
    checkSourceAdrs('Sources: ' + titleSources + '\n' + drawio.nodes.filter(n => n.id !== 'diagram-title').map(n => n.label).join('\n'), artifact.drawio);
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
