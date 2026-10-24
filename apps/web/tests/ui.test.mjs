import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { mountApp } from '../ui.mjs';
import { createPreviewServer } from '../preview-server.mjs';

function setup() {
  const dom = new JSDOM('<div id="app"></div>');
  const root = dom.window.document.querySelector('#app');
  mountApp(root);
  const click = selector => { const target = root.querySelector(selector); assert.ok(target, selector); target.click(); };
  const scenario = value => { const select = root.querySelector('#scenario'); select.value = value; select.dispatchEvent(new dom.window.Event('change', { bubbles: true })); };
  const change = (selector, value) => { const target = root.querySelector(selector); assert.ok(target, selector); if (target.type === 'checkbox') target.checked = value; else target.value = value; target.dispatchEvent(new dom.window.Event('change', { bubbles: true })); };
  const submit = selector => root.querySelector(selector).dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));
  return { dom, root, click, scenario, change, submit };
}
test('project selection, current placement and filtering remain separate', () => {
  const { dom, root, click } = setup();
  click('[data-id="p-orbit"]');
  assert.equal(root.querySelectorAll('.task-card').length, 5);
  assert.ok(!root.querySelector('[data-id="OW-19"]'));
  const input = root.querySelector('#filter'); input.value = 'exact version'; input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  assert.equal(root.querySelectorAll('.task-card').length, 1);
  click('[data-action="nav-backlog"]');
  assert.equal(root.querySelectorAll('.backlog-row').length, 3);
  click('[data-action="projects"]'); click('[data-id="p-atlas"]');
  assert.equal(root.querySelectorAll('.task-card').length, 0);
});
test('denial, loading and failure do not retain task rows', () => {
  const { root, click, scenario } = setup(); click('[data-id="p-orbit"]');
  for (const value of ['denied', 'loading', 'failure']) {
    scenario(value); assert.equal(root.querySelectorAll('.task-card').length, 0);
    assert.ok(!root.textContent.includes('Connect tasks to their source documents'));
  }
  assert.ok(root.textContent.includes('not an empty project'));
  click('[data-action="retry"]'); assert.equal(root.querySelectorAll('.task-card').length, 5);
});
test('read-only controls and direct task state transitions are presentation only', () => {
  const { root, click, scenario } = setup(); click('[data-id="p-orbit"]');
  scenario('read_only'); click('[data-id="OW-12"]');
  assert.equal(root.querySelector('#task-state').disabled, true); assert.ok(!root.querySelector('[data-action="save-state"]'));
  click('[data-action="close-inspector"]'); scenario('ready'); click('[data-id="OW-12"]');
  root.querySelector('#task-state').value = 'done'; click('[data-action="save-state"]');
  assert.equal(root.querySelector('[aria-label="Done"] .column-count').textContent, '2');
  assert.match(root.querySelector('#announcement').textContent, /No server changes/);
});
test('sample creation escapes markup and stays in Backlog; expiry clears workspace', () => {
  const { dom, root, click } = setup(); click('[data-id="p-orbit"]'); click('[data-action="create"]');
  root.querySelector('#task-title').value = '<img src=x onerror=alert(1)>';
  root.querySelector('#create-form').dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));
  assert.equal(root.querySelectorAll('.backlog-row').length, 4); assert.equal(root.querySelectorAll('img').length, 0);
  click('[data-action="expire"]'); assert.match(root.textContent, /session has ended/); assert.equal(root.querySelector('.workspace'), null);
  click('[data-action="enter"]'); click('[data-id="p-orbit"]'); click('[data-action="nav-backlog"]');
  assert.equal(root.querySelectorAll('.backlog-row').length, 3);
});

