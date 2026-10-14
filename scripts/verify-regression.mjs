import assert from 'node:assert/strict';

// Materializes declared evaluation inputs only. This is not a runtime mutation,
// permission evaluator, storage test or implementation of an application handler.
export function regressionFixture(corpus, testCase) {
  const fixture = structuredClone(corpus);
  for (const document of fixture.documents) {
    assert(document.versions.every(v => ['current', 'superseded', 'archived'].includes(v.state)), 'Regression corpus contains invalid product lifecycle');
    assert(document.versions.filter(v => v.state === 'current').length <= 1, 'Regression corpus has multiple Current versions');
    assert.equal(new Set(document.versions.map(v => v.version_id)).size, document.versions.length, 'Duplicate regression version');
  }
  for (const mutation of testCase.fixture_mutations ?? []) {
    assert.equal(mutation.type, 'revise_document', 'Unknown regression fixture mutation');
    const document = fixture.documents.find(d => d.document_id === mutation.document_id);
    assert(document && document.project_id === testCase.access.project_id, 'Regression revision has unknown or cross-project document');
    const current = document.versions.find(v => v.state === 'current');
    assert.equal(current?.version_id, mutation.expected_current_version, 'Regression revision has stale predecessor');
    const next = mutation.new_version;
    assert(next && next.state === 'current', 'Regression revision must create Current');
    assert(!document.versions.some(v => v.version_id === next.version_id), 'Regression revision reuses immutable version identity');
    assert(next.version_id && next.passages?.length, 'Regression revision lacks evidence');
    assert.equal(new Set(next.passages.map(p => p.passage_id)).size, next.passages.length, 'Duplicate regression passage');
    assert(next.passages.every(p => p.passage_id && typeof p.content === 'string' && p.content.trim()), 'Regression passage lacks identity or text');
    current.state = 'superseded';
    document.versions.push(structuredClone(next));
  }
  if (testCase.unsaved_editor_fixture) {
    assert.equal(testCase.unsaved_editor_fixture.ingest, false, 'Unsaved editor text cannot be ingested');
    assert(!fixture.documents.some(d => d.versions.some(v => v.passages.some(p => p.content === testCase.unsaved_editor_fixture.text))), 'Unsaved editor text appears in stored evidence');
  }
  return fixture;
}
