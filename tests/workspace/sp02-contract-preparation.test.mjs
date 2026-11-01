import test from 'node:test';
import assert from 'node:assert/strict';
import {loadContractSchemas} from '../../scripts/contract-schemas.mjs';

// Preparation only: these are the repository harness schemas, not Fastify or permission evidence.
const contract=await loadContractSchemas('workspace');
function shape(name,value,expected){const before=structuredClone(value),validate=contract.validators.get(name);assert.equal(validate(value),expected,name);assert.deepEqual(value,before,'contract probe must not repair data');}
test('SP02 preparation: CreateProject accepts descriptive inputs but rejects actor/authority/identity injection',()=>{
 shape('CreateProject',{name:'Synthetic project'},true);
 for(const value of [{},{name:''},{name:[]},{name:'P',actor_id:'forged'},{name:'P',project_id:'chosen'},{name:'P',role:'admin'},{name:'P',capabilities:['membership-manage']}])shape('CreateProject',value,false);
});
test('SP02 preparation: AddMember requires a known-ID selector shape and a descriptive contract role',()=>{
 shape('AddMember',{user_id:'synthetic-known-id',role:'viewer'},true);
 for(const value of [{user_id:'u'},{role:'developer'},{user_id:'',role:'developer'},{user_id:'u',role:'admin'},{user_id:'u',role:'developer',actor_id:'forged'},{user_id:'u',role:'developer',membership_manage:true}])shape('AddMember',value,false);
 // This shape result does not establish that the account exists or that a role grants a capability.
});
test('SP02 preparation: public Project/Member responses reject credential and grant inventories',()=>{
 const project={project_id:'p',name:'Synthetic',description:'',revision:1},member={project_id:'p',user_id:'u',role:'developer',revision:1};
 shape('Project',project,true);shape('Member',member,true);
 shape('Project',{...project,actor_id:'u'},false);shape('Member',{...member,email:'synthetic@example.invalid'},false);shape('Member',{...member,password_credential:'forged'},false);shape('Member',{...member,capabilities:['membership-manage']},false);
});
test('SP02 preparation: actual operations declare idempotency/removal revision and distinct paging parameters',()=>{
 const api=contract.api,removal=api.paths['/projects/{project_id}/members/{user_id}'].delete;
 for(const operation of [api.paths['/projects'].post,api.paths['/projects/{project_id}/members'].post,removal])assert(operation.parameters.some(p=>p.name==='Idempotency-Key'&&p.required));
 assert(removal.parameters.some(p=>p.name==='X-Expected-Revision'&&p.required));
 assert.deepEqual(api.paths['/projects'].get.parameters.map(p=>p.name),['cursor']);
 const members=api.paths['/projects/{project_id}/members'].get,limit=members.parameters.find(p=>p.name==='limit').schema;
 assert.deepEqual({minimum:limit.minimum,maximum:limit.maximum,default:limit.default},{minimum:1,maximum:100,default:50});
 assert.equal(api.paths['/projects/{project_id}'].get.operationId,'getProject');
});
test('SP02 preparation: advisory action shape excludes unknown/internal operation names',()=>{
 const value={resource_kind:'global',project_id:null,resource_id:null,document_id:null,version_id:null,allowed_operations:['createProject','listProjects']};
 shape('AllowedActions',value,true);
 for(const name of ['internalAuthorize','grantEverything','operatorRecover'])shape('AllowedActions',{...value,allowed_operations:[name]},false);
});
test('SP02 preparation: retain known schema gaps as observations, not application permission passes',()=>{
 shape('CreateProject',{name:'   '},true); // DB btrim/business validation must reject this later.
 shape('Project',{project_id:'p',name:'P',description:'',revision:9007199254740992},true);
 // JSON-schema integer does not ensure exact JavaScript-safe bigint transport; P03/P04 must choose it.
});
