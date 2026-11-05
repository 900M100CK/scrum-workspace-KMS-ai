import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {sessionFixture} from './fixture.mjs';
test('SP05 additive011 empty reverse/reapply and typed receipts',{timeout:180000},async t=>{
 const f=await sessionFixture({through:'011'});t.after(()=>f.close());
 const valid={sprint_id:'11111111-1111-4111-8111-111111111111',project_id:'22222222-2222-4222-8222-222222222222',goal:'Synthetic goal',start_date:'2026-11-01',end_date:'2026-11-15',state:'planned',revision:1,created_at:'2026-11-05T01:00:00.000Z',started_at:null,completed_at:null};
 assert.equal((await f.admin.query('SELECT workspace.valid_sprint_snapshot($1,$2) valid',[valid,valid.sprint_id])).rows[0].valid,true);
 for(const v of [null,{}, {...valid,revision:null},{...valid,started_at:'infinity'},{...valid,extra:1},{...valid,end_date:'2026-10-01'}])assert.equal((await f.admin.query('SELECT workspace.valid_sprint_snapshot($1,$2) valid',[v,valid.sprint_id])).rows[0].valid,false);
 for(const field of Object.keys(valid)){const value={...valid};delete value[field];assert.equal((await f.admin.query('SELECT workspace.valid_sprint_snapshot($1,$2) valid',[value,valid.sprint_id])).rows[0].valid,false,'missing '+field);}
 assert.equal((await f.admin.query('SELECT workspace.valid_sprint_snapshot(NULL::jsonb,$1) valid',[valid.sprint_id])).rows[0].valid,false);
 const completion={sprint:valid,retained_done_count:0,returned_unfinished_count:0};
 for(const value of [null,{...completion,retained_done_count:-1},{...completion,returned_unfinished_count:9007199254740992},{...completion,extra:1}])assert.equal((await f.admin.query("SELECT workspace.valid_sprint_receipt($1,$2,'completeSprint',200) valid",[value,valid.sprint_id])).rows[0].valid,false);
 const down=await readFile('services/workspace/migrations/011-sprint-lifecycle.down.sql','utf8'),up=await readFile('services/workspace/migrations/011-sprint-lifecycle.up.sql','utf8');
 for(const sql of [down,up]){await f.admin.query('BEGIN');try{await f.admin.query('SET LOCAL ROLE workspace_owner');await f.admin.query(sql);await f.admin.query('COMMIT');}catch(e){await f.admin.query('ROLLBACK');throw e;}}
 assert.equal((await f.admin.query("SELECT count(*)::int n FROM information_schema.columns WHERE table_schema='workspace' AND table_name='sprint' AND column_name IN ('created_at','started_at','completed_at')")).rows[0].n,3);
});
