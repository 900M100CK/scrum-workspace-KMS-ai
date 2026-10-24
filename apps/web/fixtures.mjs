// Synthetic presentation fixtures; these are not session or permission records.
export const projects = [
  { project_id: 'p-orbit', name: 'Orbit workspace', description: 'A calmer place for work and the knowledge behind it.', code: 'OW' },
  { project_id: 'p-atlas', name: 'Atlas knowledge base', description: 'Make project decisions easier to find and understand.', code: 'AK' }
];
export const stateLabels = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' };
export const sampleMembers = [
  { project_id: 'p-orbit', user_id: 'ML', name: 'Morgan Lee' },
  { project_id: 'p-orbit', user_id: 'AN', name: 'Alex Nguyen' },
  { project_id: 'p-atlas', user_id: 'KR', name: 'Kris Reed' }
];
export function createSprints() {
  return [
    { sprint_id: 's-previous', project_id: 'p-orbit', name: 'Sprint 03', state: 'completed', goal: 'Make source identity explicit', start_date: '2026-10-05', end_date: '2026-10-16' },
    { sprint_id: 's-current', project_id: 'p-orbit', name: 'Sprint 04', state: 'active', goal: 'Make knowledge part of the everyday workflow', start_date: '2026-10-19', end_date: '2026-10-30' },
    { sprint_id: 's-next', project_id: 'p-orbit', name: 'Sprint 05', state: 'planned', goal: 'Keep work and its evidence connected', start_date: '2026-11-02', end_date: '2026-11-13' }
  ];
}
export const sampleSource = {
  document_id: 'doc-sample-source', version_id: 'v3', passage_id: 'p-03',
  title: 'Exact source inspection', state: 'Current',
  excerpt: 'A source link identifies one immutable document version and passage. Opening that link requires a renewed read check; another version must never replace unavailable evidence.'
};
export function createTasks() {
  return [
    ['OW-12', 'Connect tasks to their source documents', 'story', 'todo', false, 'sprint', 'ML'],
    ['OW-13', 'Build the project selection experience', 'task', 'in_progress', false, 'sprint', 'AN'],
    ['OW-14', 'Keep exact version links in source previews', 'task', 'in_progress', true, 'sprint', 'ML'],
    ['OW-15', 'Clarify empty and unavailable states', 'task', 'todo', false, 'sprint', null],
    ['OW-16', 'Define the three-column task workflow', 'story', 'done', false, 'sprint', 'AN'],
    ['OW-17', 'Retain keyboard focus after closing task detail', 'bug', 'todo', false, 'backlog', null],
    ['OW-18', 'Explain semantic indexing readiness', 'task', 'todo', false, 'backlog', 'ML'],
    ['OW-19', 'Distinguish historical and current evidence', 'story', 'done', false, 'completed', 'AN'],
    ['OW-20', 'Review recovery messages before Sprint planning', 'task', 'todo', false, 'backlog', null]
  ].map(([task_id, title, type, state, blocked, kind, assignee_id], index) => ({
    task_id, title, type, state, blocked, assignee_id, project_id: 'p-orbit', revision: 1,
    description: 'Help the team understand the work without losing its context. Keep the interaction clear, make the current state visible, and preserve a straightforward keyboard path.',
    work_location: kind === 'backlog' ? { kind, position: String(index) } : { kind, sprint_id: kind === 'completed' ? 's-previous' : 's-current' },
    blocker_events: task_id === 'OW-14' ? [
      { sequence: 1, status: 'open', note: 'Waiting for source fixture.' },
      { sequence: 2, status: 'resolved', note: 'Source fixture supplied.' },
      { sequence: 3, status: 'open', note: 'Waiting for source contract review.' }
    ] : [], source: task_id === 'OW-14' || task_id === 'OW-12' ? { ...sampleSource } : null,
    allocation_history: kind === 'completed' ? [{ sprint_id: 's-previous', allocation_state: 'completed' }] : []
  }));
}
