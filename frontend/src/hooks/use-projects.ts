import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/query-keys';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  archiveProject,
  getProjectStats,
  addProjectMember,
  removeProjectMember,
  getProjectActivity,
  type ProjectFilterParams,
} from '@/lib/api/projects.api';
import type { CreateProjectInput, UpdateProjectInput } from '@/lib/validators/project.schema';
import type { ActivityLog } from '@/types/activity.types';

export const useProjects = (params?: ProjectFilterParams) =>
  useQuery({
    queryKey: QUERY_KEYS.projects.list(params),
    queryFn: () => getProjects(params),
    staleTime: 30_000,
  });

export const useProject = (id: string) =>
  useQuery({
    queryKey: QUERY_KEYS.projects.detail(id),
    queryFn: () => getProject(id),
    enabled: !!id,
  });

export const useProjectStats = (id: string) =>
  useQuery({
    queryKey: QUERY_KEYS.projects.stats(id),
    queryFn: () => getProjectStats(id),
    enabled: !!id,
  });

export const useProjectMembers = (id: string) =>
  useQuery({
    queryKey: QUERY_KEYS.projects.members(id),
    queryFn: () => getProject(id).then((p) => p.data?.members ?? []),
    enabled: !!id,
  });

export const useProjectActivity = (id: string) =>
  useQuery({
    queryKey: QUERY_KEYS.projects.activity(id),
    queryFn: () => getProjectActivity(id),
    enabled: !!id,
    select: (d: any): ActivityLog[] => d?.data ?? d,
  });

export const useCreateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProjectInput) => createProject(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.projects.all });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.stats });
    },
  });
};

export const useUpdateProject = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProjectInput) => updateProject(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.projects.detail(id) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.projects.lists() });
    },
  });
};

export const useDeleteProject = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => deleteProject(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.projects.all });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.stats });
    },
  });
};

export const useArchiveProject = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => archiveProject(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.projects.detail(id) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.projects.lists() });
    },
  });
};

export const useAddProjectMember = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { userId: string; role: string }) => addProjectMember(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.projects.detail(projectId) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.projects.members(projectId) });
    },
  });
};

export const useRemoveProjectMember = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => removeProjectMember(projectId, memberId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.projects.detail(projectId) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.projects.members(projectId) });
    },
  });
};
