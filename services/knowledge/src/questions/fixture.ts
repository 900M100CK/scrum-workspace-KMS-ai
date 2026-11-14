import type {Passage} from '../documents/discovery.ts';

export const configuration = 'f0990000-0000-4000-8000-000000000001';
export const model = 'sp09-synthetic-v1';
const opening = 'The observatory opens at 09:00 on weekdays.';
const conflicting = 'The observatory opens at 10:00 on weekdays.';
const uncited = 'Visitors enter through the north gate.';
const restricted = 'Private fixture: the observatory opens at 07:00 on weekdays.';
export const syntheticExcerpts = [opening, conflicting, uncited, restricted];

export function embed(question: string): number[] {
  if (/when|time|hour|schedule|observatory|open/i.test(question)) return [1, 0, 0];
  if (/gate|entrance|enter/i.test(question)) return [0, 1, 0];
  return [0, 0, 1];
}

export type Source = Passage & {source_id: string};
type Claim = {kind: 'fact' | 'synthesis'; text: string; source_ids: string[]};

export function expectedAnswer(run: string, question: string, sources: Source[]) {
  const vector = embed(question);
  const selected = sources.filter(source => vector[0] ? [opening, conflicting, restricted].includes(source.excerpt) :
    vector[1] && source.excerpt === uncited);
  if (!selected.length) return {status: 'insufficient_evidence', run_id: run, message: 'Insufficient evidence'};
  const claims: Claim[] = selected.map(source => ({kind: 'fact', text: source.excerpt, source_ids: [source.source_id]}));
  const conflict = new Set(selected.map(source => source.excerpt)).size > 1;
  if (conflict) claims.push({
    kind: 'synthesis', text: 'The sources give different opening times.',
    source_ids: selected.map(source => source.source_id),
  });
  const partial = !conflict && /ticket price/i.test(question);
  return {
    status: conflict ? 'conflict' : partial ? 'partially_answered' : 'answered',
    run_id: run, claims,
    citations: selected.map(({source_id, document_id, version_id, passage_id}) =>
      ({kind: 'document', source_id, document_id, version_id, passage_id})),
    ...(partial ? {missing_components: ['ticket price']} : {}),
  };
}
