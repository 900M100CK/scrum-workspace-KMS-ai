import {createInterface} from 'node:readline';
import {randomUUID} from 'node:crypto';
import {projectUiFixture} from './project-ui-fixture.mjs';
// Interactive synthetic browser fixture only; never connects to the development database.
const f=await projectUiFixture();let closing=false;
const input=createInterface({input:process.stdin});
async function close(){if(closing)return;closing=true;clearTimeout(deadline);input.close();await f.close();}
const deadline=setTimeout(()=>{void close();},15*60*1000);
console.log(JSON.stringify({origin:f.origin,username:f.username,member:f.ids[0],scope:'disposable synthetic fixture; password is the constant in project-ui-fixture.mjs'}));
input.on('line',async command=>{
 try{
  if(command==='stop'){await close();return;}
  const rows=(await f.db.admin.query('SELECT project_id,name FROM workspace.project WHERE created_by=$1',[f.browserUser])).rows;
  if(command==='state')console.log(JSON.stringify({projects:rows}));
  else if(command==='remove'){
   if(rows.length!==1)throw Error('Expected exactly one synthetic browser-created project');const project=rows[0].project_id;
   await f.operator.project(f.ids[0],project,'membership-manage',true,'0','synthetic-browser','second manager for removal fixture');
   await f.projects.remove(f.tokens[0],project,f.browserUser,'1',randomUUID(),'synthetic-browser-removal');console.log('Synthetic browser membership removed by the second effective manager');
  }
 }catch{console.log('Synthetic fixture command failed; inspect fixture state before retrying');}
});
process.once('SIGINT',()=>{void close();});process.once('SIGTERM',()=>{void close();});
