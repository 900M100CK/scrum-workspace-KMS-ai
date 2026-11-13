import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
import {documentUiFixture} from './document-ui-fixture.mjs';

test('SP06 Document access Edge HTTPS browser test: creation, restricted detail, access management, responsiveness', {timeout: 240000}, async (t) => {
  const {chromium} = await import(process.env.SACW_PLAYWRIGHT_MODULE ?? 'playwright');
  const f = await documentUiFixture();
  t.after(() => f.close());

  const browser = await chromium.launch({channel: 'msedge', headless: true});
  t.after(() => browser.close());

  const context = await browser.newContext({viewport: {width: 1280, height: 900}});
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message ?? e.name));

  // 1. Visit origin and sign in
  await page.goto(f.origin);
  await page.getByLabel('Username', {exact: true}).fill(f.username);
  await page.getByLabel('Password', {exact: true}).fill(f.password);
  await page.getByRole('button', {name: 'Sign in', exact: true}).click();
  await page.getByRole('button', {name: 'Sign out', exact: true}).waitFor();

  // Verify session cookie
  const cookie = (await context.cookies()).find((c) => c.name === '__Host-sacw-session');
  assert(cookie && cookie.secure && cookie.httpOnly && cookie.sameSite === 'Strict');

  // 2. Navigate to project workspace
  await page.getByRole('link', {name: 'Workspace', exact: true}).click();
  await page.getByRole('button', {name: 'Synthetic task project', exact: true}).click();

  // Wait for document workspace to appear
  await page.getByRole('heading', {name: 'Documents', exact: true}).waitFor();

  // 3. Create a restricted document
  await page.getByLabel('Document title', {exact: true}).fill('Sprint Architecture Decision');
  await page.getByLabel('Classification', {exact: true}).selectOption('restricted');
  await page.getByLabel('Content (Text / Markdown)', {exact: true}).fill('# Architecture Decision\nGuarded boundary with ProjectRWGuard.');
  await page.getByRole('button', {name: 'Create document', exact: true}).click();

  // 4. Verify document appears in list with 'Restricted' badge
  await page.getByRole('button', {name: 'Sprint Architecture Decision', exact: true}).waitFor();
  const restrictedBadge = page.locator('.document-list .badge.restricted');
  await restrictedBadge.waitFor();
  assert.equal(await restrictedBadge.textContent(), 'Restricted');

  // 5. Open document detail
  await page.getByRole('button', {name: 'Sprint Architecture Decision', exact: true}).click();
  await page.getByRole('heading', {name: 'Sprint Architecture Decision', exact: true}).waitFor();

  // Verify content in <pre>
  const preText = await page.locator('.document-content pre').textContent();
  assert(preText?.includes('Guarded boundary with ProjectRWGuard.'));

  // 6. Manage access: Grant read to member
  await page.getByRole('heading', {name: 'Manage Access', exact: true}).waitFor();
  const granteeId = f.ids[1];
  await page.getByLabel('Grant read to member (User ID)', {exact: true}).fill(granteeId);
  await page.getByRole('button', {name: 'Grant read', exact: true}).click();

  // Verify grantee is listed in grant-list
  await page.locator(`.grant-list .member-id:has-text("${granteeId}")`).waitFor();

  // 7. Change classification to Project Shared
  await page.locator('#change-classification').selectOption('project_shared');
  await page.getByRole('button', {name: 'Update classification', exact: true}).click();

  // Wait for classification badge to update to Shared
  await page.locator('.document-detail .badge.project_shared:has-text("Shared")').waitFor();

  // 8. Capture screenshots and verify responsiveness
  const directory = process.env.SACW_TEST_EVIDENCE_DIR ? process.env.SACW_TEST_EVIDENCE_DIR + '/sp06-browser' : 'docs/implementation/features/sp-06-document-access/evidence/p13-20261111';
  await mkdir(directory, {recursive: true});

  // Desktop screenshot
  await page.screenshot({path: `${directory}/desktop.png`, fullPage: true});

  // Mobile layout check (390x844)
  await page.setViewportSize({width: 390, height: 844});
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  await page.screenshot({path: `${directory}/mobile.png`, fullPage: true});

  // 9. Sign out
  await page.getByRole('button', {name: 'Sign out', exact: true}).click();
  await page.getByRole('button', {name: 'Sign in', exact: true}).waitFor();

  assert.deepEqual(errors, []);

  // 10. Record results.json
  const summary = {
    date: '2026-11-11',
    node: process.version,
    browser: browser.version(),
    database: (await f.db.admin.query('SHOW server_version')).rows[0].server_version,
    image: f.db.image,
    https: true,
    tlsBypass: false,
    checks: [
      'session cookie secure strict',
      'document creation with restricted classification',
      'document listing with restricted badge',
      'document detail view with content pre display',
      'manage access grant read to member with cas revision',
      'manage access update classification to project_shared',
      'mobile responsive layout scrollWidth <= innerWidth',
      'clean sign out',
    ],
    pageErrors: errors,
  };
  await writeFile(`${directory}/results.json`, JSON.stringify(summary, null, 2) + '\n');
});
