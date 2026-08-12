import type { TaskStatus } from '@/types/task.types';

export const TASK_STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; color: string; bgColor: string; icon: string; dotColor: string }
> = {
  BACKLOG: { label: 'Backlog', color: 'text-slate-600', bgColor: 'bg-slate-100', icon: '○', dotColor: 'bg-slate-400' },
  TODO: { label: 'Todo', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: '◎', dotColor: 'bg-blue-400' },
  IN_PROGRESS: {
    label: 'In Progress',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    icon: '◑',
    dotColor: 'bg-yellow-400',
  },
  IN_REVIEW: { label: 'In Review', color: 'text-purple-600', bgColor: 'bg-purple-100', icon: '◐', dotColor: 'bg-purple-400' },
  TESTING: { label: 'Testing', color: 'text-orange-600', bgColor: 'bg-orange-100', icon: '◕', dotColor: 'bg-orange-400' },
  DONE: { label: 'Done', color: 'text-green-600', bgColor: 'bg-green-100', icon: '●', dotColor: 'bg-green-500' },
  CANCELLED: { label: 'Cancelled', color: 'text-red-600', bgColor: 'bg-red-100', icon: '✕', dotColor: 'bg-red-400' },
};

export const KANBAN_COLUMNS: TaskStatus[] = [
  'BACKLOG',
  'TODO',
  'IN_PROGRESS',
  'IN_REVIEW',
  'TESTING',
  'DONE',
];

export const TASK_STATUS_OPTIONS = Object.entries(TASK_STATUS_CONFIG).map(([value, cfg]) => ({
  value,
  label: cfg.label,
}));
