import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { readFile, readdir } from 'node:fs/promises';
import { parseMermaid, parseDrawio, compareGraphs, checkVersionTable, checkCurrentReferences, checkUnselectedSearchTerms, checkInputHeader, checkSourceAdrs, checkOperationRefs, checkLinkedInputVersions, verifyDocs } from '../../scripts/docs/verify-docs.mjs';
import { adrIds, loadManifest, generatedOutputs } from '../../scripts/docs/docs-metadata.mjs';

const xml = `<mxfile><diagram><mxGraphModel><root>
<mxCell id="0"/><mxCell id="1" parent="0"/>
<mxCell id="A" value="Start" vertex="1"/><mxCell id="B" value="End" vertex="1"/>
<mxCell id="e" source="A" target="B" value="Yes" edge="1" style="endArrow=block;"><mxGeometry relative="1"/></mxCell>
</root></mxGraphModel></diagram></mxfile>`;

test('all registered docs and diagram pairs pass', async () => {
  await verifyDocs(fileURLToPath(new URL('../../', import.meta.url)));
});

test('preflight exception counts agree with current use-case definitions', async () => {
  const cases = await readFile(new URL('../../docs/sdlc/use-cases.md', import.meta.url), 'utf8');
  const checklist = await readFile(new URL('../../docs/agent-preflight-checklist.md', import.meta.url), 'utf8');
  const definitions = [...cases.matchAll(/^- \*\*EX-\d+[^\n]*/gm)];
  const withdrawn = definitions.filter(([line]) => /\(Withdrawn\)/i.test(line)).length;
  const recorded = checklist.match(/\| EX identities \| (\d+) \((\d+) active \+ (\d+) withdrawn:/);
  assert(recorded, 'Preflight must distinguish total, active and withdrawn EX identities');
  assert.deepEqual(recorded.slice(1).map(Number), [definitions.length, definitions.length - withdrawn, withdrawn]);
});

test('architecture FR trace rows stay inside one continuous Markdown table', async () => {
  const source = await readFile(new URL('../../docs/architecture.md', import.meta.url), 'utf8');
  const section = source.split('### 7.1 ')[1].split('### 7.2 ')[0];
  const all = [...section.matchAll(/^\| (FR-\d+) \|/gm)].map(([, id]) => id);
  const block = section.match(/^\| FR-\d+ \|[^\n]*(?:\n\| FR-\d+ \|[^\n]*)*/m)?.[0];
  assert(all.length && block, 'Architecture must retain its requirement trace table');
  assert.deepEqual([...block.matchAll(/^\| (FR-\d+) \|/gm)].map(([, id]) => id), all);
});

test('unselected retrieval mechanisms need explicit status in current text', () => {
  checkUnselectedSearchTerms('Trigram and Reciprocal Rank Fusion (RRF) remain unselected.', 'candidate.md');
  checkUnselectedSearchTerms('pg_trgm is not adopted.', 'candidate.md');
  checkUnselectedSearchTerms('trgm remains unselected.', 'candidate.md');
  assert.throws(() => checkUnselectedSearchTerms('Keyword (trgm) & Vector (pgvec)', 'architecture.md'), /architecture.md:1/);
  assert.throws(() => checkUnselectedSearchTerms('pg_trgm is a candidate.', 'candidate.md'), /presented as current/);
  assert.throws(() => checkUnselectedSearchTerms('Use trigram keyword and fusion ranking.', 'current.md'), /current.md:1/);
  assert.throws(() => checkUnselectedSearchTerms('CREATE EXTENSION pg_trgm; -- unselected', 'services/knowledge/migrations/003-search.up.sql'), /migration.*:1/);
});

test('Draw.io status belongs to its own label, not an unrelated cell on the same XML line', () => {
  const bad = '<mxfile><mxCell value="Fusion remains unselected"/><mxCell value="Current trigram path"/></mxfile>';
  assert.throws(() => checkUnselectedSearchTerms(bad, 'diagram.drawio'), /presented as current/);
  checkUnselectedSearchTerms(bad.replace('Current trigram path', 'Trigram is not adopted'), 'diagram.drawio');
});

test('Sources contains every body ADR, including shorthand and ranges, not just the highest ID', () => {
  assert.deepEqual(adrIds('ADR-0007/0009/0011; ADR-0013–ADR-0015'), ['ADR-0007', 'ADR-0009', 'ADR-0011', 'ADR-0013', 'ADR-0014', 'ADR-0015']);
  checkSourceAdrs('%% Sources: ADR-0013–ADR-0017\nA[ADR-0015]', 'example.mmd');
  assert.throws(() => checkSourceAdrs('%% Sources: ADR-0017\nA[ADR-0013]', 'example.mmd'), /omit body ADRs.*ADR-0013/);
  assert.throws(() => checkSourceAdrs('**Sources:** ADR-0017\nADR-0015 applies.', 'example.md'), /omit body ADRs/);
});

test('manifest version/ADR changes propagate to all generated inventories and both diagram headers', async () => {
  const root = fileURLToPath(new URL('../../', import.meta.url));
  const manifest = await loadManifest(root);
  const changed = structuredClone(manifest);
  const inventory = changed.artifacts.find(a => a.id === 'UML-07');
  inventory.date = '25 October 2026';
  const site = changed.artifacts.find(a => a.id === 'DGM-SITE-01');
  site.version = '0.999'; site.adrs.unshift('ADR-0001');
  site.date = '22 October 2026';
  const outputs = await generatedOutputs(root, changed);
  for (const path of [site.path, site.drawio, 'docs/sdlc/diagrams/sitemap/README.md', 'docs/sdlc/diagrams/README.md', 'docs/sdlc/artifact-register.md']) {
    assert(outputs.get(path).includes('v0.999'), 'Missing propagated version: ' + path);
  }
  assert(outputs.get(site.path).includes('ADR-0001'));
  assert(outputs.get(site.drawio).includes('ADR-0001'));
  assert(outputs.get(site.path).includes('Draft - 22 October 2026'));
  assert(outputs.get(site.drawio).includes('| 22 October 2026 |'));
  assert(outputs.get('docs/sdlc/diagrams/sitemap/README.md').includes('Inventory: UML-07 v' + inventory.version + ' · 25 October 2026'));
  const unchanged = changed.artifacts.find(a => a.id === 'DGM-ARCH-01');
  assert(outputs.get(unchanged.path).includes('Draft - ' + manifest.date), 'A local date override must not redate unrelated diagrams');
});

test('AI checkpoint sources retain the unavailable, partial-answer and member-removal decisions', async () => {
  const manifest = await loadManifest(fileURLToPath(new URL('../../', import.meta.url)));
  const checkpoint = manifest.artifacts.find(a => a.id === 'DGM-FLOW-05');
  for (const required of ['ADR-0013', 'ADR-0015', 'ADR-0017']) assert(checkpoint.adrs.includes(required), 'Missing checkpoint decision: ' + required);
});

test('use-case associations are undirected; generalization/include retain direction and native UML style', async () => {
  const source = await readFile(new URL('../../docs/sdlc/diagrams/use-case/use-case-diagram.mmd', import.meta.url), 'utf8');
  const native = await readFile(new URL('../../docs/sdlc/diagrams/use-case/use-case-diagram.drawio', import.meta.url), 'utf8');
  const graph = await parseMermaid(source, { kind: 'use-case' });
  compareGraphs(graph, parseDrawio(native, { kind: 'use-case' }));
  const swap = (text, id) => text.replace(new RegExp('<mxCell\\b[^>]*id="' + id + '"[^>]*>'), tag => tag.replace(/source="([^"]+)"/, 'source="__swap__$1"').replace(/target="([^"]+)"/, (_, target) => 'target="' + tag.match(/source="([^"]+)"/)[1] + '"').replace(/source="__swap__[^"]+"/, 'source="' + tag.match(/target="([^"]+)"/)[1] + '"'));
  compareGraphs(graph, parseDrawio(swap(native, 'assoc-user-uc01'), { kind: 'use-case' }));
  assert.throws(() => compareGraphs(graph, parseDrawio(swap(native, 'gen-user'), { kind: 'use-case' })), /relation kind\/direction/);
  assert.throws(() => parseDrawio(native.replace('endArrow=open;dashed=1', 'endArrow=open;dashed=0'), { kind: 'use-case' }), /Include relation/);
  assert.throws(() => parseDrawio(native.replace('endArrow=block;endFill=0', 'endArrow=block;endFill=1'), { kind: 'use-case' }), /hollow triangle/);
});

test('operation references fail on facade path/ID or actual node label drift', () => {
  const graph = { nodes: [{ id: 'Start', label: 'POST /knowledge/questions' }] };
  const refs = [{ service: 'knowledge', method: 'POST', path: '/knowledge/questions', id: 'askQuestion', node: 'Start', label: 'POST /knowledge/questions' }];
  const contracts = new Map([['knowledge', { paths: { '/knowledge/questions': { post: { operationId: 'askQuestion' } } } }]]);
  checkOperationRefs(graph, refs, contracts);
  assert.throws(() => checkOperationRefs(graph, [{ ...refs[0], path: '/api/v1/ai/query' }], contracts), /Operation ID\/path drift/);
  assert.throws(() => checkOperationRefs({ nodes: [{ id: 'Start', label: 'POST /old/query' }] }, refs, contracts), /Operation label drift/);
});

test('input headers name the latest cited ADR and current input versions', () => {
  const versions = new Map([['SAD-03', '0.9']]);
  checkInputHeader('**Inputs:** SAD-03 v0.9; ADR-0007–ADR-0017.\nADR-0015 applies.', versions, 'fixture');
  assert.throws(() => checkInputHeader('**Inputs:** SAD-03 v0.9; ADR-0007–ADR-0012.\nADR-0017 applies.', versions, 'fixture'), /behind body/);
  assert.throws(() => checkInputHeader('**Inputs:** SAD-03 v0.8; ADR-0007–ADR-0017.\nADR-0017 applies.', versions, 'fixture'), /Input version drift/);
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

test('current linked input aliases use target versions while snapshot evidence stays historical', () => {
  const versions = new Map([['PRD.md','0.9'],['contracts/README.md','0.12']]);
  const current = '**Inputs:** [PRD-01](PRD.md) v0.9; [contract pack](contracts/README.md) v0.12\n## Historical\n[older](PRD.md) v0.3\n';
  checkLinkedInputVersions(current, versions, 'fixture');
  assert.throws(() => checkLinkedInputVersions(current.replace('v0.9','v0.6'), versions, 'fixture'), /Linked input version drift/);
  assert.throws(() => checkLinkedInputVersions(current.replace('v0.12','v0.6'), versions, 'fixture'), /Linked input version drift/);
  checkLinkedInputVersions('**Snapshot inputs:** [PRD-01](PRD.md) v0.3', versions, 'fixture');
});

import { loadDesignModels, verifyDesignContent } from '../../scripts/design-diagrams.mjs';

test('design pairs reject reversed sequence handoffs and changed native multiplicities', async () => {
  const root = fileURLToPath(new URL('../../', import.meta.url));
  const models = await loadDesignModels(root);
  const sequence = models.find(d => d.id === 'DGM-SEQ-01');
  const source = await readFile(new URL('../../'+sequence.path+'.mmd', import.meta.url), 'utf8');
  const native = await readFile(new URL('../../'+sequence.path+'.drawio', import.meta.url), 'utf8');
  const reversed = source.replace('K->>KD:', 'KD->>K:');
  assert.notEqual(reversed, source);
  await assert.rejects(verifyDesignContent(sequence, reversed, native, async () => {}), /Mermaid drift/);
  const erd = models.find(d => d.id === 'DGM-DATA-01');
  const erSource = await readFile(new URL('../../'+erd.path+'.mmd', import.meta.url), 'utf8');
  const erNative = await readFile(new URL('../../'+erd.path+'.drawio', import.meta.url), 'utf8');
  const altered = erNative.replace('endArrow=ERzeroToMany', 'endArrow=ERmandOne');
  assert.notEqual(altered, erNative);
  await assert.rejects(verifyDesignContent(erd, erSource, altered, async () => {}), /native semantic\/route drift/);
});

test('physical diagram entity inventory matches owned CREATE TABLE definitions', async () => {
  const root = fileURLToPath(new URL('../../', import.meta.url));
  const models = await loadDesignModels(root);
  for (const [id, service] of [['DGM-DATA-01','workspace'],['DGM-DATA-02','knowledge']]) {
    const directory = new URL('../../services/'+service+'/migrations/', import.meta.url);
    const names = (await readdir(directory)).filter(name=>name.endsWith('.up.sql')).sort();
    const ddl = (await Promise.all(names.map(name=>readFile(new URL(name,directory),'utf8')))).join('\n');
    const tables = [...ddl.matchAll(/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?(?:(\w+)\.)?(\w+)/gi)]
      .filter(match=>!match[1] || match[1]===service).map(match=>match[2]).sort();
    assert.deepEqual(models.find(d=>d.id===id).nodes.map(n=>n.id).sort(), tables);
  }
});
