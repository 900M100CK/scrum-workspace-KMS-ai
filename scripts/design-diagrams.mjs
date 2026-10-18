import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { DOMParser } from '@xmldom/xmldom';
import ELK from 'elkjs/lib/elk.bundled.js';

export const modelPath = 'docs/sdlc/diagrams/design-models.json';
const esc = x => String(x).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const q = x => String(x).replaceAll('"', "'").replaceAll('\n','<br/>');
const plain = x => String(x).replaceAll('\n',' / ');
const elk = new ELK();
const wrap = (s,n=32) => q(s.replace(new RegExp('(.{1,'+n+'})(?:\\s+|$)','g'),'$1\n').trim());
function midpoint(route) { const lengths=route.slice(1).map((p,i)=>Math.hypot(p.x-route[i].x,p.y-route[i].y)); let remain=lengths.reduce((a,b)=>a+b,0)/2; for(let i=0;i<lengths.length;i++){if(remain<=lengths[i]) {const t=lengths[i]?remain/lengths[i]:0;return {x:route[i].x+t*(route[i+1].x-route[i].x),y:route[i].y+t*(route[i+1].y-route[i].y)};}remain-=lengths[i];} return route[0]; }
export async function loadDesignModels(root) { return JSON.parse(await readFile(resolve(root,modelPath),'utf8')).diagrams; }

