import {createHash} from 'node:crypto';
import {invalid, isUuid} from '../documents/store.ts';
import {expectedAnswer, oldBlockerNote, type Source} from './fixture.ts';

type Entity = {kind:'task'; id:string; revision:string; state:'Blocked'|'Resolved'|'Not blocked'};
export type Work = {entities:Entity[]; observed_at:string; observation_revision:number;
  fingerprint:string; include_documents:boolean; list:boolean};

export function workInput(value: unknown): Work | undefined {
  if (value === undefined) return undefined;
  const work = value as Work;
  if (!work || !Array.isArray(work.entities) || work.entities.length>32 ||
      !/^[a-f0-9]{64}$/.test(work.fingerprint) || !Number.isSafeInteger(work.observation_revision) ||
      work.observation_revision!==Number.parseInt(work.fingerprint.slice(0,13),16)+1 ||
      typeof work.observed_at !== 'string' || !Number.isFinite(Date.parse(work.observed_at)) ||
      typeof work.include_documents !== 'boolean' || typeof work.list !== 'boolean' ||
      (!work.list && work.entities.length!==1) ||
      new Set(work.entities.map(item=>item?.id)).size!==work.entities.length ||
      work.entities.some(item=>!item || item.kind!=='task' || !isUuid(item.id) ||
        !/^[1-9][0-9]*$/.test(item.revision) || !['Blocked','Resolved','Not blocked'].includes(item.state))) throw invalid();
  const entities = work.entities.map(({kind,id,revision,state})=>({kind,id,revision,state}));
  const {observed_at,observation_revision,fingerprint,include_documents,list} = work;
  return {entities,observed_at,observation_revision,fingerprint,include_documents,list};
}

export function workDigest(value: object) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

export function workEvidence(project: string, work: Work) {
  return work.entities.map((item,index)=>({
    kind:'operational' as const, source_id:'W'+(index+1), project_id:project, entity_kind:item.kind,
    entity_id:item.id, entity_revision:item.revision, observation_revision:work.observation_revision,
    observed_at:work.observed_at, entity_digest:workDigest(item),
  }));
}

export function expectedWorkAnswer(run: string, question: string, sources: Source[], work: Work) {
  const notes = sources.filter(source=>source.excerpt===oldBlockerNote);
  const doc = work.include_documents ? expectedAnswer(run,question,sources) : undefined;
  const supportedDoc = doc && 'claims' in doc ? doc : undefined;
  const operational = workEvidence('',work).filter((_,index)=>!work.list || work.entities[index]!.state==='Blocked');
  const claims: {kind:string;text:string;source_ids:string[]}[] = operational.map(entry=>({
    kind:'fact',text:work.entities.find(item=>item.id===entry.entity_id)!.state,source_ids:[entry.source_id],
  }));
  const citations = operational.map(({source_id,entity_kind,entity_id,observed_at,observation_revision})=>
    ({kind:'operational',source_id,entity_kind,entity_id,observed_at,observation_revision}));
  if (!claims.length) claims.push({kind:'fact',text:'No blocked tasks in the selected scope.',source_ids:[]});
  const noteClaims = notes.map(source=>({kind:'fact',text:'Historical document: '+source.excerpt,source_ids:[source.source_id]}));
  const noteCitations = notes.map(({source_id,document_id,version_id,passage_id})=>
    ({kind:'document',source_id,document_id,version_id,passage_id}));
  const status = doc?.status==='conflict' ? 'conflict' :
    work.include_documents && citations.length && ((!notes.length && !supportedDoc) || supportedDoc?.missing_components) ? 'partially_answered' : 'answered';
  return {status,run_id:run,claims:[...claims,...noteClaims,...(supportedDoc?.claims??[]).map(claim=>({...claim,text:'Document evidence: '+claim.text}))],citations:[...citations,...noteCitations,...(supportedDoc?.citations??[])],
    ...(status==='partially_answered' ? {missing_components:supportedDoc?.missing_components??['document evidence']} : {})};
}
