import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/query-keys';
import {
  getTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
  changeTeamMemberRole,
  linkProjectToTeam,
  unlinkProjectFromTeam,
} from '@/lib/api/teams.api';
import type { CreateTeamInput, AddTeamMemberInput } from '@/lib/validators/team.schema';
import type { PaginationParams } from '@/types/api.types';

export const useTeams = (params?: PaginationParams) =>
  useQuery({
    queryKey: QUERY_KEYS.teams.list(params),
    queryFn: () => getTeams(params),
    staleTime: 30_000,
  });

export const useTeam = (id: string) =>
  useQuery({
    queryKey: QUERY_KEYS.teams.detail(id),
    queryFn: () => getTeam(id),
    enabled: !!id,
  });

export const useCreateTeam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTeamInput) => createTeam(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.teams.all });
    },
  });
};

export const useUpdateTeam = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CreateTeamInput>) => updateTeam(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.teams.detail(id) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.teams.all });
    },
  });
};

export const useDeleteTeam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTeam(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.teams.all });
    },
  });
};

export const useAddTeamMember = (teamId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AddTeamMemberInput) => addTeamMember(teamId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.teams.detail(teamId) });
    },
  });
};

export const useRemoveTeamMember = (teamId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => removeTeamMember(teamId, memberId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.teams.detail(teamId) });
    },
  });
};

export const useTeamMembers = (teamId: string) =>
  useQuery({
    queryKey: [...QUERY_KEYS.teams.detail(teamId), 'members'],
    queryFn: () => getTeam(teamId).then((t: any) => (t?.data ?? t)?.members ?? []),
    enabled: !!teamId,
    staleTime: 30_000,
  });

export const useChangeTeamMemberRole = (teamId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: 'LEAD' | 'MEMBER' }) =>
      changeTeamMemberRole(teamId, memberId, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.teams.detail(teamId) });
    },
  });
};

export const useLinkProjectToTeam = (teamId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) => linkProjectToTeam(teamId, projectId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.teams.detail(teamId) });
    },
  });
};

export const useUnlinkProjectFromTeam = (teamId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) => unlinkProjectFromTeam(teamId, projectId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.teams.detail(teamId) });
    },
  });
};
