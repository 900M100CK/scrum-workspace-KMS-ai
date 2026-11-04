from pathlib import Path
import subprocess,json,os,tarfile,io,shutil,concurrent.futures,time,hashlib
root=Path.cwd();base=root/'docs/implementation/features/hotfix-backend-layering';e=base/'evidence/closure-2026-11-04'
ref=Path(r'C:/Users/MCK/.codex/worktrees/hotfix-backend-layering/scrum-workspace-KMS-ai')
projection=root/'.tmp'/('hf42-c01-validation-'+str(int(time.time()*1000)));projection.mkdir(parents=True,exist_ok=False)
head='dcd2d815a173f8adfd71619fcc00f84880d88636';template='3c65f5cbefa7d69a75cadd89b177e3add8b400b0'
def unpack(cwd,revision,destination):
 data=subprocess.check_output(['git','archive','--format=tar',revision],cwd=cwd)
 with tarfile.open(fileobj=io.BytesIO(data))as archive:
  for m in archive.getmembers():
   path=(destination/m.name).resolve();assert path.is_relative_to(destination.resolve()),m.name
  archive.extractall(destination,filter='data')
unpack(root,head,projection);(projection/'SDLC-Prompt-Checklist').mkdir(exist_ok=True);unpack(ref/'SDLC-Prompt-Checklist',template,projection/'SDLC-Prompt-Checklist')
paths=json.loads((e/'projection-paths.json').read_text());copied=[]
for path in paths:
 source=root/path;target=projection/path;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(source,target);copied.append(path)
assert (ref/'node_modules').is_dir()
link=projection/'node_modules';target=ref/'node_modules'
q=lambda s:"'"+str(s).replace("'","''")+"'"
p=subprocess.run(['powershell','-NoProfile','-Command','New-Item -ItemType Junction -Path '+q(link)+' -Target '+q(target)+' | Out-Null'],capture_output=True,text=True);assert p.returncode==0,p.stderr
node=r'C:\Users\MCK\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe';npm=r'C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js';env=dict(os.environ);env['PATH']=str(Path(node).parent)+os.pathsep+env['PATH']
def run(name,args):
 cmd=[node]+args;p=subprocess.run(cmd,cwd=projection,env=env,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True,encoding='utf-8',errors='replace');log='projection-attempt1-'+name+'.log';(e/log).write_text(p.stdout,encoding='utf-8');return {'name':name,'command':cmd,'exit_code':p.returncode,'log':log,'tail':p.stdout[-800:]}
items=[(n.replace(':','-'),[npm,'run',n])for n in ['context:lint','context:check','context:test','docs:lint','docs:test']]+[('metadata',['scripts/docs/docs-metadata.mjs'])]
with concurrent.futures.ThreadPoolExecutor(max_workers=4)as pool:results=list(pool.map(lambda x:run(*x),items))
result={'base_commit':head,'template_commit':template,'node':subprocess.check_output([node,'--version'],text=True).strip(),'projection':str(projection),'overlay_paths':copied,'checks':results};(e/'projection-checks-attempt1.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(results))
