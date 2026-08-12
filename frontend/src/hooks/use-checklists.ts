import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/query-keys';
import type { ChecklistItem } from '@/types/task.types';
import {
  getChecklist,
  addChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  reorderChecklist,
  type AddChecklistItemInput,
  type UpdateChecklistItemInput,
  type ReorderChecklistInput,
} from '@/lib/api/checklists.api';

export const useChecklist = (taskId: string) =>
  useQuery({
    queryKey: QUERY_KEYS.tasks.checklist(taskId),
    queryFn: () => getChecklist(taskId),
    enabled: !!taskId,
    select: (d: any): ChecklistItem[] => d?.data ?? d,
  });

export const useAddChecklistItem = (taskId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AddChecklistItemInput) => addChecklistItem(taskId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tasks.checklist(taskId) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tasks.detail(taskId) });
    },
  });
};

export const useUpdateChecklistItem = (taskId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; data: UpdateChecklistItemInput }) =>
      updateChecklistItem(taskId, itemId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tasks.checklist(taskId) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tasks.detail(taskId) });
    },
  });
};

export const useDeleteChecklistItem = (taskId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => deleteChecklistItem(taskId, itemId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tasks.checklist(taskId) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tasks.detail(taskId) });
    },
  });
};

export const useReorderChecklist = (taskId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ReorderChecklistInput) => reorderChecklist(taskId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tasks.checklist(taskId) });
    },
  });
};
