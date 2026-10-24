import { createTasks, createSprints, projects, stateLabels, sampleMembers } from './fixtures.mjs';

const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const svg = paths => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const icons = {
  board: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16M15 4v16"/>',
  backlog: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  docs: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M8 13h8M8 17h5"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  members: '<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6M21 20v-2a6 6 0 0 0-4-5"/>',
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
  chevron: '<path d="m8 10 4 4 4-4"/>',
  source: '<path d="m10 13 4-4M8 16l-1 1a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0M16 8l1-1a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0" transform="translate(1 1) scale(.9)"/>',
  cycle: '<path d="M20 7a9 9 0 1 0 1 8M20 3v5h-5"/>',
  mark: '<path d="M3 17V7h7v10h11V7h-7v10z"/>',
  exit: '<path d="M10 4H4v16h6M13 8l4 4-4 4M8 12h13"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>'
};
const icon = name => svg(icons[name] || icons.source);
const brand = () => `<span class="brand-mark">${icon('mark')}</span><span translate="no">threadwork</span>`;


export function mountApp(root) {
  const doc = root.ownerDocument;
  const freshState = () => ({ screen: 'projects', menuOpen: false, view: 'board', project: projects[0], tasks: createTasks(), sprints: createSprints(), sprintId: 's-next', scenario: 'ready', query: '', assignee: '', blockedOnly: false, selected: null, sourceState: 'ready', selection: new Set(), draftOrder: null, backlogRevision: '9007199254740993', orderRevision: null, allocations: [], operationSequence: 0, notice: '' });
  const state = freshState();
  let darkTheme = false;
  doc.documentElement.dataset.theme = 'light';
  let returnFocus = null;
  const button = (action, label, cls = '', extra = '') => `<button type="button" class="${cls}" data-action="${action}" ${extra}>${label}</button>`;
  const location = task => task.work_location.kind === 'backlog' ? 'Product Backlog' : task.work_location.kind === 'completed' ? 'Completed Sprint' : state.sprints.find(sprint => sprint.sprint_id === task.work_location.sprint_id)?.name || 'Sprint';
  const currentMembers = () => sampleMembers.filter(member => member.project_id === state.project.project_id);
  const currentTasks = () => state.tasks.filter(task => task.project_id === state.project.project_id);
  const filtered = tasks => tasks.filter(task => (!state.blockedOnly || task.blocked) && (!state.assignee || (state.assignee === 'unassigned' ? !task.assignee_id : task.assignee_id === state.assignee)) && task.title.toLowerCase().includes(state.query.toLowerCase()));
  function toolbar() {
    return `<aside class="preview-bar" aria-label="Preview controls"><span><span class="preview-dot"></span> Design preview <span class="preview-note">· Synthetic data · Changes reset on reload</span></span><div class="preview-actions">${button('toggle-theme', 'Dark theme', 'theme-toggle', `aria-pressed="${darkTheme}"`)}<label>View state <select id="scenario" ${state.screen !== 'workspace' ? 'disabled' : ''}>${[['ready', 'Ready'], ['loading', 'Loading'], ['empty', 'Empty'], ['denied', 'Unavailable'], ['failure', 'Load failed'], ['read_only', 'Read only'], ['conflict', 'Conflict'], ['unknown', 'Outcome unknown'], ['no_sprint', 'No active Sprint'], ['partial', 'Partial Backlog'], ['mixed', 'Mixed allocation outcomes'], ['authority_failure', 'Authority failure'], ['ai_offline', 'AI offline']].map(([value, label]) => `<option value="${value}" ${state.scenario === value ? 'selected' : ''}>${label}</option>`).join('')}</select></label></div></aside>`;
  }
  function directory() {
    return `<div class="directory"><header class="directory-header"><a class="brand" href="#" data-action="projects">${brand()}</a>${button('signout', 'Exit preview', 'secondary')}</header>
      <main id="main" tabindex="-1"><div class="directory-intro"><p class="section-label">Workspace</p><h1>Your projects <span class="directory-count">${projects.length}</span></h1><p class="lede">Pick up the work. Keep the context.</p></div>
        <div class="project-grid">${projects.map(project => `<button class="project-card" data-action="open-project" data-id="${project.project_id}"><span class="project-monogram">${project.code}</span><span class="project-card-content"><span class="project-card-title">${escape(project.name)}</span><span class="project-description">${escape(project.description)}</span></span><span class="project-card-footer">Open project ${icon('arrow')}</span></button>`).join('')}</div>
        <footer class="directory-footnote">Sample projects · Your preview changes reset on reload.</footer>
      </main><div class="directory-signature"><span>${icon('board')} Work</span><span class="signature-line"></span><span>${icon('source')} Context</span><span class="signature-line"></span><span>${icon('docs')} Evidence</span></div></div>`;
  }
  function login() {
    return `<main class="login" id="main"><div class="brand">${brand()}</div><section class="login-card"><p class="section-label">Workspace preview</p><h1>${state.screen === 'expired' ? 'Your session has ended' : 'Work and its context, together.'}</h1><p class="lede">Explore a sample project, plan a Sprint and follow a task back to its source.</p>${button('enter', `Open sample projects ${icon('arrow')}`, 'primary')}<p class="muted">No account is required. Live sign-in is not connected.</p></section></main>`;
  }
  function sidebar() {
    return `<aside class="sidebar ${state.menuOpen ? 'mobile-nav-open' : ''}"><div class="sidebar-header"><a class="brand" href="#" data-action="projects">${brand()}</a>${button('toggle-menu', icon('menu'), 'mobile-menu-toggle icon-button', `aria-label="Project menu" aria-expanded="${state.menuOpen}" aria-controls="project-navigation-area"`)}</div>
      <div id="project-navigation-area" class="navigation-area"><div class="scope-label">Project</div>${button('projects', `<span class="project-avatar">${state.project.code}</span><span class="project-switch-copy">${escape(state.project.name)}</span>${icon('chevron')}`, 'project-switch')}
      <nav aria-label="Project navigation">${['board', 'backlog', 'docs', 'search', 'members'].map(view => button(`nav-${view}`, `<span class="nav-icon">${icon(view)}</span>${{ board: 'Board', backlog: 'Backlog', docs: 'Documents', search: 'Search', members: 'Members' }[view]}`, `nav-item ${state.view === view ? 'active' : ''}`, state.view === view ? 'aria-current="page"' : '')).join('')}</nav>
      <div class="sidebar-note"><strong>Work has a backstory.</strong><p>Keep source versions and blocker history close to the task.</p></div>
      <div class="sidebar-bottom"><span class="service-dot ${state.scenario === 'ai_offline' ? 'offline' : ''}"></span>${state.scenario === 'ai_offline' ? 'AI offline · Work available' : 'Local preview · AI not connected'}</div>
      <div class="profile"><span class="avatar" data-person="JD">JD</span><span>Jamie Davis<small>Sample workspace</small></span>${button('signout', icon('exit'), 'icon-button', 'aria-label="Exit preview"')}</div></div></aside>`;
  }

  function errorPanel() {
    const content = {
      loading: ['Loading your workspace', 'Fetching the current project view…'],
      denied: ['Resource unavailable', 'This resource is unavailable. Return to your projects to continue.'],
      failure: ['We couldn’t load this view', 'The workspace service is unavailable. This is not an empty project.'],
      empty: ['A little room for what’s next.', 'There are no tasks in this view yet.'],
      no_sprint: ['No active Sprint', 'Open the Backlog to review work for the next Sprint.']
    }[state.scenario];
    const heading = readBlocked() ? 'h1' : 'h2';
    return `<section class="empty-panel" role="status"><span class="empty-symbol">${state.scenario === 'loading' ? '◌' : '▦'}</span><${heading}>${content[0]}</${heading}><p>${content[1]}</p>${state.scenario === 'failure' ? button('retry', 'Try again', 'secondary') : state.scenario === 'denied' ? button('projects', 'Back to projects', 'secondary') : state.scenario === 'no_sprint' ? button('nav-backlog', 'Open Backlog', 'secondary') : ''}</section>`;
  }
  function card(task) {
    const readableSource = task.source && !(state.selected === task.task_id && ['denied', 'failure'].includes(state.sourceState));
    const member = currentMembers().find(item => item.user_id === task.assignee_id);
    return `<button class="task-card ${task.blocked ? 'is-blocked' : ''} ${state.selected === task.task_id ? 'is-selected' : ''}" data-action="task" data-id="${task.task_id}" aria-expanded="${state.selected === task.task_id}"><span class="task-top"><span class="task-key">${task.task_id}</span><span class="task-type ${task.type}">${task.type}</span></span><strong>${escape(task.title)}</strong>
      ${task.blocked ? '<span class="blocked-label"><span class="blocker-marker" aria-hidden="true"></span>Blocked · Open blocker</span>' : ''}
      <span class="task-footer"><span class="task-context">${readableSource ? `${icon('source')} 1 source` : 'No linked source'}</span><span class="avatar small ${task.assignee_id ? '' : 'unassigned'}" data-person="${task.assignee_id || ''}" aria-label="${member ? escape(member.name) : 'Unassigned'}">${task.assignee_id || '–'}</span></span></button>`;
  }

  const readBlocked = () => ['denied', 'authority_failure', 'failure', 'loading'].includes(state.scenario);
  const writable = () => !readBlocked() && !['read_only', 'conflict', 'unknown', 'empty'].includes(state.scenario);
  const sprintLabel = sprint => ({ planned: 'Planned', active: 'Active', completed: 'Completed' })[sprint.state];
  const projectSprints = () => state.sprints.filter(sprint => sprint.project_id === state.project.project_id);
  const activeSprint = () => projectSprints().find(sprint => sprint.state === 'active');
  const selectedSprint = () => projectSprints().find(sprint => sprint.sprint_id === state.sprintId);
  const backlogTasks = () => currentTasks().filter(task => task.work_location.kind === 'backlog').sort((a, b) => Number(a.work_location.position) - Number(b.work_location.position));
  const projectAllocations = () => state.allocations.filter(result => result.project_id === state.project.project_id);
  const pendingTask = id => state.allocations.some(result => result.task_id === id && result.outcome === 'unknown');
  const completeList = () => state.scenario !== 'partial' && !state.query && !state.blockedOnly && !state.assignee;
  const canReorder = () => writable() && completeList() && !projectAllocations().some(result => result.outcome === 'unknown');
  const bumpBacklog = () => { state.backlogRevision = (BigInt(state.backlogRevision) + 1n).toString(); };
  const memberOptions = selected => `<option value="">Unassigned</option>${currentMembers().map(member => `<option value="${member.user_id}" ${selected === member.user_id ? 'selected' : ''}>${escape(member.name)}</option>`).join('')}`;
  function refresh(focusSelector = null, message = '', revealFocus = false) {
    render();
    if (focusSelector) root.querySelector(focusSelector)?.focus({ preventScroll: !revealFocus });
    root.querySelector('#announcement').textContent = message;
  }
  function board() {
    const sprint = activeSprint();
    const tasks = filtered(currentTasks().filter(task => task.work_location.kind === 'sprint' && task.work_location.sprint_id === sprint?.sprint_id));
    return `<div class="board">${Object.entries(stateLabels).map(([key, label]) => {
      const group = tasks.filter(task => task.state === key);
      return `<section class="column" aria-label="${label}"><header><span class="state-dot ${key}" aria-hidden="true"></span><h2>${label}</h2><span class="column-count">${group.length}</span></header><div class="column-tasks">${group.map(card).join('') || '<p class="column-empty">No tasks in this view</p>'}</div></section>`;
    }).join('')}</div>`;
  }
  function backlog() {
    const all = backlogTasks();
    const byId = new Map(all.map(task => [task.task_id, task]));
    const ordered = state.draftOrder ? state.draftOrder.map(id => byId.get(id)).filter(Boolean) : all;
    const visible = filtered(ordered).slice(0, state.scenario === 'partial' ? 1 : undefined);
    return `<section class="backlog-list"><div class="list-heading"><h2>Product Backlog <span>${visible.length}</span></h2><span>${state.scenario === 'partial' ? 'More pages remain · Reorder unavailable' : 'All sample Backlog pages loaded'}</span></div>
      <div class="reorder-toolbar"><span>Review the complete list before reordering.</span>${state.draftOrder ? button('save-order', 'Apply sample order', 'secondary', canReorder() ? '' : 'disabled') + button('cancel-order', 'Discard order', 'quiet') : ''}</div>
      ${visible.map((task, index) => `<div class="planning-row">
        <label class="task-check"><input type="checkbox" data-select-task="${task.task_id}" aria-label="Select ${task.task_id}" ${state.selection.has(task.task_id) ? 'checked' : ''} ${!writable() || pendingTask(task.task_id) ? 'disabled' : ''}></label>
        <button class="backlog-row" data-action="task" data-id="${task.task_id}"><span class="task-key">${task.task_id}</span><strong>${escape(task.title)}</strong><span class="pill">${stateLabels[task.state]}</span></button>
        <div class="order-actions">${button('move-up', '↑', 'icon-button', `data-id="${task.task_id}" aria-label="Move ${task.task_id} up" ${!canReorder() || index === 0 ? 'disabled' : ''}`)}${button('move-down', '↓', 'icon-button', `data-id="${task.task_id}" aria-label="Move ${task.task_id} down" ${!canReorder() || index === visible.length - 1 ? 'disabled' : ''}`)}</div>
      </div>`).join('') || '<p class="inline-empty">No tasks match this view.</p>'}
      <p class="list-note">${state.draftOrder ? 'Order is unsaved. Review and apply the complete permutation.' : 'Select work to plan a Sprint. Completed Sprint history is separate from current placement.'}</p></section>`;
  }
  function planning() {
    const sprint = selectedSprint();
    const items = currentTasks().filter(task => task.work_location.sprint_id === sprint?.sprint_id);
    const uncertainty = projectAllocations().some(result => result.outcome === 'unknown');
    return `<aside class="planning-panel" aria-label="Sprint planning"><div class="panel-kicker">Next Sprint</div><h2>Sprint planning</h2>
      <label class="field-label" for="sprint-select">Sprint</label><select id="sprint-select"><option value="">Choose a Sprint</option>${projectSprints().map(item => `<option value="${item.sprint_id}" ${sprint === item ? 'selected' : ''}>${escape(item.name)} · ${sprintLabel(item)}</option>`).join('')}</select>
      ${sprint ? `<div class="planning-summary"><span class="pill">${sprintLabel(sprint)}</span><h3>${escape(sprint.goal)}</h3><p>${sprint.start_date} → ${sprint.end_date}<br>Sample dates</p></div>
        ${sprint.state !== 'completed' ? button('allocate', `Allocate selected (${state.selection.size})`, 'primary full-width', !writable() || !state.selection.size || state.draftOrder || state.scenario === 'partial' ? 'disabled' : '') : '<p class="muted">Completed Sprint · Retained history</p>'}
        <ul class="sprint-items">${items.map(task => `<li>${button('task', `${task.task_id} · ${escape(task.title)}`, 'item-link', `data-id="${task.task_id}"`)}<small>${task.work_location.kind === 'completed' ? 'Retained completion' : stateLabels[task.state]}</small></li>`).join('') || '<li class="muted">No sample items in this Sprint.</li>'}</ul>
        ${sprint.state === 'planned' ? button('start-sprint', 'Start sample Sprint', 'secondary full-width', !writable() || activeSprint() || uncertainty ? 'disabled' : '') + (activeSprint() ? '<p class="muted">Complete the active Sprint before starting another.</p>' : '') : sprint.state === 'active' ? button('confirm-complete', 'Complete sample Sprint', 'secondary full-width', !writable() || uncertainty ? 'disabled' : '') : ''}` : '<p class="muted">Choose an existing Sprint or create a planned Sprint.</p>'}
      ${button('new-sprint', '+ Plan a Sprint', 'quiet', writable() ? '' : 'disabled')}
      ${projectAllocations().length ? `<section class="allocation-results" aria-label="Allocation results"><h3>Per-task outcomes</h3>${projectAllocations().map(result => `<div class="allocation-result ${result.outcome}"><strong>${result.task_id}</strong><span>${{ confirmed: 'Confirmed', rejected: 'Rejected', unknown: 'Outcome unknown' }[result.outcome]}</span>${result.outcome === 'unknown' ? '<p>Original sample request retained. Do not resubmit.</p>' : ''}</div>`).join('')}<p class="muted">Earlier confirmations remain applied. These are local simulations.</p></section>` : ''}
    </aside>`;
  }
  function inspector() {
    const task = state.tasks.find(item => item.task_id === state.selected);
    if (!task) return '';
    const taskWritable = writable() && !pendingTask(task.task_id);
    return `<aside class="task-inspector" aria-labelledby="inspector-title"><div class="dialog-top"><span>${task.task_id} · Sample task</span>${button('close-inspector', '×', 'icon-button', 'aria-label="Close task details"')}</div>
      <h2 id="inspector-title">${escape(task.title)}</h2><p class="detail-description">${escape(task.description)}</p>
      <dl><dt>Location</dt><dd>${escape(location(task))}</dd></dl>
      <label class="field-label" for="task-state">Task state</label><select id="task-state" ${taskWritable ? '' : 'disabled'}>${Object.entries(stateLabels).map(([value, label]) => `<option value="${value}" ${task.state === value ? 'selected' : ''}>${label}</option>`).join('')}</select>
      <label class="field-label" for="task-assignee">Assignee</label><select id="task-assignee" ${taskWritable ? '' : 'disabled'}>${memberOptions(task.assignee_id)}</select>
      ${taskWritable ? button('save-state', 'Apply sample change', 'primary full-width inspector-save') : '<p class="muted">Read-only sample state</p>'}
      <section class="detail-section"><h3>Blocker history</h3><ol class="blocker-history">${task.blocker_events.map(event => `<li><strong>#${event.sequence} · ${event.status === 'open' ? 'Open' : 'Resolved'}</strong><p>${escape(event.note)}</p></li>`).join('') || '<li class="muted">No blocker events.</li>'}</ol>
        ${taskWritable ? `<form id="blocker-form"><label class="field-label" for="blocker-status">New event</label><select id="blocker-status"><option value="open">Open</option><option value="resolved">Resolved</option></select><label class="field-label" for="blocker-note">Note</label><textarea id="blocker-note" name="note" required maxlength="400" rows="2" placeholder="What happened?"></textarea><button class="secondary full-width" type="submit">Add sample blocker event</button></form>` : ''}</section>
      <section class="detail-section"><h3>Connected knowledge</h3>${task.source && !['denied', 'failure'].includes(state.sourceState) ? `<button class="source-link" data-action="open-source">${icon('docs')} ${state.sourceState === 'unavailable' ? 'Citation unavailable' : escape(task.source.title)}<small>${escape(task.source.version_id)} · Exact passage</small></button>` : '<p class="muted">No available source links in this sample.</p>'}</section>
      <p class="dialog-note">Preview only · No server changes</p></aside>`;
  }
  function workspace() {
    if (readBlocked()) {
      const content = state.scenario === 'authority_failure' ? '<section class="empty-panel" role="alert"><h1>Unable to load workspace</h1><p>Access could not be verified. No project information is displayed.</p></section>' : errorPanel();
      return `<div class="safe-workspace"><header class="directory-header"><span class="brand">${brand()}</span>${button('projects', 'Back to projects', 'quiet')}</header><main id="main" tabindex="-1">${content}</main></div>`;
    }
    const titles = { board: 'Sprint board', backlog: 'Product Backlog', docs: 'Documents', search: 'Search', members: 'Members' };
    const workView = ['board', 'backlog'].includes(state.view);
    const sprint = activeSprint();
    const noSprint = state.view === 'board' && (!sprint || state.scenario === 'no_sprint');
    const visibleTasks = currentTasks().filter(task => state.view === 'backlog' ? task.work_location.kind === 'backlog' : task.work_location.kind === 'sprint' && task.work_location.sprint_id === sprint?.sprint_id);
    const blockedCount = visibleTasks.filter(task => task.blocked).length;
    const cannotDisplay = state.scenario === 'empty' || noSprint;
    return `<div class="workspace">${sidebar()}<div class="workspace-body"><header class="topbar"><span>Workspace <span class="breadcrumb-separator">/</span> ${escape(state.project.name)}</span><div>${button('projects', 'All projects', 'quiet')}${button('expire', 'End sample session', 'quiet')}<span class="avatar small">JD</span></div></header>
      <main id="main" tabindex="-1"><div class="page-heading"><div><p class="section-label">${escape(state.project.name)}</p><h1>${titles[state.view]}</h1><p>${state.view === 'backlog' ? 'Shape the work, then give it a place in the next Sprint.' : 'Follow the work from its next step to its source.'}</p></div>${workView && writable() ? button('create', '+ New task', 'primary') : ''}</div>
      ${state.notice ? `<div class="notice" role="status">${escape(state.notice)}</div>` : ''}
      ${state.scenario === 'read_only' ? '<div class="notice">Read-only view · Sample changes are unavailable.</div>' : ''}
      ${state.scenario === 'conflict' ? `<div class="notice warning" role="alert">Work changed elsewhere. The unsaved order and selection were discarded. ${button('reload-work', 'Reload and reconsider', 'secondary')}</div>` : ''}
      ${state.scenario === 'unknown' ? '<div class="notice warning" role="alert">Outcome unknown. Preserve the original request; do not submit a new operation.</div>' : ''}
      ${state.scenario === 'ai_offline' ? '<div class="notice warning">AI is unavailable. Healthy workspace operations remain available.</div>' : ''}
      ${!workView ? `<section class="empty-panel"><h2>${titles[state.view]} is next</h2><p>This slice focuses on work and task context.</p>${button('nav-board', 'Back to Board', 'secondary')}</section>` : cannotDisplay ? (noSprint ? `<section class="empty-panel" role="status"><h2>No active Sprint</h2><p>Plan work in the Backlog, then start a Sprint.</p>${button('nav-backlog', 'Open planning', 'secondary')}</section>` : errorPanel()) : `
        <section class="sprint-strip"><span class="sprint-icon" aria-hidden="true">${icon('cycle')}</span><div><strong>${state.view === 'board' ? escape(sprint.name) : 'The next good idea starts here'}</strong><span>${state.view === 'board' ? escape(sprint.goal) : 'Review and shape work before planning a Sprint'}</span></div><span class="pill">${state.view === 'board' ? 'Active' : 'Backlog'}</span>${state.view === 'board' ? button('confirm-complete', 'Complete Sprint', 'secondary', !writable() || projectAllocations().some(result => result.outcome === 'unknown') ? 'disabled' : '') : ''}</section>
        <div class="view-toolbar"><div class="view-tabs">${button('nav-board', `${icon('board')} Board`, state.view === 'board' ? 'selected' : '')}${button('nav-backlog', `${icon('backlog')} Backlog`, state.view === 'backlog' ? 'selected' : '')}</div><div class="filters"><label class="sr-only" for="assignee-filter">Filter by assignee</label><select id="assignee-filter"><option value="">All assignees</option><option value="unassigned" ${state.assignee === 'unassigned' ? 'selected' : ''}>Unassigned</option>${currentMembers().map(member => `<option value="${member.user_id}" ${state.assignee === member.user_id ? 'selected' : ''}>${escape(member.name)}</option>`).join('')}</select><label class="filter-search"><span aria-hidden="true">${icon('search')}</span><input id="filter" type="search" placeholder="Filter tasks…" aria-label="Filter tasks" value="${escape(state.query)}"></label>${button('blocked', `Blocked · ${blockedCount}`, state.blockedOnly ? 'filter-button selected' : 'filter-button', `aria-pressed="${state.blockedOnly}"`)}</div></div>
        <div class="work-detail-layout ${state.selected ? 'has-inspector' : ''}"><div class="work-main"><div class="${state.view === 'backlog' ? 'planning-layout' : ''}"><div id="task-results">${state.view === 'board' ? board() : backlog()}</div>${state.view === 'backlog' ? planning() : ''}</div></div>${inspector()}</div>
        <footer class="board-footnote"><span>Select a task to inspect its context alongside the work.</span><span>Sample data · No server changes</span></footer>`}
      </main></div></div>`;
  }
  function render() {
    root.innerHTML = `<a class="skip-link" href="#main">Skip to content</a>${toolbar()}${['login', 'expired'].includes(state.screen) ? login() : state.screen === 'projects' ? directory() : workspace()}<div id="dialog-host"></div><div class="sr-only" role="status" id="announcement"></div>`;
  }
  function openDialog(kind) {
    returnFocus = doc.activeElement;
    let body;
    if (kind === 'create') body = `<h2 id="dialog-title">A new place to start.</h2><p class="muted">Create a sample Product Backlog item.</p><form id="create-form"><label class="field-label" for="task-title">Task title</label><input id="task-title" name="title" required maxlength="180"><label class="field-label" for="task-type">Type</label><select id="task-type"><option value="task">Task</option><option value="story">Story</option><option value="bug">Bug</option></select><div class="dialog-footer">${button('close', 'Cancel', 'secondary')}<button class="primary" type="submit">Create sample task</button></div></form>`;
    if (kind === 'sprint') body = `<h2 id="dialog-title">Plan a Sprint</h2><form id="sprint-form"><label class="field-label" for="sprint-name">Name</label><input id="sprint-name" name="name" required maxlength="80"><label class="field-label" for="sprint-goal">Goal</label><textarea id="sprint-goal" name="goal" required maxlength="300"></textarea><label class="field-label" for="sprint-start">Start date</label><input id="sprint-start" type="date" name="start" required><label class="field-label" for="sprint-end">End date</label><input id="sprint-end" type="date" name="end" required><p id="form-error" role="alert"></p><div class="dialog-footer">${button('close', 'Cancel', 'secondary')}<button class="primary" type="submit">Create planned Sprint</button></div></form>`;
    if (kind === 'complete') {
      const sprint = state.view === 'board' ? activeSprint() : selectedSprint();
      if (!sprint || sprint.state !== 'active') return;
      state.completingSprint = sprint.sprint_id;
      body = `<h2 id="dialog-title">Complete ${escape(sprint.name)}?</h2><p class="detail-description">Done items stay in this Sprint's history. Unfinished items return to the Product Backlog as To Do. Blocker history is retained.</p><div class="dialog-footer">${button('close', 'Keep Sprint active', 'secondary')}${button('complete-sprint', 'Complete sample Sprint', 'primary')}</div>`;
    }
    if (kind === 'source') {
      const task = state.tasks.find(item => item.task_id === state.selected);
      if (!task?.source) return;
      const source = task.source;
      const sourceStates = {
        unavailable: '<h2 id="dialog-title">Citation unavailable</h2><p>This exact version or passage is unavailable. No other version is substituted.</p>',
        denied: '<h2 id="dialog-title">Resource unavailable</h2>',
        failure: '<h2 id="dialog-title">Unable to open source</h2><p>Access could not be verified. No source details are displayed.</p>'
      };
      body = `<div class="source-preview-controls"><label for="source-state">Source preview state</label><select id="source-state">${['ready', 'unavailable', 'denied', 'failure'].map(value => `<option ${state.sourceState === value ? 'selected' : ''}>${value}</option>`).join('')}</select></div>${state.sourceState === 'ready' ? `<h2 id="dialog-title">${escape(source.title)}</h2><p class="pill">${source.state} · Synthetic version</p><p class="detail-key">${source.document_id} / ${source.version_id} / ${source.passage_id}</p><blockquote>${escape(source.excerpt)}</blockquote><p class="muted">This is an exact synthetic passage, not a live protected read.</p>` : sourceStates[state.sourceState]}${state.sourceState === 'unavailable' ? `<p class="detail-key">${source.document_id} / ${source.version_id} / ${source.passage_id} · Readable sample identity only</p>` : ''}<div class="dialog-footer">${button('close', 'Close source', 'secondary')}</div>`;
    }
    root.querySelector('#dialog-host').innerHTML = `<dialog aria-labelledby="dialog-title"><div class="dialog-top"><span>Local sample</span>${button('close', '×', 'icon-button', 'aria-label="Close dialog"')}</div>${body}<p class="dialog-note">Preview only · No server changes</p></dialog>`;
    const dialog = root.querySelector('dialog');
    dialog.addEventListener('cancel', event => { event.preventDefault(); closeDialog(); });
    if (dialog.showModal) dialog.showModal(); else dialog.setAttribute('open', '');
    dialog.querySelector('button')?.focus();
  }
  function closeDialog() {
    root.querySelector('dialog')?.close?.();
    root.querySelector('#dialog-host').innerHTML = '';
    if (returnFocus?.isConnected) returnFocus.focus();
    else root.querySelector('[data-action="open-source"], [data-action="close-inspector"], main')?.focus();
  }
  function moveTask(id, offset) {
    if (!canReorder()) return;
    if (!state.draftOrder) { state.draftOrder = backlogTasks().map(task => task.task_id); state.orderRevision = state.backlogRevision; }
    const from = state.draftOrder.indexOf(id), to = from + offset;
    if (from < 0 || to < 0 || to >= state.draftOrder.length) return;
    [state.draftOrder[from], state.draftOrder[to]] = [state.draftOrder[to], state.draftOrder[from]];
    refresh(`[data-action="${offset < 0 ? 'move-up' : 'move-down'}"][data-id="${id}"]:not(:disabled)`, 'Sample order changed locally. Apply the complete order to confirm.');
    if (doc.activeElement === doc.body) root.querySelector('[data-action="save-order"]')?.focus();
  }
  function allocateSelected() {
    const sprint = selectedSprint();
    if (!writable() || !sprint || sprint.state === 'completed' || state.draftOrder || state.scenario === 'partial') return;
    const ids = [...state.selection];
    const results = ids.map((id, index) => {
      const task = state.tasks.find(item => item.task_id === id && item.project_id === state.project.project_id);
      if (!task || pendingTask(id)) return null;
      const outcome = task.work_location.kind !== 'backlog' ? 'rejected' : state.scenario === 'mixed' ? ['confirmed', 'rejected', 'unknown'][index % 3] : 'confirmed';
      const operation = { key: `sample-allocation-${++state.operationSequence}`, project_id: state.project.project_id, task_id: id, sprint_id: sprint.sprint_id, expected_revision: task.revision };
      if (outcome === 'confirmed') { task.work_location = { kind: 'sprint', sprint_id: sprint.sprint_id }; task.revision++; bumpBacklog(); }
      return { ...operation, outcome };
    }).filter(Boolean);
    state.allocations.push(...results); state.selection.clear();
    refresh('#sprint-select', 'Sample allocation outcomes recorded separately for each task.');
  }
  root.addEventListener('click', event => {
    const target = event.target.closest('[data-action]');
    if (!target || !root.contains(target) || target.disabled) return;
    event.preventDefault();
    const action = target.dataset.action;
    if (action === 'toggle-theme') {
      darkTheme = !darkTheme;
      doc.documentElement.dataset.theme = darkTheme ? 'dark' : 'light';
      target.setAttribute('aria-pressed', String(darkTheme));
      const themeMeta = doc.querySelector('meta[name="theme-color"]');
      if (themeMeta) themeMeta.content = darkTheme ? '#11151b' : '#f4f5f7';
      return;
    }
    if (action === 'close') return closeDialog();
    if (action === 'toggle-menu') { state.menuOpen = !state.menuOpen; return refresh('[data-action="toggle-menu"]'); }
    if (action === 'task' && !readBlocked()) { state.selected = target.dataset.id; state.sourceState = 'ready'; return refresh('[data-action="close-inspector"]', '', true); }
    if (action === 'close-inspector') { const id = state.selected; state.selected = null; return refresh(`[data-action="task"][data-id="${id}"]`, '', true); }
    if (action === 'open-source' && !readBlocked()) return openDialog('source');
    if (action === 'create' && writable()) return openDialog('create');
    if (action === 'new-sprint' && writable()) return openDialog('sprint');
    if (action === 'confirm-complete' && writable() && !projectAllocations().some(result => result.outcome === 'unknown')) return openDialog('complete');
    if (action === 'allocate') return allocateSelected();
    if (action === 'move-up' || action === 'move-down') return moveTask(target.dataset.id, action === 'move-up' ? -1 : 1);
    if (action === 'cancel-order') { state.draftOrder = null; return refresh(); }
    if (action === 'save-order' && canReorder() && state.draftOrder) {
      const actual = backlogTasks().map(task => task.task_id);
      if (state.orderRevision !== state.backlogRevision || actual.length !== state.draftOrder.length || new Set(state.draftOrder).size !== actual.length || !actual.every(id => state.draftOrder.includes(id))) {
        state.draftOrder = null; state.selection.clear(); state.scenario = 'conflict'; return refresh();
      }
      state.draftOrder.forEach((id, index) => { const task = state.tasks.find(item => item.task_id === id); task.work_location.position = String(index + 1); task.revision++; });
      bumpBacklog(); state.draftOrder = null; state.notice = 'Sample Backlog order applied. No server changes.'; return refresh();
    }
    if (action === 'save-state' && writable()) {
      const task = state.tasks.find(item => item.task_id === state.selected);
      if (!task || pendingTask(task.task_id)) return;
      const next = root.querySelector('#task-state').value;
      const assignee = root.querySelector('#task-assignee').value || null;
      if (assignee && !currentMembers().some(member => member.user_id === assignee)) return;
      if (task.work_location.kind === 'completed' && next !== 'done') { task.state = 'todo'; task.work_location = { kind: 'backlog', position: String(state.tasks.length + 1) }; bumpBacklog(); }
      else task.state = next;
      task.assignee_id = assignee; task.revision++;
      return refresh('#task-state', 'Sample task updated. No server changes.');
    }
    if (action === 'complete-sprint' && writable() && !projectAllocations().some(result => result.outcome === 'unknown')) {
      const sprint = state.sprints.find(item => item.sprint_id === state.completingSprint && item.project_id === state.project.project_id && item.state === 'active');
      if (!sprint) return;
      for (const task of currentTasks().filter(item => item.work_location.kind === 'sprint' && item.work_location.sprint_id === sprint.sprint_id)) {
        task.allocation_history.push({ sprint_id: sprint.sprint_id, allocation_state: task.state === 'done' ? 'completed' : 'returned' });
        if (task.state === 'done') task.work_location = { kind: 'completed', sprint_id: sprint.sprint_id };
        else { task.state = 'todo'; task.work_location = { kind: 'backlog', position: String(state.tasks.indexOf(task) + state.tasks.length + 1) }; bumpBacklog(); }
        task.revision++;
      }
      sprint.state = 'completed'; closeDialog(); state.selected = null; state.notice = 'Sample Sprint completed. Unfinished work returned to Backlog as To Do; completion and blocker history retained.';
      return refresh();
    }
    if (action === 'start-sprint' && writable() && !activeSprint() && !projectAllocations().some(result => result.outcome === 'unknown')) {
      const sprint = selectedSprint(); if (!sprint || sprint.state !== 'planned') return;
      sprint.state = 'active'; state.view = 'board'; state.selected = null; state.notice = 'Sample Sprint started.'; return refresh();
    }
    if (['signout', 'expire'].includes(action)) {
      Object.assign(state, freshState()); state.screen = action === 'expire' ? 'expired' : 'login';
    } else if (action === 'enter' || action === 'projects') { state.screen = 'projects'; state.scenario = 'ready'; state.selected = null; state.selection.clear(); state.draftOrder = null; }
    else if (action === 'open-project') { state.project = projects.find(project => project.project_id === target.dataset.id); state.screen = 'workspace'; state.view = 'board'; state.query = ''; state.assignee = ''; state.blockedOnly = false; state.selected = null; state.selection.clear(); state.draftOrder = null; state.notice = ''; state.scenario = 'ready'; state.sprintId = projectSprints().find(sprint => sprint.state === 'planned')?.sprint_id || ''; }
    else if (action.startsWith('nav-')) { state.menuOpen = false; state.view = action.slice(4); state.query = ''; state.assignee = ''; state.blockedOnly = false; state.selected = null; if (state.scenario === 'no_sprint') state.scenario = 'ready'; }
    else if (action === 'blocked') { state.blockedOnly = !state.blockedOnly; state.selected = null; }
    else if (action === 'retry' || action === 'reload-work') { state.scenario = 'ready'; state.draftOrder = null; state.selection.clear(); state.notice = 'Sample view reloaded. Reconsider the work before submitting.'; }
    refresh(action === 'blocked' ? '[data-action="blocked"]' : 'main');
  });
  root.addEventListener('input', event => {
    if (event.target.id !== 'filter') return;
    state.query = event.target.value;
    state.draftOrder = null;
    root.querySelector('#task-results').innerHTML = state.view === 'board' ? board() : backlog();
  });
  root.addEventListener('change', event => {
    const target = event.target;
    if (target.id === 'scenario') {
      state.scenario = target.value; state.selected = null; state.selection.clear(); state.draftOrder = null; state.notice = '';
      if (readBlocked()) { state.query = ''; state.assignee = ''; state.sourceState = 'ready'; }
      return refresh('#scenario');
    }
    if (target.id === 'assignee-filter') { state.assignee = target.value; state.draftOrder = null; state.selected = null; return refresh('#assignee-filter'); }
    if (target.id === 'sprint-select') { state.sprintId = target.value; return refresh('#sprint-select'); }
    if (target.dataset.selectTask && writable() && !pendingTask(target.dataset.selectTask)) {
      if (target.checked) state.selection.add(target.dataset.selectTask); else state.selection.delete(target.dataset.selectTask);
      return refresh(`[data-select-task="${target.dataset.selectTask}"]`);
    }
    if (target.id === 'source-state') { const focus = returnFocus; state.sourceState = target.value; render(); openDialog('source'); returnFocus = focus; root.querySelector('#source-state').focus(); }
  });
  root.addEventListener('submit', event => {
    if (!['create-form', 'sprint-form', 'blocker-form'].includes(event.target.id)) return;
    event.preventDefault(); if (!writable()) return;
    if (event.target.id === 'blocker-form') {
      const task = state.tasks.find(item => item.task_id === state.selected);
      const note = root.querySelector('#blocker-note').value.trim(); if (!task || !note || pendingTask(task.task_id)) return;
      const status = root.querySelector('#blocker-status').value;
      task.blocker_events.push({ sequence: task.blocker_events.length + 1, status, note }); task.blocked = status === 'open'; task.revision++;
      return refresh('#blocker-note', 'Sample blocker event added. Earlier events retained.');
    }
    if (event.target.id === 'sprint-form') {
      const name = root.querySelector('#sprint-name').value.trim(), goal = root.querySelector('#sprint-goal').value.trim();
      const start = root.querySelector('#sprint-start').value, end = root.querySelector('#sprint-end').value;
      if (!name || !goal || !start || !end || start >= end) { root.querySelector('#form-error').textContent = 'Enter a name, goal and an end date after the start date.'; root.querySelector('#sprint-end').focus(); return; }
      const sprint = { sprint_id: `sample-sprint-${state.sprints.length + 1}`, project_id: state.project.project_id, name, goal, start_date: start, end_date: end, state: 'planned' };
      state.sprints.push(sprint); state.sprintId = sprint.sprint_id; closeDialog(); state.view = 'backlog'; state.notice = 'Planned sample Sprint created.'; return refresh('#sprint-select');
    }
    const title = root.querySelector('#task-title').value.trim(); if (!title) return;
    state.tasks.push({ task_id: `SAMPLE-${state.tasks.length + 1}`, project_id: state.project.project_id, title, type: root.querySelector('#task-type').value, state: 'todo', revision: 1, description: 'Locally created sample task.', blocked: false, assignee_id: null, work_location: { kind: 'backlog', position: String(state.tasks.length + 1) }, blocker_events: [], source: null, allocation_history: [] });
    bumpBacklog(); state.draftOrder = null; closeDialog(); state.view = 'backlog'; state.query = ''; state.assignee = ''; state.blockedOnly = false;
    refresh('main', 'Sample task added to the Backlog. No server changes.');
  });
  root.addEventListener('keydown', event => {
    if (event.key === 'Escape' && state.menuOpen) { state.menuOpen = false; refresh('[data-action="toggle-menu"]'); return; }
    if (event.key === 'Escape' && state.selected && !root.querySelector('dialog')) {
      const id = state.selected; state.selected = null; refresh(`[data-action="task"][data-id="${id}"]`, '', true);
    }
  });
  render();
}
