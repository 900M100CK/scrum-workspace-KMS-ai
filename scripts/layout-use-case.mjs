import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseMermaid } from './verify-docs.mjs';
import { syncMetadata } from './docs-metadata.mjs';

// Route actor inheritance outside the system and audit includes in a dedicated
// right-hand lane. Node positions are explicit, so changes require render review.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const base = resolve(root, 'docs/sdlc/diagrams/use-case/use-case-diagram');
const graph = await parseMermaid(await readFile(base + '.mmd', 'utf8'), {kind:'use-case'});
const esc = s => s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const cells = ['<mxCell id="0"/>','<mxCell id="1" parent="0"/>'];
const pos = new Map();
function node(id,label,x,y,w,h,style,parent='1') {
  cells.push(`<mxCell id="${id}" value="${esc(label)}" vertex="1" parent="${parent}" style="${style}whiteSpace=wrap;html=1;fontSize=18;"><mxGeometry x="${x}" y="${y}" width="${w}" height="${h}" as="geometry"/></mxCell>`);
  pos.set(id,{x:x+(parent==='sys-boundary'?1050:0),y:y+(parent==='sys-boundary'?180:0),w,h});
}
node('diagram-title','DGM-UC-01',60,15,2440,140,'text;align=left;');
node('sys-boundary','Scrum Workspace + AI Project KMS — goal overview; conditional branch audit stays in UC text',1050,180,1050,2940,'swimlane;startSize=65;dashed=1;fillColor=#f8fbff;strokeColor=#6c8ebf;');
const order=['uc01','uc02','uc03','uc04','uc05','uc06','uc07','uc08','uc09','uc10','uc12','uc13'];
const actorRows={actor_user:0,actor_proj_admin:1,actor_po:2,actor_work:3,actor_sprint_mgr:4,actor_author:5,actor_access_mgr:5.5,actor_lifecycle:6.5,actor_member:7.7,actor_inspector:11};
for(const n of graph.nodes){
  if(n.id.startsWith('uc')){
    const audit=n.id==='uc11';
    node(n.id,n.label,audit?690:40,audit?2750:130+order.indexOf(n.id)*220,audit?310:440,100,'ellipse;fillColor='+(audit?'#f8cecc':'#dae8fc')+';strokeColor=#6c8ebf;','sys-boundary');
  }else{
    const support=['actor_identity','actor_ai','actor_embed'].includes(n.id);
    const row=support?({actor_identity:0,actor_ai:8.5,actor_embed:10}[n.id]):actorRows[n.id];
    node(n.id.replaceAll('_','-'),n.label,support?2400:720,300+row*220,60,70,'shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;labelWidth=230;fillColor='+(support?'#fff2cc':'#dae8fc')+';');
  }
}
let inheritance=0,association=0;
for(const e of graph.edges){
  const src=e.source.replaceAll('_','-'),dst=e.target.replaceAll('_','-'),a=pos.get(src),b=pos.get(dst);
  let route,style,label='';
  if(e.relation==='generalization'){
    const lane=100+(inheritance++)*48;
    route=[[a.x,a.y+25],[lane,a.y+25],[lane,b.y+25],[b.x,b.y+25]];
    style='endArrow=block;endFill=0;';
  }else if(e.relation==='include'){
    const lane=1650;
    route=[[a.x+a.w,a.y+a.h/2],[lane,a.y+a.h/2],[lane,b.y+b.h/2],[b.x,b.y+b.h/2]];
    style='endArrow=open;dashed=1;';label='«include»';
  }else{
    const support=dst.startsWith('actor-');
    if(support){const lane=2180+(association++%5)*28;route=[[a.x+a.w,a.y+a.h/2],[lane,a.y+a.h/2],[lane,b.y+25],[b.x,b.y+25]];}
    else {const lane=850+(association++%6)*25;route=[[a.x+a.w,a.y+25],[lane,a.y+25],[lane,b.y+b.h/2],[b.x,b.y+b.h/2]];}
    style='endArrow=none;';
  }
  // Explicit terminals and bends avoid automatic routes through other nodes.
  const [start,...rest]=route,end=rest.pop();
  const points=rest.map(([x,y])=>`<mxPoint x="${x}" y="${y}"/>`).join('');
  const sx=(start[0]-a.x)/a.w,sy=(start[1]-a.y)/a.h,tx=(end[0]-b.x)/b.w,ty=(end[1]-b.y)/b.h;
  let offset='';
  if(label){
    const lengths=route.slice(1).map((p,i)=>Math.hypot(p[0]-route[i][0],p[1]-route[i][1]));
    let remaining=lengths.reduce((x,y)=>x+y,0)/2;
    for(let i=0;i<lengths.length;i++){
      if(remaining<=lengths[i]){
        const t=remaining/lengths[i],mx=route[i][0]+t*(route[i+1][0]-route[i][0]),my=route[i][1]+t*(route[i+1][1]-route[i][1]);
        offset=`<mxPoint as="offset" x="${1590-mx}" y="${a.y+25-my}"/>`;break;
      }
      remaining-=lengths[i];
    }
  }
  const edgeId = e.relation==='generalization' && dst==='actor-user' ? 'gen-user'
    : e.relation==='association' && src==='actor-user' && dst==='uc01' ? 'assoc-user-uc01' : `${e.relation}-${src}-${dst}`;
  cells.push(`<mxCell id="${edgeId}" source="${src}" target="${dst}" value="${label}" edge="1" parent="1" style="edgeStyle=none;rounded=0;${style}html=1;fontSize=16;labelBackgroundColor=#ffffff;exitX=${sx};exitY=${sy};entryX=${tx};entryY=${ty};exitPerimeter=0;entryPerimeter=0;"><mxGeometry relative="1" as="geometry">${offset}<Array as="points">${points}</Array></mxGeometry></mxCell>`);
}
await writeFile(base+'.drawio',`<mxfile><diagram id="DGM-UC-01" name="Use cases"><mxGraphModel page="0"><root>${cells.join('\n')}</root></mxGraphModel></diagram></mxfile>\n`);
await syncMetadata(root);
console.log('Use-case layout rebuilt; render review required.');
