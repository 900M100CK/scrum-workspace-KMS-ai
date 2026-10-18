import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import ELK from 'elkjs/lib/elk.bundled.js';
import assert from 'node:assert/strict';
import { parseMermaid } from './verify-docs.mjs';
import { syncMetadata } from './docs-metadata.mjs';

// Regenerate only the two explicitly split permission diagrams. Other diagrams
// retain their manual geometry. Review actual renders after regeneration.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const elk = new ELK();
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('\n', '&#10;');
function midpoint(route) {
  const lengths = route.slice(1).map((p, i) => Math.hypot(p.x - route[i].x, p.y - route[i].y));
  let remaining = lengths.reduce((a, b) => a + b, 0) / 2;
  for (let i = 0; i < lengths.length; i++) {
    if (remaining <= lengths[i]) {
      const t = lengths[i] ? remaining / lengths[i] : 0;
      return { x: route[i].x + (route[i + 1].x - route[i].x) * t, y: route[i].y + (route[i + 1].y - route[i].y) * t };
    }
    remaining -= lengths[i];
  }
  return route.at(-1);
}
for (const name of ['permission-read-flow', 'permission-ai-checkpoints']) {
  const path = resolve(root, 'docs/sdlc/diagrams/flowchart', name);
  const text = await readFile(path + '.mmd', 'utf8');
  const graph = await parseMermaid(text);
  const header = text.match(/^%% (DGM-\S+) v([\d.]+)/m);
  const layout = await elk.layout({
    id: 'root',
    layoutOptions: { 'elk.algorithm': 'layered', 'elk.direction': 'DOWN', 'elk.edgeRouting': 'ORTHOGONAL', 'elk.padding': '[top=160,left=60,bottom=60,right=60]', 'elk.spacing.nodeNode': '100', 'elk.layered.spacing.nodeNodeBetweenLayers': '110', 'elk.spacing.edgeNode': '40', 'elk.spacing.edgeEdge': '25', 'elk.layered.cycleBreaking.strategy': 'MODEL_ORDER', 'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES' },
    children: graph.nodes.map(n => {
      const width = 350, height = n.shape === 'diamond' ? 190 : Math.max(100, Math.ceil(n.label.length / 39) * 22 + 30);
      return { id: n.id, width, height, layoutOptions: { 'elk.portConstraints': 'FIXED_POS' }, ports: [
        { id: n.id + '-out', x: width / 2, y: height, width: 0, height: 0, layoutOptions: { 'elk.port.side': 'SOUTH' } },
        { id: n.id + '-in', x: width / 2, y: 0, width: 0, height: 0, layoutOptions: { 'elk.port.side': 'NORTH' } },
      ] };
    }),
    edges: graph.edges.map((e, i) => ({ id: 'edge-' + i, sources: [e.source + '-out'], targets: [e.target + '-in'], labels: e.label ? [{ text: e.label, width: e.label.length * 7, height: 22 }] : [] })),
  });
  const positions = new Map(layout.children.map(n => [n.id, n]));
  const mainPath = name === 'permission-ai-checkpoints'
    ? ['Start', 'Session', 'Member', 'QRead', 'PreModel', 'Buffer', 'PreAnswer', 'Valid', 'Answer', 'Citation', 'SourceFlow']
    : ['Start', 'Session', 'Member', 'Type', 'Doc', 'Classification', 'Grant', 'Allowed', 'View'];
  mainPath.slice(1).forEach((id, i) => assert(positions.get(id).y > positions.get(mainPath[i]).y, 'Layout reversed main path at ' + id));
  const meta = layout;
  const cells = ['<mxCell id="0"/>', '<mxCell id="1" parent="0"/>'];
  const sources = text.match(/^%% Sources: (.+)$/m)?.[1];
  assert(sources, 'Missing current source metadata in ' + name);
  const title = `${header[1]} · ${name} · v${header[2]} Draft\nSources: ${sources}; server handoff boundary, not runtime evidence`;
  cells.push(`<mxCell id="diagram-title" value="${escape(title)}" vertex="1" parent="1" style="text;html=1;whiteSpace=wrap;fontSize=18;fontStyle=1;align=left;"><mxGeometry x="60" y="20" width="${meta.width - 120}" height="100" as="geometry"/></mxCell>`);
  for (const n of graph.nodes) {
    const p = positions.get(n.id);
    const shape = n.shape === 'diamond' ? 'rhombus;' : 'rounded=1;';
    cells.push(`<mxCell id="${n.id}" value="${escape(n.label)}" vertex="1" parent="1" style="${shape}whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=14;spacing=12;"><mxGeometry x="${p.x}" y="${p.y}" width="${p.width}" height="${p.height}" as="geometry"/></mxCell>`);
  }
  graph.edges.forEach((e, i) => {
    const p = layout.edges[i];
    const section = p.sections[0];
    const route = [section.startPoint, ...(section.bendPoints ?? []), section.endPoint];
    const points = route.slice(1, -1).map(q => `<mxPoint x="${q.x}" y="${q.y}"/>`).join('');
    // Anchor labels at ELK's actual coordinates rather than the path midpoint.
    const label = p.labels?.[0];
    const mid = midpoint(route);
    const offset = label ? `<mxPoint as="offset" x="${label.x + label.width / 2 - mid.x}" y="${label.y + label.height / 2 - mid.y}"/>` : '';
    const pins = 'exitX=0.5;exitY=1;entryX=0.5;entryY=0;exitPerimeter=0;entryPerimeter=0;';
    cells.push(`<mxCell id="edge-${i}" source="${e.source}" target="${e.target}" value="${escape(e.label)}" edge="1" parent="1" style="edgeStyle=none;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;endArrow=block;endSize=8;fontSize=12;labelBackgroundColor=#ffffff;${pins}"><mxGeometry relative="1" as="geometry">${offset}<Array as="points">${points}</Array></mxGeometry></mxCell>`);
  });
  await writeFile(path + '.drawio', `<?xml version="1.0" encoding="UTF-8"?>\n<mxfile host="drawio"><diagram id="${header[1]}" name="${name}"><mxGraphModel grid="1" page="0" pageWidth="${Math.ceil(meta.width)}" pageHeight="${Math.ceil(meta.height)}"><root>\n${cells.join('\n')}\n</root></mxGraphModel></diagram></mxfile>\n`);
  console.log(`${name}: ${graph.nodes.length} nodes, ${graph.edges.length} edges`);
}
await syncMetadata(root);
