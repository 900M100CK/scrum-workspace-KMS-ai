import assert from 'node:assert/strict';

// Definition-level negatives only. This never scores generated answers or proves
// that prose claims are supported; a reviewer must inspect the cited evidence.
export function validateResearchDefinitions(set, corpus) {
  assert.equal(set.cases.length, 25, 'Approved research set requires 25 cases');
  const groups = { doc: 0, state: 0, both: 0 };
  const ids = new Set();
  const documents = new Map(corpus.documents.map(d => [d.document_id, d]));
  const observations = new Map(corpus.observations.map(o => [o.entity_id, o]));
  assert.equal(documents.size, corpus.documents.length, 'Duplicate document');
  assert.equal(observations.size, corpus.observations.length, 'Duplicate observation');
  for (const doc of documents.values()) {
    assert(doc.versions.every(v => ['current','superseded','archived'].includes(v.state)), 'Research corpus has invalid product lifecycle');
    assert(doc.versions.filter(v => v.state === 'current').length <= 1, 'Multiple Current versions');
  }
  for (const task of corpus.operational.tasks) {
    const events = corpus.operational.blocker_events.filter(e => e.task_id === task.task_id).sort((a,b) => a.sequence-b.sequence);
    assert.equal(new Set(events.map(e=>e.sequence)).size, events.length, 'Duplicate blocker sequence');
    assert.equal(task.blocked, events.at(-1)?.status === 'open', 'Blocked fixture disagrees with latest event');
    assert.equal(observations.get(task.task_id)?.revision, task.revision, 'Task observation revision mismatch');
  }
  // Correct locator/revision must not mask a stale or invented observation value.
  const tables = [
    ['task', corpus.operational.tasks, 'task_id'],
    ['sprint', corpus.operational.sprints, 'sprint_id'],
    ['allocation', corpus.operational.allocations, 'allocation_id'],
    ['backlog', [corpus.operational.backlog], 'entity_id'],
    ['blocker_event', corpus.operational.blocker_events, 'event_id'],
  ];
  const sourceIds = new Set();
  for (const [kind, rows, key] of tables) {
    for (const row of rows) {
      assert(row[key] && !sourceIds.has(row[key]), 'Duplicate or missing operational source identity');
      sourceIds.add(row[key]);
      const observation = observations.get(row[key]);
      assert(observation, 'Missing materialized observation');
      assert.equal(observation.entity_kind, kind, 'Observation source kind mismatch');
      assert.equal(observation.project_id, row.project_id, 'Observation source project mismatch');
      assert.equal(observation.revision, row.revision, 'Observation source revision mismatch');
      assert.equal(observation.observed_at, row.observed_at, 'Observation source time mismatch');
      assert.deepEqual(observation.value, row, 'Observation value disagrees with source row');
    }
  }
  assert.equal(observations.size, sourceIds.size, 'Observation has no operational source row');
  const tasks = new Map(corpus.operational.tasks.map(t => [t.task_id, t]));
  const sprints = new Map(corpus.operational.sprints.map(s => [s.sprint_id, s]));
  const links = new Set();
  for (const link of corpus.links) {
    assert(!links.has(link.link_id), 'Duplicate source-task link'); links.add(link.link_id);
    assert(tasks.get(link.task_id)?.project_id === link.project_id &&
      documents.get(link.document_id)?.project_id === link.project_id, 'Source-task link crosses project or has missing endpoint');
  }
  for (const allocation of corpus.operational.allocations) {
    assert(tasks.get(allocation.task_id)?.project_id === allocation.project_id &&
      sprints.get(allocation.sprint_id)?.project_id === allocation.project_id, 'Allocation crosses project or has missing endpoint');
  }
  for (const event of corpus.operational.blocker_events) {
    assert(tasks.get(event.task_id)?.project_id === event.project_id, 'Blocker event crosses project or has missing task');
  }
  for (const c of set.cases) {
    assert(!ids.has(c.case_id), 'Duplicate research case'); ids.add(c.case_id);
    assert(c.group in groups, 'Unknown research group'); groups[c.group]++;
    assert(['pilot','final'].includes(c.split), 'Missing pilot/final split');
    const actor = corpus.users.find(u => u.user_id === c.access.user_id);
    assert(actor?.projects.includes(c.access.project_id), 'Research actor lacks project');
    const claimIds = new Set();
    const docRefs = new Map(), opRefs = new Map();
    for (const claim of c.required_claims) {
      assert(!claimIds.has(claim.claim_id), 'Duplicate reference claim'); claimIds.add(claim.claim_id);
      assert(claim.claim.trim() && claim.evidence.length, 'Reference claim lacks evidence');
      assert.equal(new Set(claim.evidence.map(e => e.kind)).size, 1, 'Split document and operational claim components for scoring');
      for (const e of claim.evidence) {
        if (e.kind === 'document') {
          const doc = documents.get(e.document_id);
          assert(doc?.project_id === c.access.project_id, 'Research document crosses project scope');
          assert(doc.classification === 'project_shared' || corpus.read_grants.some(g => g.document_id === doc.document_id && g.user_id === actor.user_id && g.valid), 'Research reference leaks restricted document');
          const v = doc.versions.find(v => v.version_id === e.version_id);
          assert(v?.passages.some(p => p.passage_id === e.passage_id), 'Missing exact research citation');
          assert(c.query_scope === 'history' || v.state === 'current', 'Noncurrent evidence in current research scope');
          docRefs.set(JSON.stringify(e),e);
        } else {
          assert.equal(e.kind,'operational','Unknown evidence kind');
          const o = observations.get(e.entity_id);
          assert(o?.project_id === c.access.project_id, 'Research observation crosses project scope');
          assert.equal(o.revision,e.revision,'Operational reference revision mismatch');
          assert.equal(o.observed_at,e.observed_at,'Operational observation time mismatch');
          assert.equal(o.entity_kind,e.entity_kind,'Operational entity kind mismatch');
          opRefs.set(JSON.stringify(e),e);
        }
      }
    }
    assert.deepEqual(c.expected_sources,[...docRefs.values()],'Research document evidence list mismatch');
    assert.deepEqual(c.expected_observations,[...opRefs.values()],'Research operational evidence list mismatch');
    if (c.group === 'both') assert(docRefs.size && opRefs.size, 'Both group requires document and state claims');
    if (c.group === 'doc') assert.equal(opRefs.size,0,'Doc group contains state claims');
    if (c.group === 'state') assert.equal(docRefs.size,0,'State group contains document claims');
    if (c.top_five_eligible) assert(docRefs.size>0,'Top-five case lacks document evidence');
    assert.deepEqual(Object.keys(c.configuration_expectations).sort(),['C0','C1','C2'],'Missing configuration expectations');
    for (const [config, expected] of Object.entries(c.configuration_expectations)) {
      const enabled = config === 'C0' ? ['document_retrieval'] : config === 'C1' ? ['work_state'] : ['document_retrieval','work_state'];
      const available = c.required_claims.filter(claim => {
        const evidenceKinds = [...new Set(claim.evidence.map(e => e.kind === 'document' ? 'document_retrieval' : 'work_state'))];
        const required = claim.requires_source_categories ?? evidenceKinds;
        assert(required.length && required.every(k => ['document_retrieval','work_state'].includes(k)), 'Invalid claim source dependency');
        assert(evidenceKinds.every(k => required.includes(k)), 'Claim dependency omits its evidence source');
        if (required.some(k => !evidenceKinds.includes(k))) assert(claim.selection_dependency?.trim(), 'Undocumented selection dependency');
        return required.every(k => enabled.includes(k));
      }).map(claim => claim.claim_id);
      assert.deepEqual(expected.required_supported_claims,available,'Disabled source credited in configuration');
      assert.deepEqual(expected.unavailable_claims,c.required_claims.filter(claim => !available.includes(claim.claim_id)).map(claim => claim.claim_id),'Missing unavailable-component expectation');
      assert(expected.reference_answer.trim(),'Missing reference answer');
      if (available.length < claimIds.size || !claimIds.size) {
        assert.equal(expected.complete_answer_expected,false,'Incomplete evidence counted complete');
        assert.equal(expected.expected_status,available.length ? 'partially_answered' : 'insufficient_evidence','Unavailable source must not produce complete answer');
      }
      assert.equal(expected.document_discovery_eligible, c.top_five_eligible && c.required_claims.some(claim => available.includes(claim.claim_id) && claim.evidence.some(e => e.kind === 'document')), 'Configuration discovery eligibility mismatch');
    }
  }
  assert.deepEqual(groups,{doc:8,state:8,both:9},'Approved group distribution mismatch');
  assert.deepEqual(set.groups,groups,'Declared research distribution mismatch');
  return { cases:ids.size,groups,results:'not run; reference definitions only' };
}
