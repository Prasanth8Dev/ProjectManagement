export const MEETING_TYPE_CONFIG = {
  STANDUP: { label: 'Stand-up', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  SPRINT_PLANNING: { label: 'Sprint Planning', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  SPRINT_REVIEW: { label: 'Sprint Review', color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  CLIENT_MEETING: { label: 'Client Meeting', color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  TECHNICAL_DISCUSSION: { label: 'Technical Discussion', color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
  RCA: { label: 'RCA', color: 'text-red-600', bgColor: 'bg-red-100' },
  GENERAL: { label: 'General', color: 'text-slate-600', bgColor: 'bg-slate-100' },
} as const;

export const MEETING_TYPE_OPTIONS = Object.entries(MEETING_TYPE_CONFIG).map(([value, cfg]) => ({
  value,
  label: cfg.label,
}));

export const ACTION_ITEM_STATUS_CONFIG = {
  OPEN: { label: 'Open', color: 'text-slate-600', bgColor: 'bg-slate-100' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  DONE: { label: 'Done', color: 'text-green-600', bgColor: 'bg-green-100' },
  CONVERTED: { label: 'Converted to Task', color: 'text-purple-600', bgColor: 'bg-purple-100' },
} as const;

export const ACTION_ITEM_STATUS_OPTIONS = Object.entries(ACTION_ITEM_STATUS_CONFIG).map(
  ([value, cfg]) => ({ value, label: cfg.label })
);