test('denied and unknown authority clear the entire project shell, counts, task context and source modal', () => {
  const { root, click, scenario } = setup(); click('[data-id="p-orbit"]');
  click('[data-id="OW-14"]'); click('[data-action="open-source"]');
  scenario('denied');
  assert.match(root.textContent, /Resource unavailable/);
  for (const value of ['Orbit workspace', 'OW-14', 'Morgan Lee', 'Exact source inspection', 'Blocker history']) assert.ok(!root.textContent.includes(value), value);
  assert.equal(root.querySelector('.nav-count'), null); assert.equal(root.querySelector('dialog'), null); assert.equal(root.querySelector('.project-switch'), null);
  scenario('authority_failure'); assert.match(root.textContent, /Access could not be verified/); assert.equal(root.querySelector('.workspace'), null);
});

test('Backlog reorder is a complete explicit permutation; partial and filtered views disable it', () => {
  const { dom, root, click, scenario } = setup(); click('[data-id="p-orbit"]'); click('[data-action="nav-backlog"]');
  const order = () => [...root.querySelectorAll('.backlog-row')].map(node => node.dataset.id);
  assert.deepEqual(order(), ['OW-17', 'OW-18', 'OW-20']);
  click('[data-action="move-up"][data-id="OW-18"]'); assert.deepEqual(order(), ['OW-18', 'OW-17', 'OW-20']);
  click('[data-action="save-order"]'); assert.match(root.textContent, /Sample Backlog order applied/);
  click('[data-action="nav-board"]'); click('[data-action="nav-backlog"]'); assert.deepEqual(order(), ['OW-18', 'OW-17', 'OW-20']);
  scenario('partial'); assert.equal(root.querySelectorAll('.backlog-row').length, 1);
  assert.ok([...root.querySelectorAll('.order-actions button')].every(node => node.disabled));
  scenario('ready'); const input = root.querySelector('#filter'); input.value = 'readiness'; input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  assert.ok([...root.querySelectorAll('.order-actions button')].every(node => node.disabled));
  assert.equal(root.querySelector('[data-action="save-order"]'), null);
});

test('conflict discards a pending order and selection and requires explicit reload', () => {
  const { root, click, scenario, change } = setup(); click('[data-id="p-orbit"]'); click('[data-action="nav-backlog"]');
  change('[data-select-task="OW-17"]', true); click('[data-action="move-down"][data-id="OW-17"]'); scenario('conflict');
  assert.equal(root.querySelector('[data-action="save-order"]'), null);
  assert.equal(root.querySelector('input[type="checkbox"]:checked'), null);
  assert.ok([...root.querySelectorAll('.order-actions button')].every(node => node.disabled));
  click('[data-action="reload-work"]'); assert.match(root.textContent, /Reconsider/);
});

test('mixed allocation retains confirmations and prevents unknown task resubmission after navigation', () => {
  const { root, click, scenario, change } = setup(); click('[data-id="p-orbit"]'); click('[data-action="nav-backlog"]'); scenario('mixed');
  for (const id of ['OW-17', 'OW-18', 'OW-20']) change(`[data-select-task="${id}"]`, true);
  click('[data-action="allocate"]');
  assert.equal(root.querySelectorAll('.allocation-result.confirmed').length, 1);
  assert.equal(root.querySelectorAll('.allocation-result.rejected').length, 1);
  assert.equal(root.querySelectorAll('.allocation-result.unknown').length, 1);
  assert.equal(root.querySelector('.backlog-row[data-id="OW-17"]'), null);
  assert.ok(root.querySelector('[data-select-task="OW-20"]').disabled);
  click('.backlog-row[data-id="OW-20"]'); assert.ok(root.querySelector('#task-state').disabled); assert.equal(root.querySelector('#blocker-form'), null);
  click('[data-action="close-inspector"]');
  click('[data-action="projects"]'); click('[data-id="p-atlas"]'); click('[data-action="nav-backlog"]');
  assert.equal(root.querySelectorAll('.allocation-result').length, 0);
  click('[data-action="projects"]'); click('[data-id="p-orbit"]'); click('[data-action="nav-backlog"]');
  assert.ok(root.querySelector('[data-select-task="OW-20"]').disabled);
  assert.equal(root.querySelectorAll('.allocation-result.unknown').length, 1);
});

