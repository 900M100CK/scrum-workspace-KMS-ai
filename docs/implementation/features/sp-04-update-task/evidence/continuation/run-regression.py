import os,subprocess,json,concurrent.futures
from pathlib import Path
r=Path.cwd();e=r/'docs/implementation/features/sp-04-update-task/evidence/continuation'
node=r'C:\Users\MCK\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe';npm=r'C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js'
env=dict(os.environ);env['PATH']=str(Path(node).parent)+os.pathsep+env['PATH'];env['NODE_EXTRA_CA_CERTS']=str(r/'.tmp/local-https/localhost.crt')
tests=['task-state','task-assignment','task-blocker','task-mutation-storage','task-mutation-authority','task-edit','task-storage','task-authority','task-http','task-reads','task-concurrency','task-ui-controller','task-ui','task-mutation-ui-controller','task-mutation-ui','project-authority','project-outcomes','project-http','project-cursor','project-reads','membership-lifecycle','membership-removal','project-concurrency','project-ui-controller','project-ui','persistence','http','lifecycle','ui']
checks=[('runtime-regression',[node,'--test','--test-concurrency=1']+['tests/workspace/'+n+'.test.mjs' for n in tests])]+[(n.replace(':','-'),[node,npm,'run',n])for n in ['typecheck','build','context:lint','context:check','context:test','contracts:test','docs:lint','docs:test']]
def run(item):
 name,cmd=item;p=subprocess.run(cmd,cwd=r,env=env,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True,encoding='utf-8',errors='replace');(e/(name+'-regression1.log')).write_text(p.stdout,encoding='utf-8');result={'name':name,'command':cmd,'exit_code':p.returncode,'tail':p.stdout[-1600:]};(e/(name+'-regression1.json')).write_text(json.dumps(result,indent=2)+'\n');return result
with concurrent.futures.ThreadPoolExecutor(max_workers=3)as pool:
 for result in pool.map(run,checks):print(json.dumps(result),flush=True)
