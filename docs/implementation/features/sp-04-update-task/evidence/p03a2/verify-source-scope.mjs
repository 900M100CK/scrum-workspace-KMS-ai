import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

const evidence = 'docs/implementation/features/sp-04-update-task/evidence/p03a2/';
const baseline = JSON.parse(fs.readFileSync(evidence + 'source-inputs.json'));
const versions = JSON.parse(fs.readFileSync(evidence + 'version-map.json'));
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const read = file => fs.readFileSync(file, 'utf8');
const before = file => read(baseline.snapshots.find(item => item.path === file).snapshot);
const changed = baseline.tracked_files.filter(item => !fs.existsSync(item.path)
  || digest(fs.readFileSync(item.path)) !== item.sha256).map(item => item.path);

const protectedSources = baseline.tracked_files.filter(item =>
  /^(services\/|apps\/|tests\/|scripts\/|infra\/|eval\/|contracts\/openapi\/|docs\/baseline\/)/.test(item.path)
  || /^docs\/adr\/(?!README\.md$)/.test(item.path)
  || item.path === 'docs/BRD.md' || /^package(-lock)?\.json$/.test(item.path));
const protectedDrift = protectedSources.filter(item => !fs.existsSync(item.path)
  || digest(fs.readFileSync(item.path)) !== item.sha256).map(item => item.path);
assert.deepEqual(protectedDrift, []);
for (const item of baseline.snapshots) assert.equal(digest(fs.readFileSync(item.snapshot)), item.sha256);

// The metadata generator updates diagram source-version comments and native titles.
// Reversing only those metadata values must reproduce the frozen original digest.
const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function reverseMetadata(line) {
  for (const item of versions.filter(item => item.from)) {
    for (const key of [item.id, item.path]) {
      line = line.replace(new RegExp(escape(key) + ' v' + escape(item.to) + '(?![\\d.])', 'g'), key + ' v' + item.from);
    }
  }
  return line;
}
const diagrams = [];
for (const item of baseline.tracked_files.filter(item => /\.(mmd|drawio)$/.test(item.path))) {
  const current = read(item.path);
  const restored = item.path.endsWith('.mmd')
    ? current.split('\n').map(line => /^%% (Origin:|Sources:|DGM-)/.test(line) ? reverseMetadata(line) : line).join('\n')
    : current.replace(/(<mxCell\b[^>]*\bid="diagram-title"[^>]*\bvalue=")([^"]*)(")/,
      (_, prefix, value, suffix) => prefix + reverseMetadata(value) + suffix);
  const lf = restored.replace(/\r\n/g, '\n');
  assert(digest(lf) === item.sha256 || digest(lf.replace(/\n/g, '\r\n')) === item.sha256, item.path);
  diagrams.push({ path: item.path, graph_preserved: true, generated_metadata_only: true });
}

const metadataBodies = [];
const stripEnvelope = lines => lines.filter(line => !/^\*\*(Version\/date|Inputs|Sources|Source versions|Historical inputs):\*\*/.test(line));
for (const item of versions.filter(item => /input-version metadata only|frozen input envelope/.test(item.kind))) {
  if (!baseline.snapshots.some(snapshot => snapshot.path === item.path)) {
    assert.equal(item.path, 'docs/sdlc/reports/load-balancing-assessment-2026-11-03.md');
    metadataBodies.push({ path: item.path, body_unchanged: 'not independently verified: untracked source lacked a pre-edit full-byte snapshot',
      scope: 'Only envelope version/date and Historical inputs label were edited; reviewed input values retained. No new assessment result.' });
    continue;
  }
  const original = before(item.path).split(/\r?\n/);
  const current = read(item.path).split(/\r?\n/);
  assert.deepEqual(stripEnvelope(current), stripEnvelope(original), item.path);
  const frozen = item.kind.startsWith('frozen');
  if (frozen) assert.equal(current.find(line => line.startsWith('**Historical inputs:**')),
    original.find(line => line.startsWith('**Inputs:**')).replace('**Inputs:**', '**Historical inputs:**'));
  metadataBodies.push({ path: item.path, body_unchanged: true, frozen_input_values_unchanged: frozen ? true : undefined });
}

const prd = 'docs/sdlc/PRD_SRS.md', uc = 'docs/sdlc/use-cases.md', testPlan = 'docs/sdlc/test-plan.md';
const requirements = text => text.split(/\r?\n/).filter(line => /^\| FR-\d+ \|/.test(line))
  .map(line => { const cells = line.split('|'); return cells.slice(1, 4).map(cell => cell.trim()); });
assert.deepEqual(requirements(read(prd)), requirements(before(prd)));
const acIds = text => [...new Set(text.match(/\bAC-\d+/g))].sort();
assert.deepEqual(acIds(read(prd)), acIds(before(prd)));
const tcIds = text => [...text.matchAll(/^\| TC-(\d+) \|/gm)].map(match => match[1]);
assert.deepEqual(tcIds(read(testPlan)), tcIds(before(testPlan)));
assert.deepEqual(read(uc).match(/^## UC-\d+[^\r\n]*/gm), before(uc).match(/^## UC-\d+[^\r\n]*/gm));
assert.deepEqual(read(uc).match(/\*\*EX-\d+ \(/g), before(uc).match(/\*\*EX-\d+ \(/g));
const modelShape = model => ({ ...model, version: undefined, storageDecision: undefined, invariants: undefined,
  entities: model.entities.map(({ constraints, ...entity }) => entity) });
assert.deepEqual(modelShape(JSON.parse(read('contracts/data-model.json'))), modelShape(JSON.parse(before('contracts/data-model.json'))));

const result = {
  artifact_id: 'SP04-P03A2-CHECKS', version: '0.1', date: '2026-11-03', node: process.version,
  source_baseline: { tracked_files: baseline.tracked_files.length, protected_files: protectedSources.length,
    protected_drift: protectedDrift, changed_tracked_paths: changed, snapshots_checked: baseline.snapshots.length,
    snapshot_hashes_unchanged: true },
  semantic: { FR_ids_priorities_and_requirement_text_unchanged: true, AC_ids_unchanged: true,
    UC_headings_and_exception_sequence_unchanged: true, TC_table_ids_unchanged: true,
    logical_entity_field_key_relationship_shape_unchanged: true,
    OpenAPI_runtime_tests_migrations_existing_ADRs_baseline_unchanged: true },
  metadata_body_preservation: metadataBodies, diagram_preservation: diagrams,
  execution_manifest: 'executions.json',
  limits: 'Source/schema/context checks only; ADR-0028 Proposed. No runtime/DB/DOM/browser/concurrency/load/SP-05 integration evidence.'
};
fs.writeFileSync(evidence + 'checks.json', JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ protected_files: protectedSources.length, protected_drift: 0,
  raw_snapshots_preserved: baseline.snapshots.length, diagram_graphs_preserved: diagrams.length,
  metadata_bodies_preserved: metadataBodies.length, changed_tracked_paths: changed.length, semantic: 'passed' }));
