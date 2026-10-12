import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { parseMermaid, parseDrawio, compareGraphs, checkVersionTable, checkCurrentReferences, verifyDocs } from '../scripts/verify-docs.mjs';

const xml = `<mxfile><diagram><mxGraphModel><root>
<mxCell id="0"/><mxCell id="1" parent="0"/>
<mxCell id="A" value="Start" vertex="1"/><mxCell id="B" value="End" vertex="1"/>
<mxCell id="e" source="A" target="B" value="Yes" edge="1" style="endArrow=block;"><mxGeometry relative="1"/></mxCell>
</root></mxGraphModel></diagram></mxfile>`;

test('all registered docs and diagram pairs pass', async () => {
  await verifyDocs(fileURLToPath(new URL('../', import.meta.url)));
});
test('real Mermaid parser rejects invalid syntax', async () => {
  await assert.rejects(parseMermaid('flowchart TD\n A[Unclosed --> B'));
});
test('flowchart adapter compares labels, direction and parallel-edge counts', async () => {
  const graph = await parseMermaid('flowchart TD\n A[Start] -->|Yes| B[End]');
  compareGraphs(graph, parseDrawio(xml));
  for (const changed of [xml.replace('value="End"', 'value="Wrong"'), xml.replace('source="A" target="B"', 'source="B" target="A"'), xml.replace('value="Yes"', 'value="No"'), xml.replace('</root>', '<mxCell id="extra" source="A" target="B" value="Yes" edge="1" style="endArrow=block;"><mxGeometry relative="1"/></mxCell></root>')]) {
    assert.throws(() => compareGraphs(graph, parseDrawio(changed)), /mismatch/);
  }
});
test('invalid XML and dangling/undirected edges fail closed', () => {
  for (const changed of [xml.replace('</root>', '</wrong>'), xml.replace('target="B"', 'target="Missing"'), xml.replace('endArrow=block;', 'endArrow=none;')]) assert.throws(() => parseDrawio(changed));
});
test('current version drift and missing rows fail; historical versions are allowed', () => {
  const versions = new Map([['EXAMPLE-01', '0.3']]);
  const table = '## Historical\n| EXAMPLE-01 | v0.1 |\n## Current artifact versions\n| EXAMPLE-01 | v0.3 | file |\n';
  checkVersionTable(table, versions, 'fixture');
  assert.throws(() => checkVersionTable(table.replace('v0.3', 'v0.2'), versions, 'fixture'), /drift/);
  assert.throws(() => checkVersionTable(table.replace('| EXAMPLE-01 | v0.3 | file |', ''), versions, 'fixture'), /rows/);
});
test('journey actors and scores are compared, not merely grammar-checked', async () => {
  const graph = await parseMermaid('journey\n title Example\n section One\n Task: 5: Synthetic');
  const fixture = { nodes: [{ id: 'section-0', label: 'One' }, { id: 'step_0', label: 'Task Synthetic · illustrative score 5' }], edges: [] };
  compareGraphs(graph, fixture);
  fixture.nodes[1].label = 'Task Synthetic · illustrative score 4';
  assert.throws(() => compareGraphs(graph, fixture), /mismatch/);
});
test('current prose references cannot disagree with headers while historical snapshots can', () => {
  const versions = new Map([['EXAMPLE-01', '0.3']]);
  const text = '## Current\nEXAMPLE-01 v0.3\n## Historical: earlier run\nEXAMPLE-01 v0.1\n';
  checkCurrentReferences(text, versions, 'fixture');
  assert.throws(() => checkCurrentReferences(text.replace('v0.3', 'v0.2'), versions, 'fixture'), /drift/);
});
