import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir,mkdtemp,writeFile} from 'node:fs/promises';
import {projectUiFixture} from './project-ui-fixture.mjs';

test('P08 isolated Microsoft Edge: real cookies, current UI, unknown outcome and reload',{timeout:180000},async t=>{
 // Use an installed runner. A missing runner/browser fails explicitly, never silently skips.
 const {chromium}=await import(process.env.SACW_PLAYWRIGHT_MODULE??'playwright');
 const f=await projectUiFixture();t.after(()=>f.close());
 const browser=await chromium.launch({channel:'msedge',headless:true});t.after(()=>browser.close());
 const context=await browser.newContext({viewport:{width:1280,height:900}}),page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.name));
 await page.goto(f.origin);await page.getByLabel('Username',{exact:true}).fill(f.username);await page.getByLabel('Password',{exact:true}).fill(f.password);await page.getByRole('button',{name:'Sign in',exact:true}).click();await page.getByRole('button',{name:'Sign out',exact:true}).waitFor();
 const cookies=await context.cookies(f.origin),session=cookies.find(c=>c.name==='__Host-sacw-session');assert(session);assert(session.secure&&session.httpOnly);assert.equal(session.sameSite,'Strict');assert.equal(session.path,'/');assert.equal(session.domain,'localhost');
 await page.getByRole('link',{name:'Workspace',exact:true}).click();await page.getByText('You have no projects yet.',{exact:true}).waitFor();
 // Lose the first real POST response after the server has committed, then recover by original key.
 let lost=true;const requests=[];
 await page.route('**/api/projects',async route=>{if(route.request().method()!=='POST')return route.continue();requests.push({key:route.request().headers()['idempotency-key'],body:route.request().postData()});if(lost){lost=false;try{await route.fetch();}catch{await route.abort('failed');throw Error('Synthetic forwarding failed before controlled response loss; sensitive request details withheld');}return route.abort('failed');}return route.continue();});
 await page.getByLabel('Name',{exact:true}).fill('Browser project');await page.getByLabel('Description',{exact:true}).fill('Synthetic browser evidence');await page.getByRole('button',{name:'Create project',exact:true}).click();await page.getByRole('button',{name:'Check original operation',exact:true}).waitFor();
 await page.reload();await page.getByRole('button',{name:'Check original operation',exact:true}).waitFor();await page.getByRole('button',{name:'Check original operation',exact:true}).click();await page.getByRole('button',{name:'Browser project',exact:true}).waitFor();assert.equal(requests.length,2);assert.deepEqual(requests[0],requests[1]);
 const projects=(await f.db.admin.query('SELECT project_id FROM workspace.project WHERE created_by=$1',[f.browserUser])).rows;assert.equal(projects.length,1);const project=projects[0].project_id;
 await page.getByRole('button',{name:'Browser project',exact:true}).click();await page.getByLabel('Registered user ID',{exact:true}).fill(f.ids[0]);await page.getByLabel('Descriptive role',{exact:true}).selectOption('developer');await page.getByRole('button',{name:'Add member',exact:true}).click();await page.getByRole('button',{name:'Browser project',exact:true}).click();await page.getByText(f.ids[0],{exact:true}).waitFor();
 const base='docs/sdlc/reports/evidence/SP-02-2026-11-01/runs';await mkdir(base,{recursive:true});const directory=await mkdtemp(base+'/run-'+Date.now()+'-');await page.screenshot({path:directory+'/project-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));await page.screenshot({path:directory+'/project-mobile.png',fullPage:true});
 // Native keyboard activation reaches the explicit confirmation before any removal.
 const remove=page.getByRole('button',{name:'Remove member '+f.ids[0],exact:true});await remove.focus();await page.keyboard.press('Enter');await page.getByRole('button',{name:'Confirm removal',exact:true}).waitFor();assert.equal((await f.db.admin.query('SELECT active FROM workspace.membership WHERE project_id=$1 AND user_id=$2',[project,f.ids[0]])).rows[0].active,true);await page.getByRole('button',{name:'Cancel removal',exact:true}).click();
 await page.reload();await page.getByRole('button',{name:'Browser project',exact:true}).click();await page.getByText(f.ids[0],{exact:true}).waitFor();
 // A second effective manager removes the browser actor through the actual handler protocol.
 await f.operator.project(f.ids[0],project,'membership-manage',true,'0','synthetic-browser','second effective manager');await f.projects.remove(f.tokens[0],project,f.browserUser,'1','synthetic-browser-removal');
 await page.getByRole('button',{name:'Refresh projects',exact:true}).click();await page.getByText('You have no projects yet.',{exact:true}).waitFor();assert.equal(await page.getByRole('heading',{name:'Browser project',exact:true}).count(),0);assert.equal(await page.getByLabel('Registered user ID',{exact:true}).count(),0);
 await page.getByRole('button',{name:'Sign out',exact:true}).click();await page.getByRole('button',{name:'Sign in',exact:true}).waitFor();await page.reload();await page.getByRole('button',{name:'Sign in',exact:true}).waitFor();assert.equal((await context.cookies(f.origin)).some(c=>c.name==='__Host-sacw-session'),false);assert.deepEqual(errors,[]);
 await writeFile(directory+'/browser-summary.json',JSON.stringify({date:'2026-11-01',browser:browser.version(),viewportChecks:[[1280,900],[390,844]],realHttps:true,tlsBypass:false,personalProfile:false,checks:['secure HttpOnly SameSite Strict host-only session cookie','UI sign-in/create/add and native keyboard confirmation/cancel','lost committed response then reload and exact original-key reconciliation','one persisted create despite two POST requests','reload reconstructs current membership','current actor removal clears project/member controls','sign-out cookie deletion and reload denial'],pageErrors:errors},null,2)+'\n');
});
