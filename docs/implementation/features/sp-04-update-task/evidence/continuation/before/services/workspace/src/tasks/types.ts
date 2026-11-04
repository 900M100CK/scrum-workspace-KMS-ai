export interface CreateTask {type:'story'|'task'|'bug';title:string;description?:string}
export type WorkLocation={kind:'backlog';position:string}|{kind:'sprint'|'completed';sprint_id:string};
export interface Task {
 task_id:string;project_id:string;type:CreateTask['type'];title:string;description:string;
 state:'todo'|'in_progress'|'done';assignee_id:string|null;blocked:boolean;revision:number;
 work_location:WorkLocation;created_at:string;
}
export interface TaskList {items:Task[];next_cursor:string|null;backlog_revision:string}
export interface Blocker {
 event_id:string;task_id:string;status:'open'|'resolved';description:string;outcome:string|null;
 actor_id:string;recorded_at:string;sequence:number;
}
export type TaskMutationOperation='editTask'|'setTaskState'|'setAssignee'|'recordBlocker';
export type TaskMutationOutcome={status:200;body:Task;projectId:string}|{status:201;body:Blocker;projectId:string};

export interface EditTask {title?:string;description?:string;expected_revision:number}
