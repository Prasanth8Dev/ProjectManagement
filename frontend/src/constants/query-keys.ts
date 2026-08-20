export const QUERY_KEYS = {
  dashboard: {
    stats: ['dashboard', 'stats'] as const,
    charts: ['dashboard', 'charts'] as const,
    todayTasks: ['dashboard', 'today-tasks'] as const,
    upcoming: ['dashboard', 'upcoming'] as const,
    recentActivity: ['dashboard', 'recent-activity'] as const,
  },
  projects: {
    all: ['projects'] as const,
    lists: () => [...QUERY_KEYS.projects.all, 'list'] as const,
    list: (params?: object) => [...QUERY_KEYS.projects.lists(), params] as const,
    details: () => [...QUERY_KEYS.projects.all, 'detail'] as const,
    detail: (id: string) => [...QUERY_KEYS.projects.details(), id] as const,
    stats: (id: string) => [...QUERY_KEYS.projects.detail(id), 'stats'] as const,
    members: (id: string) => [...QUERY_KEYS.projects.detail(id), 'members'] as const,
    activity: (id: string) => [...QUERY_KEYS.projects.detail(id), 'activity'] as const,
  },
  tasks: {
    all: ['tasks'] as const,
    lists: () => [...QUERY_KEYS.tasks.all, 'list'] as const,
    list: (params?: object) => [...QUERY_KEYS.tasks.lists(), params] as const,
    details: () => [...QUERY_KEYS.tasks.all, 'detail'] as const,
    detail: (id: string) => [...QUERY_KEYS.tasks.details(), id] as const,
    history: (id: string) => [...QUERY_KEYS.tasks.detail(id), 'history'] as const,
    subtasks: (id: string) => [...QUERY_KEYS.tasks.detail(id), 'subtasks'] as const,
    checklist: (id: string) => [...QUERY_KEYS.tasks.detail(id), 'checklist'] as const,
    comments: (id: string) => [...QUERY_KEYS.tasks.detail(id), 'comments'] as const,
    attachments: (id: string) => [...QUERY_KEYS.tasks.detail(id), 'attachments'] as const,
  },
  teams: {
    all: ['teams'] as const,
    list: (params?: object) => [...QUERY_KEYS.teams.all, 'list', params] as const,
    detail: (id: string) => [...QUERY_KEYS.teams.all, id] as const,
  },
  users: {
    all: ['users'] as const,
    list: (params?: object) => [...QUERY_KEYS.users.all, 'list', params] as const,
    detail: (id: string) => [...QUERY_KEYS.users.all, id] as const,
  },
  kanban: {
    board: (projectId: string) => ['kanban', projectId] as const,
  },
  activity: {
    all: ['activity'] as const,
    list: (params?: object) => [...QUERY_KEYS.activity.all, params] as const,
  },
  dailyUpdates: {
    all: ['daily-updates'] as const,
    list: (params?: object) => [...QUERY_KEYS.dailyUpdates.all, 'list', params] as const,
    detail: (id: string) => [...QUERY_KEYS.dailyUpdates.all, id] as const,
    today: (userId: string) => [...QUERY_KEYS.dailyUpdates.all, 'today', userId] as const,
  },
  milestones: {
    list: (projectId: string) => ['milestones', projectId] as const,
    detail: (id: string) => ['milestones', 'detail', id] as const,
  },
  labels: {
    list: (projectId: string) => ['labels', projectId] as const,
  },
  bugs: {
    all: ['bugs'] as const,
    lists: () => [...QUERY_KEYS.bugs.all, 'list'] as const,
    list: (params?: object) => [...QUERY_KEYS.bugs.lists(), params] as const,
    details: () => [...QUERY_KEYS.bugs.all, 'detail'] as const,
    detail: (id: string) => [...QUERY_KEYS.bugs.details(), id] as const,
    comments: (id: string) => [...QUERY_KEYS.bugs.detail(id), 'comments'] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    list: (userId: string, params?: object) => [...QUERY_KEYS.notifications.all, userId, 'list', params] as const,
    unreadCount: (userId: string) => [...QUERY_KEYS.notifications.all, userId, 'unread-count'] as const,
  },
  search: {
    results: (q: string, type?: string) => ['search', q, type] as const,
  },
  reports: {
    tasks: (params?: object) => ['reports', 'tasks', params] as const,
    overdue: (params?: object) => ['reports', 'overdue', params] as const,
    employee: (userId: string, params?: object) => ['reports', 'employee', userId, params] as const,
    project: (projectId: string, params?: object) =>
      ['reports', 'project', projectId, params] as const,
  },
} as const;
