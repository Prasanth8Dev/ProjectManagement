// Superseded by task-activity-timeline.tsx, which renders the richer
// TaskActivity event log (status/assignee/priority/eta changes, pause/
// block/review/complete/close, comments) plus interventions in one
// chronological timeline. Re-exported here under the old name in case
// anything still imports it.
export { TaskActivityTimeline as TaskHistory } from './task-activity-timeline';
