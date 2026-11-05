export const SPRINT_ACTIONS={createSprint:'sprint-create',allocateTask:'sprint-allocate',startSprint:'sprint-start',completeSprint:'sprint-complete',reorderBacklog:'backlog-order'} as const;
export type SprintAction=typeof SPRINT_ACTIONS[keyof typeof SPRINT_ACTIONS];
