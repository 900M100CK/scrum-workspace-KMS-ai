// SP05-V01 bounded runner. Dependencies, fixtures and assertions remain in their existing owners.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash,X509Certificate} from 'node:crypto';
import {spawnSync} from 'node:child_process';

const feature=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const root=path.resolve(feature,'../../../..');
const phase=process.argv[2]??'probe',executor=process.argv[3]??'Unspecified executor';
if(!['probe','controller','checks','workspace','browser','all'].includes(phase)||executor.length>100)throw Error('Use phase probe/controller/checks/workspace/browser/all and an executor label.');
process.chdir(root);
const runId='runtime-'+new Date().toISOString().replace(/[-:.]/g,'');
const out=path.join(feature,'evidence',runId);fs.mkdirSync(out,{recursive:false});
const env={...process.env,PATH:path.dirname(process.execPath)+path.delimiter+(process.env.PATH??'')};
const results=[],now=()=>new Date().toISOString();
const redact=s=>s.replace(/(__Host-sacw-session=)[A-Za-z0-9_-]+/g,'$1[redacted]').replace(/postgres(?:ql)?:\/\/[^\s'"<>]+/g,'[database-url-redacted]');
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const save=(name,value)=>fs.writeFileSync(path.join(out,name),JSON.stringify(value,null,2)+'\n');
function raw(command,args){return spawnSync(command,args,{cwd:root,env,encoding:'utf8',maxBuffer:40*1024*1024});}
function git(...args){const r=raw('git',args);if(r.status!==0)throw Error('Git source inspection failed: '+args[0]);return r.stdout.trim();}
function command(name,bin,args){
 const started=now();save('progress.json',{phase,executor,stage:name,status:'running',started,results});
 const r=raw(bin,args),log=name+'.txt';fs.writeFileSync(path.join(out,log),redact((r.stdout??'')+(r.stderr??'')));
 const result={name,command:[bin,...args],started,finished:now(),exit_code:r.status,error:r.error?.code??null,log};results.push(result);save('results.json',results);console.log(JSON.stringify(result));return result;
}
function blocked(name,reason){const result={name,status:'blocked',reason};results.push(result);save('results.json',results);console.log(JSON.stringify(result));}
const initialBrowserDirs=new Set(fs.readdirSync(path.join(feature,'evidence')).filter(n=>/^browser-\d+$/.test(n)));
let dockerReady=false,beforeResources=null,source=null;
function resources(){return Object.fromEntries([['containers',['ps','-a','--filter','name=sp01-p08-test-','--format','{{.Names}}']],['volumes',['volume','ls','--filter','name=sp01-p08-test-','--format','{{.Name}}']]].map(([kind,args])=>{const r=raw('docker',args);return [kind,r.status===0?r.stdout.trim().split(/\r?\n/).filter(Boolean).sort():null];}));}
try{
 const published=JSON.parse(fs.readFileSync(path.join(feature,'evidence/publication/staged-source.json'),'utf8'));
 const files=published.sources.map(s=>{const oid=git('rev-parse','HEAD:'+s.path),body=raw('git',['show','HEAD:'+s.path]);if(oid!==s.gitBlobOid||body.status!==0||body.stdout.replaceAll('\r\n','\n')!==fs.readFileSync(s.path,'utf8').replaceAll('\r\n','\n'))throw Error('Published source drift: '+s.path);return {...s,workingSha256:sha(s.path)};});
 source={head:git('rev-parse','HEAD'),branch:git('branch','--show-current'),headTree:git('rev-parse','HEAD^{tree}'),targetMerge:'b40a01439e9cb2f1ce51f887bf238fe3bff9dd73',targetTree:git('rev-parse','b40a014^{tree}'),files,runnerSha256:sha(fileURLToPath(import.meta.url))};save('source.json',source);
 if(Number(process.versions.node.split('.')[0])<24)throw Error('Node24 or later required.');
 const docker=command('docker-probe','docker',['info','--format','{{.ServerVersion}}']);dockerReady=docker.exit_code===0;if(dockerReady)beforeResources=resources();
 const cert=path.join(root,'.tmp/local-https/localhost.crt'),key=path.join(root,'.tmp/local-https/localhost.key');let tlsReady=false,certIdentity=null;
 if(fs.existsSync(cert)&&fs.existsSync(key)){const x=new X509Certificate(fs.readFileSync(cert));tlsReady=!!x.checkHost('localhost')&&Date.parse(x.validTo)>Date.now();certIdentity={fingerprint256:x.fingerprint256,validTo:x.validTo};env.NODE_USE_SYSTEM_CA='1';env.NODE_EXTRA_CA_CERTS=cert;}
 const installed=path.resolve(path.dirname(process.execPath),'../node_modules/playwright/index.mjs');if(!env.SACW_PLAYWRIGHT_MODULE&&fs.existsSync(installed))env.SACW_PLAYWRIGHT_MODULE=pathToFileURL(installed).href;
 const modulePath=env.SACW_PLAYWRIGHT_MODULE;let browserRunnerReady=false;
 if(modulePath){try{await import(modulePath);browserRunnerReady=true;}catch{/* Record a blocked browser gate; never install or bypass trust implicitly. */}}
 const npmCandidates=[path.resolve(path.dirname(process.execPath),'../node_modules/npm/bin/npm-cli.js'),path.join(process.env.ProgramFiles??'C:/Program Files','nodejs/node_modules/npm/bin/npm-cli.js')];
 const npm=npmCandidates.find(p=>fs.existsSync(p));
 save('environment.json',{date:now(),executor,executorIdentity:'self-reported; runner cannot authenticate another agent',node:process.version,nodeExecutable:process.execPath,dockerReady,tlsReady,certIdentity,browserRunnerReady,playwrightModule:modulePath??null,npmCli:npm??null,dependencyTreePresent:fs.existsSync(path.join(root,'node_modules')),tlsBypass:false,personalBrowserProfile:false});
 const test=(name,files)=>command(name,process.execPath,['--test','--test-concurrency=1',...files]);
 if(phase==='controller'||phase==='all'&&!dockerReady)test('controller',['tests/workspace/sprint-controller.test.mjs']);
 if(phase==='checks'||phase==='all'){
  if(!npm)blocked('root-checks','Installed npm CLI unavailable.');else for(const name of ['typecheck','build','test:foundation','test:prototype','context:lint','context:check'])command(name.replaceAll(':','-'),process.execPath,[npm,'run',name]);
  command('docs-lint',process.execPath,['scripts/docs/verify-docs.mjs']);command('metadata',process.execPath,['scripts/docs/docs-metadata.mjs','--check']);
  test('context-docs-contracts',['tests/context/context.test.mjs','tests/contracts/contract-schemas.test.mjs','tests/contracts/handoff-bytes.test.mjs','tests/docs/docs.test.mjs']);
 }
 if(phase==='workspace'||phase==='all'){
  if(!dockerReady||!tlsReady)blocked('workspace','Requires accessible Docker and trusted local HTTPS certificate/key; controller can run separately.');else test('workspace',fs.readdirSync('tests/workspace').filter(n=>n.endsWith('.test.mjs')&&!n.includes('browser')).sort().map(n=>'tests/workspace/'+n));
 }
 if(phase==='browser'||phase==='all'){
  if(!dockerReady||!tlsReady||!browserRunnerReady)blocked('browser','Requires accessible Docker, trusted local HTTPS and installed Playwright/browser runner.');else test('browser',['tests/workspace/sprint-browser.test.mjs']);
 }
 // Move only newly generated captures inside this feature's evidence area; never touch an older run.
 for(const name of fs.readdirSync(path.join(feature,'evidence')).filter(n=>/^browser-\d+$/.test(n)&&!initialBrowserDirs.has(n))){const from=path.resolve(feature,'evidence',name),to=path.resolve(out,name);if(path.dirname(from)!==path.resolve(feature,'evidence')||path.dirname(to)!==out)throw Error('Unsafe capture destination.');fs.renameSync(from,to);save('browser-capture.json',{original:from,current:to});}
 const after=dockerReady?resources():null;save('cleanup.json',{before:beforeResources,after,newContainers:after?.containers?.filter(n=>!beforeResources?.containers?.includes(n))??null,newVolumes:after?.volumes?.filter(n=>!beforeResources?.volumes?.includes(n))??null});
 if(after&&((after.containers??[]).some(n=>!beforeResources?.containers?.includes(n))||(after.volumes??[]).some(n=>!beforeResources?.volumes?.includes(n))))blocked('cleanup','New test resources remain; inspect ownership before cleanup.');
 for(const s of source.files)if(sha(s.path)!==s.workingSha256)throw Error('Source changed during execution: '+s.path);
 const required=results.filter(r=>r.name!=='docker-probe');const passed=required.every(r=>r.exit_code===0&&r.status!=='blocked');save('summary.json',{phase,runId,executor,startedSource:source.head,targetMerge:source.targetMerge,sourcePreserved:true,results,passed,interpretation:'Supplemental execution by named executor; does not prove Antigravity reproduction or independent acceptance.'});save('progress.json',{phase,executor,status:'finished',passed,results});process.exitCode=passed?0:1;
}catch(error){save('fatal.json',{message:redact(String(error.message)),results});console.error('Runtime verification could not finish; see fatal.json.');process.exitCode=1;}
console.log(JSON.stringify({evidenceDirectory:out,phase,executor,exit_code:process.exitCode??0}));