export async function renderDesign(d) {
  let body='', cells=['<mxCell id="0"/>','<mxCell id="1" parent="0"/>'];
  let width=1800,height=1300;
  const vertex=(id,label,x,y,w,h,style='rounded=1;fillColor=#dae8fc;strokeColor=#6c8ebf;',parent='1')=>cells.push(`<mxCell id="${id}" value="${esc(label)}" vertex="1" parent="${parent}" style="${style}whiteSpace=wrap;html=1;fontSize=16;spacing=12;"><mxGeometry x="${x}" y="${y}" width="${w}" height="${h}" as="geometry"/></mxCell>`);
  const edge=(id,from,to,label,points=[],style='endArrow=block;',terminals='')=>cells.push(`<mxCell id="${id}"${from?` source="${from}" target="${to}"`:''} value="${esc(label)}" edge="1" parent="1" style="edgeStyle=none;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;fontSize=14;labelBackgroundColor=#ffffff;${style}"><mxGeometry relative="1" as="geometry">${terminals}<Array as="points">${points.map(p=>`<mxPoint x="${p.x}" y="${p.y}"/>`).join('')}</Array></mxGeometry></mxCell>`);
  if(d.notation==='sequence') {
    width=d.participants.length*410+100;
    const xs=new Map(d.participants.map((p,i)=>[p.id,200+i*410]));
    const events=[];let y=400;const frames=[];const stack=[];
    body='sequenceDiagram\n';
    for(const p of d.participants)body+=`    participant ${p.id} as ${q(p.label)}\n`;
    for(const [i,s]of d.steps.entries()){
      if(s.type==='alt'||s.type==='opt'||s.type==='loop'){
        body+=`    ${s.type} ${plain(s.label).replaceAll(';', ',')}\n`;stack.push({id:'frame-'+i,y,label:s.type+' ['+s.label+']',depth:stack.length});events.push({type:'branch',y,label:s.type+' ['+s.label+']'});y+=115;
      }else if(s.type==='else') {body+=`    else ${plain(s.label).replaceAll(';', ',')}\n`;events.push({type:'branch',y,label:'else ['+s.label+']'});y+=115;}
      else if(s.type==='end'){body+='    end\n';const f=stack.pop();assert(f,'Unmatched frame end');f.h=y-f.y+20;frames.push(f);y+=45;}
      else if(s.type==='note'){
        body+=`    Note over ${d.participants[0].id},${d.participants.at(-1).id}: ${q(s.label).replaceAll(';', ',')}\n`;events.push({type:'note',y,label:s.label});y+=Math.max(130,Math.ceil(s.label.length/120)*24+75);
      }else{
        assert(xs.has(s.from)&&xs.has(s.to),'Unknown sequence participant');
        body+=`    ${s.from}${s.type==='return'?'-->>':'->>'}${s.to}: ${q(s.label).replaceAll(';', ',')}\n`;
        events.push({...s,response:s.type==='return',type:'message',id:'msg-'+i,y});y+=s.from===s.to?120:100;
      }
    }
    assert.equal(stack.length,0,'Unclosed sequence frame');height=y+190;
    frames.sort((a,b)=>a.depth-b.depth).forEach(f=>vertex(f.id,'',55+f.depth*12,f.y-20,width-110-f.depth*24,f.h,'rounded=0;fillColor=none;strokeColor=#64748b;'));
    for(const p of d.participants){const x=xs.get(p.id);vertex(p.id,q(p.label),x-150,220,300,95);edge('life-'+p.id,null,null,'',[],'endArrow=none;dashed=1;strokeColor=#94a3b8;',`<mxPoint x="${x}" y="315" as="sourcePoint"/><mxPoint x="${x}" y="${y}" as="targetPoint"/>`);}
    for(const [i,s]of events.entries()){
      if(s.type==='note')vertex('note-'+i,q(s.label),85,s.y,width-170,70,'shape=note;fillColor=#fff2cc;strokeColor=#d6b656;');
      else if(s.type==='branch')vertex('branch-'+i,q(s.label),65,s.y,width-130,48,'text;fillColor=#f1f5f9;align=left;');
      else {const x1=xs.get(s.from),x2=xs.get(s.to);const self=x1===x2;
        const points=self?[{x:x1+95,y:s.y},{x:x1+95,y:s.y+45}]:[];
        const wrapped=s.label.replace(/(.{1,78})(?:\s+|$)/g,'$1\n').trim();
        edge(s.id,null,null,q(wrapped),points,`endArrow=${s.response?'open':'block'};${s.response?'dashed=1;':''}`,`<mxPoint x="${x1}" y="${s.y}" as="sourcePoint"/><mxPoint x="${x2}" y="${s.y+(self?45:0)}" as="targetPoint"/><mxPoint as="offset" x="0" y="${self?-48:-30}"/>`);
      }
    }
  } else {
    const nodes=d.nodes.map(n=>({...n,label:n.label??n.id}));
    if(d.notation==='erd'){
      body='erDiagram\n';
      for(const n of nodes){body+=`    ${n.id} {\n`;for(const f of n.fields)body+=`        ${f}\n`;body+='    }\n';n.label=n.id+'<br/>'+n.fields.map(esc).join('<br/>');}
      for(const e of d.edges)body+=`    ${e.from} ${e.card??'||--o{'} ${e.to} : "${q(e.label)}"\n`;
    }else if(d.notation==='state'){
      body='stateDiagram-v2\n    direction LR\n';
      for(const n of nodes)body+=`    state "${q(n.label)}" as ${n.id}\n`;
      for(const e of d.edges)body+=`    ${e.from} --> ${e.to}: ${plain(e.label)}\n`;
    }else{
      body='flowchart LR\n';
      for(const g of d.groups??[]){body+=`    subgraph ${g.id}["${q(g.label)}"]\n`;for(const n of nodes.filter(n=>n.group===g.id))body+=`        ${n.id}["${q(n.label)}"]\n`;body+='    end\n';}
      for(const n of nodes.filter(n=>!n.group))body+=`    ${n.id}["${q(n.label)}"]\n`;
      for(const e of d.edges)body+=`    ${e.from} -->|"${q(e.label)}"| ${e.to}\n`;
    }
    if(!nodes.every(n=>n.x!==undefined)){
      const layout=await elk.layout({id:'root',layoutOptions:{'elk.algorithm':'layered','elk.direction':'DOWN','elk.edgeRouting':'ORTHOGONAL','elk.padding':'[top=240,left=70,bottom=80,right=70]','elk.spacing.nodeNode':'130','elk.layered.spacing.nodeNodeBetweenLayers':'170','elk.spacing.edgeNode':'40'},children:nodes.map(n=>({id:n.id,width:380,height:d.notation==='erd'?75+n.fields.length*27:130})),edges:d.edges.map((e,i)=>({id:'e'+i,sources:[e.from],targets:[e.to],labels:[{text:e.label,width:Math.min(400,e.label.length*8),height:40}]}))});
      width=layout.width;height=layout.height+190;
      for(const n of nodes)Object.assign(n,layout.children.find(p=>p.id===n.id));
      for(const [i,e]of d.edges.entries()){
        const section=layout.edges[i].sections[0];e._route=section;e._label=layout.edges[i].labels[0];
      }
    }else {width=d.width??1900;height=d.height??1500;}
    for(const g of d.groups??[])vertex(g.id,g.label,g.x,g.y,g.w,g.h,'swimlane;startSize=45;container=1;pointerEvents=0;fillColor=none;dashed=1;strokeColor=#64748b;');
    for(const n of nodes){
      const label=d.notation==='erd'?n.label:q(n.label);
      const group=(d.groups??[]).find(g=>g.id===n.group);
      vertex(n.id,label,n.x-(group?.x??0),n.y-(group?.y??0),n.width??n.w??360,n.height??n.h??130,`rounded=${d.notation==='erd'?0:1};fillColor=${n.color??'#dae8fc'};strokeColor=#64748b;${d.notation==='erd'?'align=left;':''}`,group?.id??'1');
    }
    const byId=new Map(nodes.map(n=>[n.id,n]));
    for(const [i,e]of d.edges.entries()){
      assert(byId.has(e.from)&&byId.has(e.to),'Unknown graph endpoint');
      const card=e.card??'||--o{';
      const ends=card.split(/--|\.\./);
      const arrows={'||':'ERmandOne','o|':'ERzeroToOne','|o':'ERzeroToOne','o{':'ERzeroToMany','|{':'ERoneToMany'};
      let style=d.notation==='erd'?`startArrow=${arrows[ends[0]]};endArrow=${arrows[ends[1]]};startFill=0;endFill=0;${card.includes('..')?'dashed=1;':''}`:'endArrow=block;';
      if(e.dashed)style+='dashed=1;';
      let points=e.points??[];
      if(e._route){const a=byId.get(e.from),b=byId.get(e.to),r=e._route;
        points=r.bendPoints??[];style+=`exitX=${(r.startPoint.x-a.x)/a.width};exitY=${(r.startPoint.y-a.y)/a.height};entryX=${(r.endPoint.x-b.x)/b.width};entryY=${(r.endPoint.y-b.y)/b.height};exitPerimeter=0;entryPerimeter=0;`;
      }else style+='edgeStyle=orthogonalEdgeStyle;';
      style+=e.pins??'';
      let offset='';
      if(e._route && e._label){const r=e._route,l=e._label,mid=midpoint([r.startPoint,...(r.bendPoints??[]),r.endPoint]);offset=`<mxPoint as="offset" x="${l.x+l.width/2-mid.x}" y="${l.y+l.height/2-mid.y}"/>`;}
      else offset=`<mxPoint as="offset" x="${e.labelOffset?.x??0}" y="${e.labelOffset?.y??-22}"/>`;
      edge('e'+i,e.from,e.to,wrap(e.label,d.notation==='erd'?48:30),points,style,offset);
    }
  }
  vertex('diagram-title',d.id+' v0.1 Draft',30,15,width-60,105,'text;align=left;fontStyle=1;');
  vertex('diagram-scope',q(d.scope+'\n'+d.legend),30,125,width-60,75,'text;align=left;');
  return {mmd:`%% Trace: ${d.trace}\n%% Scope: ${plain(d.scope)}\n%% Legend: ${plain(d.legend)}\n${body}`,drawio:`<mxfile><diagram id="${d.id}" name="${esc(d.title)}"><mxGraphModel page="0" pageWidth="${width}" pageHeight="${height}"><root>${cells.join('\n')}</root></mxGraphModel></diagram></mxfile>\n`};
}

