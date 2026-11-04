import subprocess,os,json,sys,concurrent.futures
from pathlib import Path
r=Path(__file__).resolve().parents[5]
phase=sys.argv[1]
node=r"C:\Users\MCK\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
npm=r"C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js"
env=dict(os.environ);env["PATH"]=str(Path(node).parent)+os.pathsep+env["PATH"]
commands=["context:lint","context:check","context:test","docs:lint","docs:test"]
def run(command):
 p=subprocess.run([node,npm,"run",command],cwd=r,env=env,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True,encoding="utf-8",errors="replace")
 name=phase+"-"+command.replace(":","-")+".log"
 (Path(__file__).parent/name).write_text(p.stdout,encoding="utf-8")
 return {"command":"npm run "+command,"exit_code":p.returncode,"log":name,"tail":p.stdout[-1400:]}
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool: results=list(pool.map(run,commands))
(Path(__file__).parent/(phase+"-checks.json")).write_text(json.dumps({"node":subprocess.check_output([node,"--version"],text=True).strip(),"phase":phase,"results":results},indent=2)+"\n")
for result in results:print(json.dumps(result,ensure_ascii=True))
