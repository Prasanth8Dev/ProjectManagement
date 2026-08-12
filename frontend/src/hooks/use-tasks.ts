import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/query-keys';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  assignTask,
  changeTaskStatus,
  getTaskHistory,
  type TaskFilterParams,
} from '@/lib/api/tasks.api';
import type { CreateTaskInput, UpdateTaskInput } from '@/lib/validators/task.schema';
import type { TaskStatus, TaskHistoryEntry } from '@/types/task.types';

export type { TaskFilterParams };

export const useTasks = (params?: TaskFilterParams) =>
  useQuery({
    queryKey: QUERY_KEYS.tasks.list(params),
    queryFn: () => getTasks(params),
    staleTime: 30_000,
  });

export const useTask = (id: string) =>
  useQuery({
    queryKey: QUERY_KEYS.tasks.detail(id),
    queryFn: () => getTask(id),
    enabled: !!id,
  });

export const useTaskHistory = (id: string) =>
  useQuery({
    queryKey: QUERY_KEYS.tasks.history(id),
    queryFn: () => getTaskHistory(id),
    enabled: !!id,
    select: (d: any): TaskHistoryEntry[] => d?.data ?? d,
  });

export const useCreateTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTaskInput) => createTask(data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tasks.all });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.stats });
      if (variables.projectId) {
        qc.invalidateQueries({ queryKey: QUERY_KEYS.kanban.board(variables.projectId) });
      }
    },
  });
};

export const useUpdateTask = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateTaskInput) => updateTask(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tasks.detail(id) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tasks.lists() });
    },
  });
};

export const useDeleteTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tasks.all });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.stats });
    },
  });
};

export const useAssignTask = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (assigneeId: string | null) => assignTask(id, assigneeId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tasks.detail(id) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tasks.lists() });
    },
  });
};

export const useChangeTaskStatus = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: TaskStatus) => changeTaskStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tasks.detail(id) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tasks.lists() });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.stats });
    },
  });
};

export const useSubtasks = (taskId: string) =>
  useQuery({
    queryKey: [...QUERY_KEYS.tasks.detail(taskId), 'subtasks'],
    queryFn: () => getTasks({ parentTaskId: taskId } as any),
    enabled: !!taskId,
    staleTime: 30_000,
    select: (data: any) => data?.data ?? data ?? [],
  });