function withoutHeader(s){return s.replaceAll('\r\n','\n').replace(/^%% (?:Origin:|Sources:|DGM-\S+ v[\d.]+ Draft)[^\n]*\n?/gm,'');}
function nativeSignature(text){
  const errors=[];const xml=new DOMParser({onError:(_,m)=>errors.push(m)}).parseFromString(text,'text/xml');assert.equal(errors.length,0,'Invalid native XML');
  const cells=[...xml.getElementsByTagName('mxCell')];assert.equal(new Set(cells.map(c=>c.getAttribute('id'))).size,cells.length,'Duplicate native IDs');
  // Geometry is included: the reviewed route is reproducible, not silently drifted.
  return cells.filter(c=>c.getAttribute('id')!=='diagram-title').map(c=>c.toString());
}
export async function verifyDesignPair(root,artifact,parseSyntax){
  const models=await loadDesignModels(root),model=models.find(d=>d.id===artifact.id);assert(model,'Missing design model');
  const source=await readFile(resolve(root,artifact.path),'utf8'),native=await readFile(resolve(root,artifact.drawio),'utf8');
  return verifyDesignContent(model,source,native,parseSyntax);
}
export async function verifyDesignContent(model,source,native,parseSyntax) {
  const artifact=model;
  const expected=await renderDesign(structuredClone(model));
  await parseSyntax(source);
  assert.equal(withoutHeader(source),expected.mmd,'Design Mermaid drift: '+artifact.id);
  assert.deepEqual(nativeSignature(native),nativeSignature(expected.drawio),'Design native semantic/route drift: '+artifact.id);
  return {nodes:(native.match(/vertex="1"/g)??[]).length-1,edges:(native.match(/edge="1"/g)??[]).length};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
  const models=await loadDesignModels(root);
  for(const d of models){const result=await renderDesign(structuredClone(d));const base=resolve(root,d.path);await mkdir(dirname(base),{recursive:true});await writeFile(base+'.mmd',result.mmd);await writeFile(base+'.drawio',result.drawio);}
  const {syncMetadata}=await import('./docs-metadata.mjs');await syncMetadata(root);
  console.log(`Generated ${models.length} design pairs; inspect native exports before acceptance.`);
}
