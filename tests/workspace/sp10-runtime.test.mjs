import assert from 'node:assert/strict';
import {once} from 'node:events';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';

import test from 'node:test';
import {randomUUID} from 'node:crypto';
import {resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
import {freePort, service, knowledgeFaults} from './question-runtime-fixture.mjs';
import {taskFixture} from './task-fixture.mjs';
import {knowledgeFixture} from '../knowledge/knowledge-fixture.mjs';
import {configuration,model,oldBlockerNote} from '../../services/knowledge/src/questions/fixture.ts';

test('SP-10 current work on the standard service entry points', {timeout:120000},async t=>{
  const ws=await taskFixture({through:'017'});
  t.after(()=>ws.close());
  const kb=await knowledgeFixture();
  t.after(()=>kb.close());
  const received=[];
  const provider=createServer(async (req,res)=>{
    const chunks=[];
    for await(const chunk of req) chunks.push(chunk);
    const bytes=Buffer.concat(chunks);
    const input=JSON.parse(bytes);
    received.push(bytes.length);
    const {work,run_id,sources}=input;
    const citations=[];
    const claims=[];
    work.entities.forEach((entity,index)=>{
      if (work.list && entity.state!=='Blocked') return;
      const source_id='W'+(index+1);
      claims.push({kind:'fact',text:entity.state,source_ids:[source_id]});
      citations.push({kind:'operational',source_id,entity_kind:'task',entity_id:entity.id,
        observed_at:work.observed_at,observation_revision:work.observation_revision});
    });
    if (!claims.length) claims.push({kind:'fact',text:'No blocked tasks in the selected scope.',source_ids:[]});
    for (const {source_id,document_id,version_id,passage_id,excerpt} of sources) {
      claims.push({kind:'fact',text:'Historical document: '+excerpt,source_ids:[source_id]});
      citations.push({kind:'document',source_id,document_id,version_id,passage_id});
    }
    res.setHeader('content-type','application/json');
    res.end(JSON.stringify({status:'answered',run_id,claims,citations}));
  });
  provider.listen(0,'127.0.0.1');
  await once(provider,'listening');
  t.after(()=>{provider.closeAllConnections();return new Promise(done=>provider.close(done));});
  const {project,tokens,operator,ids:[owner,reader,outsider]}=ws;
  await ws.projects.add(tokens[0],project,{user_id:reader,role:'viewer'},randomUUID());
  for (const action of ['backlog-author','task-blocker','knowledge-author','sprint-create','sprint-allocate','sprint-start','sprint-complete','task-state']) {
    await operator.project(owner,project,action,true,'0','sp10-fixture','synthetic rights');
  }
  const secret=randomUUID()+randomUUID();
  const cert=resolve('.tmp/local-https/localhost.crt');
  const key=resolve('.tmp/local-https/localhost.key');
  const knowledge=await service(t,'knowledge',{SACW_KNOWLEDGE_DATABASE_URL:kb.runtimeUrl,SACW_DOCUMENT_SERVICE_KEY:secret,
    SACW_KNOWLEDGE_TLS_CERT:cert,SACW_KNOWLEDGE_TLS_KEY:key});
  const fault=await knowledgeFaults(t,knowledge.base,cert);
  const port=await freePort();
  const origin='https://localhost:'+port;
  const workspace=await service(t,'workspace',{...ws.db.runtimeEnvironment,SACW_SESSION_ORIGIN:origin,
    SACW_PROJECT_CURSOR_KEY:JSON.stringify({kid:'sp10',key:Buffer.alloc(32,10).toString('base64')}),
    SACW_DOCUMENT_SERVICE_KEY:secret,SACW_KNOWLEDGE_HTTPS_URL:fault.base,SACW_KNOWLEDGE_TLS_CA:cert,
    SACW_SP09_FIXTURE_PROVIDER_URL:'http://127.0.0.1:'+provider.address().port+'/generate'});
  const root='/projects/'+project;
  async function request(path,status,body,actor=1,extra={}) {
    const response=await fetch(workspace.base+path,{method:body?'POST':'GET',headers:{
      ...ws.headers(tokens[actor]),origin,'idempotency-key':randomUUID(),...extra,
      ...(body?{'content-type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
    const raw=await response.text();
    assert.equal(response.status,status,path+' '+raw);
    if (!raw) return;
    const value=JSON.parse(raw);
    if(status===503) assert.ok(!('claims' in value)&&!('citations' in value));
    return value;
  }
  const task=async title=>(await request(root+'/tasks',201,{type:'task',title},0)).task_id;
  const blocker=(id,status,rev)=>request('/tasks/'+id+'/blockers',201,{status,description:'Synthetic blocker',expected_revision:rev},0);
  const ask=(selector,status=200,actor=1,question='What is blocked?')=>
    request(root+'/questions',status,{scope:'current',question,current_work:selector},actor);
  const all={kind:'project',include_documents:false};
  const first=await task('Synthetic resolved task');
  const uncited=await task('Synthetic uncited task');
  await blocker(first,'open',1);
  assert.deepEqual((await request(root+'/observations/blocked-tasks',200)).entities.map(row=>row.task_id),[first]);
  await blocker(first,'resolved',2);
  const docText=oldBlockerNote;
  const doc=await request(root+'/documents',201,{title:'Old blocked note',classification:'project_shared',content:docText},0);
  await kb.admin.query("INSERT INTO knowledge.embedding_configuration VALUES($1,$2,'1',3,'cosine')",[configuration,model]);
  const connection=await kb.admin.connect();
  try{
    await connection.query('BEGIN');
    await connection.query('SET LOCAL search_path=knowledge,public,pg_catalog');
    const job=randomUUID();
    await connection.query("INSERT INTO knowledge.search_job VALUES($1,$2,$3,$4,1,1,'ready',false)",
      [job,doc.document_id,doc.current_version_id,configuration]);
    await connection.query("INSERT INTO knowledge.passage_embedding SELECT document_id,version_id,passage_id,$2,3,$3,'[1,0,0]'::public.vector FROM knowledge.passage WHERE document_id=$1",
      [doc.document_id,configuration,job]);
    await connection.query('COMMIT');
  }finally{connection.release();}
  const chosen={kind:'task',id:first,include_documents:false};
  assert.equal((await ask(chosen)).claims[0].text,'Resolved');
  assert.equal((await ask(all)).claims[0].text,'No blocked tasks in the selected scope.');
  const mixed=await ask({...chosen,include_documents:true},200,1,'At what hour can we arrive?');
  assert.equal(mixed.claims[0].text,'Resolved');
  assert.equal(mixed.claims[1].text,'Historical document: '+oldBlockerNote);
  assert.deepEqual(mixed.citations.map(item=>item.kind),['operational','document']);
  const {rows}=await kb.admin.query("SELECT manifest FROM knowledge.handoff_manifest WHERE run_id=$1",[mixed.run_id]);
  assert.equal(rows.length,2);
  assert.ok(rows.every(row=>row.manifest.evidence_set.length===2));
  assert.equal((await kb.admin.query('SELECT count(*)::int AS n FROM knowledge.provenance WHERE run_id=$1',[mixed.run_id])).rows[0].n,2);
  assert.equal((await ask(all,404,2)).code,'not_found');
  assert.equal((await ask({...chosen,id:randomUUID()},404)).code,'not_found');
  await ask({...all,id:first},400);
  await operator.global(outsider,true,'0','sp10-fixture','synthetic foreign project');
  const foreign=(await ws.projects.create(tokens[2],{name:'Foreign synthetic project'},randomUUID())).projectId;
  await operator.project(outsider,foreign,'backlog-author',true,'0','sp10-fixture','synthetic rights');
  const foreignTask=(await request('/projects/'+foreign+'/tasks',201,{type:'task',title:'Foreign synthetic Task'},2)).task_id;
  await ask({...chosen,id:foreignTask},404);
  const sprint=await request(root+'/sprints',201,{goal:'Synthetic Sprint',start_date:'2026-11-14',end_date:'2026-11-21'},0);
  await request('/sprints/'+sprint.sprint_id+'/items',200,{task_id:uncited,expected_revision:1},0);
  const sprintTask=await request('/tasks/'+uncited,200);
  await blocker(uncited,'open',sprintTask.revision);
  assert.deepEqual((await ask({kind:'sprint',id:sprint.sprint_id,include_documents:false})).citations.map(item=>item.entity_id),[uncited]);
  await request('/sprints/'+sprint.sprint_id+'/start',200,{expected_revision:2},0);
  await request('/tasks/'+uncited+'/state',200,{state:'done',expected_revision:sprintTask.revision+1},0);
  await request('/sprints/'+sprint.sprint_id+'/complete',200,{expected_revision:3},0);
  assert.deepEqual((await ask({kind:'sprint',id:sprint.sprint_id,include_documents:false})).citations.map(item=>item.entity_id),[uncited]);
  const completed=await request('/tasks/'+uncited,200);
  await request('/tasks/'+uncited+'/state',200,{state:'todo',expected_revision:completed.revision},0);
  assert.deepEqual((await ask(all)).citations.map(item=>item.entity_id),[uncited]);
  await blocker(uncited,'resolved',completed.revision+1);
  assert.equal((await ask({kind:'sprint',id:sprint.sprint_id,include_documents:false})).citations.length,0);
  const readerSession=(await ws.sessions.inspect(tokens[1])).session.sessionId;
  const auth={'x-service-key':secret,'x-actor-user-id':reader,'x-actor-session':readerSession};
  const internal={project_id:project,entity_kind:'task',entity_ids:[first]};
  assert.equal((await request('/internal/observations',200,internal,1,auth)).entities[0].blocked,false);
  await request('/internal/observations',403,internal);
  await request('/internal/observations',404,{...internal,entity_ids:[foreignTask]},1,auth);
  await request('/internal/observations',401,internal,1,{...auth,'x-actor-session':randomUUID()});
  const beforeOutage=received.length;
  await ws.db.admin.query('REVOKE SELECT ON workspace.blocker_event FROM workspace_app');
  try {
    assert.equal((await ask(chosen,503)).code,'access_unavailable');
    assert.equal(received.length,beforeOutage);
  } finally {
    await ws.db.admin.query('GRANT SELECT ON workspace.blocker_event TO workspace_app');
  }

  await t.test('Both protected boundaries stop an uncited revision and a new blocker',async()=>{
    for(const purpose of ['provider_input','answer_delivery']){
      for(const change of ['uncited','new blocker']){
        const before=received.length;
        const release=Promise.withResolvers();
        const at=fault.once((path,input)=>path.endsWith('/prepare')&&input?.purpose===purpose,async bytes=>{
          await release.promise;return bytes;
        });
        const pending=ask(all,503);
        await at;
        try{
          const id=change==='uncited'?uncited:await task('Synthetic new blocker');
          const current=await request('/tasks/'+id,200);
          await blocker(id,change==='uncited'?'resolved':'open',current.revision);
        }finally{release.resolve();}
        const rejected=await pending;
        assert.equal(received.length-before,purpose==='provider_input'?0:1);
        if(purpose==='answer_delivery')assert.deepEqual(rejected,{code:'answer_withheld',message:'Unable to provide this answer'});
      }
    }
  });

  await t.test('Edge distinguishes the original observation, refreshed state and reload',{skip:!process.env.SACW_PLAYWRIGHT_MODULE},async bt=>{
    const {chromium}=await import(process.env.SACW_PLAYWRIGHT_MODULE);
    const requireWeb=createRequire(new URL('../../apps/web/package.json',import.meta.url));
    const {createServer:createVite}=await import(pathToFileURL(requireWeb.resolve('vite')).href);
    const vite=await createVite({configFile:false,root:fileURLToPath(new URL('../../apps/web',import.meta.url)),
      server:{host:'127.0.0.1',port,strictPort:true,hmr:false,https:{cert:await readFile(cert),key:await readFile(key)},
        proxy:{'/api':{target:workspace.base,rewrite:path=>path.slice(4)}}}});
    bt.after(()=>vite.close());
    await vite.listen();
    const browser=await chromium.launch({channel:'msedge',headless:true});
    bt.after(()=>browser.close());
    for(const width of [1280,390]){
      const context=await browser.newContext({viewport:{width,height:900}});
      const cookie=ws.headers(tokens[1]).cookie;
      const separator=cookie.indexOf('=');
      await context.addCookies([{name:cookie.slice(0,separator),value:cookie.slice(separator+1),url:origin,secure:true,httpOnly:true,sameSite:'Strict'}]);
      const page=await context.newPage();
      const select=async()=>{
        await page.getByRole('button',{name:'Synthetic task project'}).click();
        await page.getByRole('button',{name:'Ask',exact:true}).click();
        await page.getByLabel('Ask mode').selectOption('work');
      };
      await page.goto(origin+'/#workspace');
      await select();
      await page.getByLabel('Work scope').selectOption('task');
      await page.getByLabel('Resource',{exact:true}).selectOption(first);
      await page.getByLabel('Question',{exact:true}).fill('Is this task blocked?');
      await page.getByRole('button',{name:'Ask question'}).click();
      await page.getByRole('button',{name:'Open source W1'}).click();
      const panel=page.getByRole('complementary',{name:'Work citation'});
      await panel.getByText('Original cited observation',{exact:true}).waitFor();
      const current=await request('/tasks/'+first,200);
      await blocker(first,current.blocked?'resolved':'open',current.revision);
      await panel.getByRole('button',{name:'Refresh current state'}).click();
      await panel.getByText((current.blocked?'Not blocked':'Blocked')+' · Revision '+(current.revision+1),{exact:true}).waitFor();
      await panel.getByText(current.blocked?'Blocked':'Resolved',{exact:true}).waitFor();
      if(process.env.SACW_TEST_EVIDENCE_DIR){
        await mkdir(process.env.SACW_TEST_EVIDENCE_DIR,{recursive:true});
        await page.screenshot({path:resolve(process.env.SACW_TEST_EVIDENCE_DIR,'current-work-'+width+'.png')});
      }
      await page.evaluate(() => {
        sessionStorage.setItem('observation_revision','9007199254740991');
        history.replaceState(null,'','?observation_revision=9007199254740991'+location.hash);
      });
      await page.reload();
      await select();
      await page.getByText(/Original cited observation unavailable/).waitFor();
      await context.close();
    }
  });
  await ws.projects.remove(tokens[0],project,reader,'1',randomUUID());
  await request('/internal/observations',404,internal,1,auth);
  await ask(chosen,404);
});
