export const TASK_PRIORITY_CONFIG = {
  LOW: {
    label: 'Low',
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    dotColor: 'bg-slate-400',
  },
  MEDIUM: {
    label: 'Medium',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    dotColor: 'bg-blue-400',
  },
  HIGH: {
    label: 'High',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    dotColor: 'bg-orange-500',
  },
  URGENT: {
    label: 'Urgent',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    dotColor: 'bg-red-500',
  },
} as const;

export const TASK_PRIORITY_OPTIONS = Object.entries(TASK_PRIORITY_CONFIG).map(([value, cfg]) => ({
  value,
  label: cfg.label,
}));

export const PROJECT_PRIORITY_CONFIG = {
  LOW: { label: 'Low', color: 'text-slate-600', bgColor: 'bg-slate-100', dotColor: 'bg-slate-400' },
  MEDIUM: { label: 'Medium', color: 'text-blue-600', bgColor: 'bg-blue-100', dotColor: 'bg-blue-400' },
  HIGH: { label: 'High', color: 'text-orange-600', bgColor: 'bg-orange-100', dotColor: 'bg-orange-500' },
  CRITICAL: { label: 'Critical', color: 'text-red-600', bgColor: 'bg-red-100', dotColor: 'bg-red-500' },
} as const;
