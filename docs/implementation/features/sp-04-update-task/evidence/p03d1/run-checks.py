import os,subprocess,json,concurrent.futures
from pathlib import Path
r=Path(__file__).resolve().parents[6];e=Path(__file__).parent
node=r"C:\Users\MCK\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
npm=r"C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js"
env=dict(os.environ);env["PATH"]=str(Path(node).parent)+os.pathsep+env["PATH"]
checks=[("regression",[node,"--test","--test-concurrency=1","tests/workspace/task-edit.test.mjs","tests/workspace/task-mutation-authority.test.mjs","tests/workspace/task-http.test.mjs","tests/workspace/task-reads.test.mjs","tests/workspace/task-concurrency.test.mjs"]),("typecheck",[node,npm,"run","typecheck","--workspace","@sacw/workspace"])]+[(x.replace(":","-"),[node,npm,"run",x])for x in ["context:check","context:test","contracts:test","docs:lint","docs:test"]]
def run(item):
 name,cmd=item;p=subprocess.run(cmd,cwd=r,env=env,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True,encoding="utf-8",errors="replace");(e/(name+".log")).write_text(p.stdout);return {"name":name,"command":cmd[1:],"exit_code":p.returncode,"tail":p.stdout[-1300:]}
with concurrent.futures.ThreadPoolExecutor(max_workers=5)as pool:results=list(pool.map(run,checks))
(e/"checks.json").write_text(json.dumps({"node":"v24.22.1","results":results},indent=2)+"\n")
for result in results:print(json.dumps(result))
