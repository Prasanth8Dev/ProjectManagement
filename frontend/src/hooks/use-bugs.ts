import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/query-keys';
import {
  getBugs,
  getBug,
  createBug,
  updateBug,
  deleteBug,
  assignBug,
  changeBugStatus,
  convertBugToTask,
  type BugFilterParams,
  type CreateBugInput,
  type UpdateBugInput,
} from '@/lib/api/bugs.api';
import type { BugStatus } from '@/types/bug.types';

export type { BugFilterParams };

export const useBugs = (params?: BugFilterParams) =>
  useQuery({
    queryKey: QUERY_KEYS.bugs.list(params),
    queryFn: () => getBugs(params),
    staleTime: 30_000,
  });

export const useBug = (id: string) =>
  useQuery({
    queryKey: QUERY_KEYS.bugs.detail(id),
    queryFn: () => getBug(id),
    enabled: !!id,
  });

export const useCreateBug = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBugInput) => createBug(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.bugs.all });
    },
  });
};

export const useUpdateBug = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateBugInput) => updateBug(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.bugs.detail(id) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.bugs.lists() });
    },
  });
};

export const useDeleteBug = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBug(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.bugs.all });
    },
  });
};

export const useAssignBug = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (assigneeId: string | null) => assignBug(id, assigneeId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.bugs.detail(id) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.bugs.lists() });
    },
  });
};

export const useChangeBugStatus = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: BugStatus) => changeBugStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.bugs.detail(id) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.bugs.lists() });
    },
  });
};

export const useConvertBugToTask = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => convertBugToTask(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.bugs.detail(id) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.bugs.lists() });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tasks.lists() });
    },
  });
};
