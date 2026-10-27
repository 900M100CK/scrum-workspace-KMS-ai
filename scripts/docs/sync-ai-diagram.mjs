import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import ELK from 'elkjs/lib/elk.bundled.js';
import { parseMermaid, parseDrawio, compareGraphs } from './verify-docs.mjs';

// Reconcile this source-backed page only. Retain cell identities, metadata and
// visual styles; reflow the page because the missing branches change topology.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const base = resolve(root, 'docs/sdlc/diagrams/flowchart/ai-qa-flow');
const source = await readFile(base + '.mmd', 'utf8');
const graph = await parseMermaid(source);
const xml = new DOMParser().parseFromString(await readFile(base + '.drawio', 'utf8'), 'text/xml');
const cells = [...xml.getElementsByTagName('mxCell')];
const page = xml.getElementsByTagName('root')[0];
const byId = new Map(cells.map(cell => [cell.getAttribute('id'), cell]));
const oldEdges = cells.filter(cell => cell.getAttribute('edge') === '1');
const used = new Set();
const el = (tag, attributes) => {
  const element = xml.createElement(tag);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, String(value));
  return element;
};
const setStyle = (cell, values) => {
  const entries = new Map(cell.getAttribute('style').split(';').filter(Boolean).map(item => {
    const at = item.indexOf('=');
    return at < 0 ? [item, null] : [item.slice(0, at), item.slice(at + 1)];
  }));
  for (const [key, value] of Object.entries(values)) entries.set(key, String(value));
  cell.setAttribute('style', [...entries].map(([key, value]) => value === null ? key : key + '=' + value).join(';') + ';');
};
const main = ['Start', 'Read', 'Scope', 'Enough', 'Provider', 'Generate', 'Validate', 'Delivery', 'Safe', 'Answer', 'Click', 'CitationKind', 'Citation', 'Inspect', 'Unavailable', 'Operational', 'OperationalView'];
const order = new Map(main.map((id, index) => [id, index]));
const nodes = [...graph.nodes].sort((a, b) => (order.get(a.id) ?? 100) - (order.get(b.id) ?? 100));
const elk = new ELK();
const layout = await elk.layout({
  id: 'ai-flow',
  layoutOptions: {
    'elk.algorithm': 'layered', 'elk.direction': 'DOWN', 'elk.edgeRouting': 'ORTHOGONAL',
    'elk.padding': '[top=160,left=80,bottom=80,right=80]',
    'elk.spacing.nodeNode': '100', 'elk.layered.spacing.nodeNodeBetweenLayers': '100',
    'elk.spacing.edgeNode': '40', 'elk.spacing.edgeEdge': '24',
    'elk.layered.cycleBreaking.strategy': 'MODEL_ORDER',
    'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
    'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
  },
  children: nodes.map(node => {
    // Long API locators must fit without relying on word-breaking at slashes.
    const width = Math.max(440, ...node.label.split(/\s+/).map(word => word.length * 9 + 48));
    const height = node.shape === 'diamond' ? 250 : Math.max(120, Math.ceil(node.label.length / 48) * 24 + 40);
    return { id: node.id, width, height, layoutOptions: { 'elk.portConstraints': 'FIXED_POS' }, ports: [
      { id: node.id + '-out', x: width / 2, y: height, width: 0, height: 0, layoutOptions: { 'elk.port.side': 'SOUTH' } },
      { id: node.id + '-in', x: width / 2, y: 0, width: 0, height: 0, layoutOptions: { 'elk.port.side': 'NORTH' } },
      { id: node.id + '-return', x: 0, y: height / 2, width: 0, height: 0, layoutOptions: { 'elk.port.side': 'WEST' } },
    ] };
  }),
  edges: graph.edges.map((edge, index) => ({
    id: 'route-' + index,
    sources: [edge.source + (['Start', 'Read'].includes(edge.target) && edge.source !== 'Start' ? '-return' : '-out')],
    targets: [edge.target + (['Start', 'Read'].includes(edge.target) && edge.source !== 'Start' ? '-return' : '-in')],
    layoutOptions: { 'elk.layered.priority.straightness': main.indexOf(edge.target) === main.indexOf(edge.source) + 1 ? '100' : '1' },
    labels: edge.label ? [{ text: edge.label, width: edge.label.length * 7.5, height: 24 }] : [],
  })),
});
const positions = new Map(layout.children.map(node => [node.id, node]));
for (const id of main.slice(1, 12)) {
  assert(positions.get(id).y > positions.get(main[main.indexOf(id) - 1]).y, 'Reversed main path: ' + id);
}
for (const node of graph.nodes) {
  let cell = byId.get(node.id);
  if (!cell) {
    cell = el('mxCell', { id: node.id, vertex: 1, parent: 1 });
    cell.setAttribute('style', byId.get(node.shape === 'diamond' ? 'Enough' : 'Read').getAttribute('style'));
    page.appendChild(cell);
  }
  cell.setAttribute('value', node.label);
  setStyle(cell, { html: 1, whiteSpace: 'wrap', fontSize: 16, spacing: 14 });
  const previous = cell.getElementsByTagName('mxGeometry')[0];
  const geometry = previous || el('mxGeometry', { as: 'geometry' });
  const position = positions.get(node.id);
  for (const key of ['x', 'y', 'width', 'height']) geometry.setAttribute(key, String(position[key]));
  if (!previous) cell.appendChild(geometry);
}
function midpoint(route) {
  const lengths = route.slice(1).map((point, index) => Math.hypot(point.x - route[index].x, point.y - route[index].y));
  let remaining = lengths.reduce((sum, length) => sum + length, 0) / 2;
  for (let index = 0; index < lengths.length; index++) {
    if (remaining <= lengths[index]) {
      const fraction = lengths[index] ? remaining / lengths[index] : 0;
      return { x: route[index].x + (route[index + 1].x - route[index].x) * fraction, y: route[index].y + (route[index + 1].y - route[index].y) * fraction };
    }
    remaining -= lengths[index];
  }
  return route.at(-1);
}
for (const [index, edge] of graph.edges.entries()) {
  let cell = oldEdges.find(item => !used.has(item) && item.getAttribute('source') === edge.source && item.getAttribute('target') === edge.target);
  if (!cell) {
    const id = 'ai-' + edge.source + '-' + edge.target;
    assert(!byId.has(id), 'Reserved edge ID already in use: ' + id);
    cell = el('mxCell', { id, edge: 1, parent: 1 });
    cell.setAttribute('style', oldEdges[0].getAttribute('style'));
    page.appendChild(cell);
  }
  used.add(cell);
  cell.setAttribute('source', edge.source);
  cell.setAttribute('target', edge.target);
  cell.setAttribute('value', edge.label);
  setStyle(cell, { edgeStyle: 'none', rounded: 0, html: 1, endArrow: 'block', fontSize: 14, labelBackgroundColor: '#ffffff', exitX: 0.5, exitY: 1, entryX: 0.5, entryY: 0, exitPerimeter: 0, entryPerimeter: 0 });
  if (['Start', 'Read'].includes(edge.target) && edge.source !== 'Start') setStyle(cell, { exitX: 0, exitY: 0.5, entryX: 0, entryY: 0.5 });
  const section = layout.edges[index].sections[0];
  const route = [section.startPoint, ...(section.bendPoints || []), section.endPoint];
  const geometry = el('mxGeometry', { relative: 1, as: 'geometry' });
  const points = el('Array', { as: 'points' });
  for (const point of route.slice(1, -1)) points.appendChild(el('mxPoint', { x: point.x, y: point.y }));
  geometry.appendChild(points);
  const label = layout.edges[index].labels?.[0];
  if (label) {
    const mid = midpoint(route);
    geometry.appendChild(el('mxPoint', { as: 'offset', x: label.x + label.width / 2 - mid.x, y: label.y + label.height / 2 - mid.y }));
  }
  const previous = cell.getElementsByTagName('mxGeometry')[0];
  if (previous) cell.replaceChild(geometry, previous);
  else cell.appendChild(geometry);
}
// The obsolete direct document-only citation edge is replaced by CitationKind.
const removed = oldEdges.filter(cell => !used.has(cell));
for (const cell of removed) page.removeChild(cell);
const title = byId.get('diagram-title');
const titleGeometry = title.getElementsByTagName('mxGeometry')[0];
for (const [key, value] of Object.entries({ x: 80, y: 20, width: layout.width - 160, height: 100 })) titleGeometry.setAttribute(key, String(value));
setStyle(title, { html: 1, fontSize: 20 });
const model = xml.getElementsByTagName('mxGraphModel')[0];
model.setAttribute('page', '0');
model.setAttribute('pageWidth', String(Math.ceil(layout.width)));
model.setAttribute('pageHeight', String(Math.ceil(layout.height)));
const output = new XMLSerializer().serializeToString(xml);
compareGraphs(graph, parseDrawio(output));
await writeFile(base + '.drawio', output);
console.log(JSON.stringify({ nodes: graph.nodes.length, edges: graph.edges.length, removedEdges: removed.map(cell => cell.getAttribute('id')), width: layout.width, height: layout.height }));
