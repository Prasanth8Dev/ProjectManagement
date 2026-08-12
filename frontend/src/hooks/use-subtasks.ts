import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/query-keys';
import {
  getSubtasks,
  createSubtask,
  updateSubtask,
  deleteSubtask,
  toggleSubtaskComplete,
  type CreateSubtaskInput,
  type UpdateSubtaskInput,
} from '@/lib/api/subtasks.api';

export const useSubtasks = (taskId: string) =>
  useQuery({
    queryKey: QUERY_KEYS.tasks.subtasks(taskId),
    queryFn: () => getSubtasks(taskId),
    enabled: !!taskId,
  });

export const useCreateSubtask = (taskId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSubtaskInput) => createSubtask(taskId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tasks.subtasks(taskId) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tasks.detail(taskId) });
    },
  });
};

export const useUpdateSubtask = (taskId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ subtaskId, data }: { subtaskId: string; data: UpdateSubtaskInput }) =>
      updateSubtask(taskId, subtaskId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tasks.subtasks(taskId) });
    },
  });
};

export const useDeleteSubtask = (taskId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (subtaskId: string) => deleteSubtask(taskId, subtaskId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tasks.subtasks(taskId) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tasks.detail(taskId) });
    },
  });
};

export const useToggleSubtask = (taskId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (subtaskId: string) => toggleSubtaskComplete(taskId, subtaskId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tasks.subtasks(taskId) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tasks.detail(taskId) });
    },
  });
};
