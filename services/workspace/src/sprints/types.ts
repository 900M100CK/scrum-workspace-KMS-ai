export interface Sprint {sprint_id:string;project_id:string;goal:string;start_date:string;end_date:string;state:'planned'|'active'|'completed';revision:number;created_at:string|null;started_at:string|null;completed_at:string|null}
export interface CreateSprint {goal:string;start_date:string;end_date:string}
export interface Allocation {task_id:string;expected_revision:number}
export interface ExpectedRevision {expected_revision:number}
export interface Reorder {task_ids:string[];expected_revision:string}
export interface SprintCompletion {sprint:Sprint;retained_done_count:number;returned_unfinished_count:number}
export interface ReorderResult {project_id:string;backlog_revision:string}
export type SprintOperation='createSprint'|'allocateTask'|'startSprint'|'completeSprint'|'reorderBacklog';
export type SprintBody=Sprint|SprintCompletion|ReorderResult;
export interface SprintOutcome {status:200|201;body:SprintBody;projectId:string}