test('task inspector preserves blocker order, supports assignment and opens only the selected exact source', () => {
  const { root, click, change, submit } = setup(); click('[data-id="p-orbit"]'); click('[data-id="OW-14"]');
  assert.equal(root.querySelectorAll('.task-card').length, 5); assert.equal(root.querySelector('dialog'), null);
  assert.equal(root.querySelectorAll('.blocker-history li').length, 3);
  change('#task-assignee', 'AN'); click('[data-action="save-state"]'); assert.equal(root.querySelector('#task-assignee').value, 'AN');
  change('#blocker-status', 'resolved'); root.querySelector('#blocker-note').value = 'Contract reviewed.'; submit('#blocker-form');
  assert.equal(root.querySelectorAll('.blocker-history li').length, 4); assert.match(root.querySelector('.blocker-history').textContent, /#4 · Resolved/);
  assert.ok(!root.querySelector('.task-card[data-id="OW-14"]').classList.contains('is-blocked'));
  click('[data-action="open-source"]'); assert.match(root.querySelector('dialog').textContent, /doc-sample-source \/ v3 \/ p-03/);
  change('#source-state', 'unavailable'); assert.match(root.querySelector('dialog').textContent, /No other version is substituted/); assert.equal(root.querySelector('blockquote'), null);
  change('#source-state', 'denied'); assert.ok(!root.textContent.includes('doc-sample-source')); assert.ok(!root.textContent.includes('Exact source inspection'));
  click('[data-action="close"]'); click('[data-action="close-inspector"]'); change('#assignee-filter', 'AN');
  assert.ok(root.querySelector('[data-action="task"][data-id="OW-14"]'));
  assert.equal(root.querySelectorAll('.task-card').length, 3);
});

test('Sprint completion returns unfinished work as To Do, retains Done history and permits only one Active Sprint', () => {
  const { root, click, change } = setup(); click('[data-id="p-orbit"]');
  click('[data-action="nav-backlog"]'); assert.ok(root.querySelector('[data-action="start-sprint"]').disabled);
  click('[data-action="nav-board"]'); click('[data-action="confirm-complete"]');
  assert.match(root.querySelector('dialog').textContent, /Done items stay/); click('[data-action="complete-sprint"]');
  assert.match(root.textContent, /No active Sprint/); click('[data-action="nav-backlog"]');
  assert.equal(root.querySelectorAll('.backlog-row').length, 7);
  assert.equal(root.querySelector('.backlog-row[data-id="OW-16"]'), null);
  click('[data-action="task"][data-id="OW-13"]'); assert.equal(root.querySelector('#task-state').value, 'todo'); click('[data-action="close-inspector"]');
  change('#sprint-select', 's-current'); click('.sprint-items [data-id="OW-16"]');
  change('#task-state', 'in_progress'); click('[data-action="save-state"]'); assert.equal(root.querySelector('#task-state').value, 'todo'); assert.match(root.querySelector('.task-inspector').textContent, /Product Backlog/);
  click('[data-action="close-inspector"]'); change('#sprint-select', 's-next'); click('[data-action="start-sprint"]');
  assert.ok(root.querySelector('.sprint-strip').textContent.includes('Sprint 05'));
});

test('planning a Sprint validates dates before creating a Planned sample', () => {
  const { root, click, submit } = setup(); click('[data-id="p-orbit"]'); click('[data-action="nav-backlog"]'); click('[data-action="new-sprint"]');
  root.querySelector('#sprint-name').value = 'Sprint 06'; root.querySelector('#sprint-goal').value = 'Review exact evidence'; root.querySelector('#sprint-start').value = '2026-11-20'; root.querySelector('#sprint-end').value = '2026-11-19'; submit('#sprint-form');
  assert.match(root.querySelector('#form-error').textContent, /end date after/);
  root.querySelector('#sprint-end').value = '2026-12-01'; submit('#sprint-form'); assert.equal(root.querySelector('dialog'), null);
  assert.match(root.querySelector('#sprint-select').selectedOptions[0].textContent, /Sprint 06 · Planned/);
});

test('task panel Escape restores focus and assignment selectors stay within the selected sample project', () => {
  const { dom, root, click, submit } = setup(); click('[data-id="p-orbit"]'); click('[data-id="OW-14"]');
  root.querySelector('.task-inspector').dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  assert.equal(root.querySelector('.task-inspector'), null); assert.equal(dom.window.document.activeElement.dataset.id, 'OW-14');
  click('[data-action="projects"]'); click('[data-id="p-atlas"]'); click('[data-action="create"]');
  root.querySelector('#task-title').value = 'Atlas sample task'; submit('#create-form'); click('.backlog-row');
  const names = root.querySelector('#task-assignee').textContent; assert.match(names, /Kris Reed/); assert.ok(!names.includes('Morgan Lee')); assert.ok(!names.includes('Alex Nguyen'));
});

test('project menu exposes state, closes with Escape and closes on view navigation', () => {
  const { dom, root, click } = setup(); click('[data-id="p-orbit"]');
  const menu = () => root.querySelector('[data-action="toggle-menu"]');
  assert.equal(menu().getAttribute('aria-expanded'), 'false'); click('[data-action="toggle-menu"]');
  assert.equal(menu().getAttribute('aria-expanded'), 'true');
  menu().dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  assert.equal(menu().getAttribute('aria-expanded'), 'false'); assert.equal(dom.window.document.activeElement, menu());
  click('[data-action="toggle-menu"]'); click('[data-action="nav-backlog"]');
  assert.equal(menu().getAttribute('aria-expanded'), 'false');
});
test('preview server serves only its allowlisted UI assets, with no network connection policy', async () => {
  const server = createPreviewServer(); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const response = await fetch(base); assert.equal(response.status, 200); assert.match(response.headers.get('content-security-policy'), /connect-src 'none'/);
    assert.match(await response.text(), /Threadwork/);
    const font = await fetch(base + '/assets/Geist-Variable.ttf'); assert.equal(font.status, 200); assert.equal(font.headers.get('content-type'), 'font/ttf');
    assert.deepEqual([...new Uint8Array(await font.arrayBuffer()).slice(0, 4)], [0, 1, 0, 0]);
    for (const path of ['/package.json', '/../../package.json', '/api/projects']) assert.equal((await fetch(base + path)).status, 404);
  } finally { await new Promise(resolve => server.close(resolve)); }
});

test('theme toggle retains unsaved task text and survives navigation and denied scope', () => {
  const { root, click, dom, scenario } = setup();
  click('[data-id="p-orbit"]'); click('[data-id="OW-14"]');
  root.querySelector('#blocker-note').value = 'Retain this note';
  click('[data-action="toggle-theme"]');
  assert.equal(dom.window.document.documentElement.dataset.theme, 'dark');
  assert.equal(root.querySelector('[data-action="toggle-theme"]').getAttribute('aria-pressed'), 'true');
  assert.equal(root.querySelector('#blocker-note').value, 'Retain this note');
  click('[data-action="close-inspector"]'); click('[data-action="nav-backlog"]');
  assert.equal(root.querySelector('[data-action="toggle-theme"]').getAttribute('aria-pressed'), 'true');
  scenario('denied');
  assert.ok(!root.textContent.includes('Orbit workspace'));
  click('[data-action="toggle-theme"]');
  assert.equal(dom.window.document.documentElement.dataset.theme, 'light');
  assert.equal(root.querySelector('[data-action="toggle-theme"]').getAttribute('aria-pressed'), 'false');
});
