import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/query-keys';
import {
  getMilestones,
  getMilestone,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  type CreateMilestoneInput,
  type UpdateMilestoneInput,
} from '@/lib/api/milestones.api';

export const useMilestones = (projectId: string) =>
  useQuery({
    queryKey: QUERY_KEYS.milestones.list(projectId),
    queryFn: () => getMilestones(projectId),
    enabled: !!projectId,
    staleTime: 60_000,
  });

export const useMilestone = (id: string) =>
  useQuery({
    queryKey: QUERY_KEYS.milestones.detail(id),
    queryFn: () => getMilestone(id),
    enabled: !!id,
  });

export const useCreateMilestone = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMilestoneInput) => createMilestone(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.milestones.list(projectId) });
    },
  });
};

export const useUpdateMilestone = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMilestoneInput }) =>
      updateMilestone(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.milestones.detail(id) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.milestones.list(projectId) });
    },
  });
};

export const useDeleteMilestone = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMilestone(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.milestones.list(projectId) });
    },
  });
};
