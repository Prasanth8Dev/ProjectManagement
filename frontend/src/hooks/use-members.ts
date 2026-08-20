import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/query-keys';
import {
  createUser,
  getUsers,
  getUser,
  updateUser,
  getUserTasks,
  getUserActivity,
  type CreateUserInput,
  type UpdateUserInput,
} from '@/lib/api/users.api';
import type { PaginationParams } from '@/types/api.types';

export interface MemberFilterParams extends PaginationParams {
  role?: string;
  teamId?: string;
}

export const useCreateMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserInput) => createUser(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.users.all });
    },
  });
};

export const useMembers = (params?: MemberFilterParams) =>
  useQuery({
    queryKey: QUERY_KEYS.users.list(params),
    queryFn: () => getUsers(params),
    staleTime: 60_000,
  });

export const useMember = (id: string) =>
  useQuery({
    queryKey: QUERY_KEYS.users.detail(id),
    queryFn: () => getUser(id),
    enabled: !!id,
  });

export const useUpdateMember = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateUserInput) => updateUser(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.users.detail(id) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.users.all });
    },
  });
};

export const useUserTasks = (id: string, params?: PaginationParams) =>
  useQuery({
    queryKey: [...QUERY_KEYS.users.detail(id), 'tasks', params],
    queryFn: () => getUserTasks(id, params),
    enabled: !!id,
    staleTime: 30_000,
  });

export const useUserActivity = (id: string, params?: PaginationParams) =>
  useQuery({
    queryKey: [...QUERY_KEYS.users.detail(id), 'activity', params],
    queryFn: () => getUserActivity(id, params),
    enabled: !!id,
    staleTime: 30_000,
  });

export const useUserSearch = (query: string, enabled: boolean = true) =>
  useQuery({
    queryKey: QUERY_KEYS.users.list({ search: query }),
    queryFn: () => getUsers({ search: query, limit: 20 } as any),
    enabled,
    staleTime: 30_000,
    select: (data) => data?.data ?? [],
  });
