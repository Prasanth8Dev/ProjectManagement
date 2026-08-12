import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/query-keys';
import type { Label } from '@/types/label.types';
import {
  getLabels,
  createLabel,
  updateLabel,
  deleteLabel,
  attachLabel,
  detachLabel,
  type CreateLabelInput,
  type UpdateLabelInput,
} from '@/lib/api/labels.api';

export const useLabels = (projectId: string) =>
  useQuery({
    queryKey: QUERY_KEYS.labels.list(projectId),
    queryFn: () => getLabels(projectId),
    enabled: !!projectId,
    staleTime: 120_000,
    select: (d: any): Label[] => d?.data ?? d,
  });

export const useCreateLabel = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLabelInput) => createLabel(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.labels.list(projectId) });
    },
  });
};

export const useUpdateLabel = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ labelId, data }: { labelId: string; data: UpdateLabelInput }) =>
      updateLabel(projectId, labelId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.labels.list(projectId) });
    },
  });
};

export const useDeleteLabel = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (labelId: string) => deleteLabel(projectId, labelId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.labels.list(projectId) });
    },
  });
};

export const useAttachLabel = (taskId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (labelId: string) => attachLabel(taskId, labelId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tasks.detail(taskId) });
    },
  });
};

export const useDetachLabel = (taskId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (labelId: string) => detachLabel(taskId, labelId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tasks.detail(taskId) });
    },
  });
};
