import api from './axios';
import type { Project, ProjectStats, ProjectMember } from '@/types/project.types';
import type { ActivityLog } from '@/types/activity.types';
import type { ApiResponse, PaginationParams, PaginatedResponse } from '@/types/api.types';
import type { CreateProjectInput, UpdateProjectInput } from '@/lib/validators/project.schema';

export interface ProjectFilterParams extends PaginationParams {
  status?: string;
  priority?: string;
  isArchived?: boolean;
}

export async function getProjects(params?: ProjectFilterParams): Promise<PaginatedResponse<Project>> {
  return api.get('/projects', { params });
}

export async function getProject(id: string): Promise<ApiResponse<Project>> {
  return api.get(`/projects/${id}`);
}

export async function createProject(data: CreateProjectInput): Promise<ApiResponse<Project>> {
  return api.post('/projects', data);
}

export async function updateProject(id: string, data: UpdateProjectInput): Promise<Project> {
  return api.patch(`/projects/${id}`, data);
}

export async function deleteProject(id: string): Promise<void> {
  return api.delete(`/projects/${id}`);
}

export async function archiveProject(id: string): Promise<Project> {
  return api.patch(`/projects/${id}/archive`);
}

export async function getProjectStats(id: string): Promise<ApiResponse<ProjectStats>> {
  return api.get(`/projects/${id}/stats`);
}

export async function addProjectMember(
  projectId: string,
  data: { userId: string; role: string }
): Promise<ProjectMember> {
  return api.post(`/projects/${projectId}/members`, data);
}

export async function removeProjectMember(projectId: string, memberId: string): Promise<void> {
  return api.delete(`/projects/${projectId}/members/${memberId}`);
}

export async function getProjectActivity(
  projectId: string,
  params?: PaginationParams
): Promise<ActivityLog[]> {
  return api.get(`/projects/${projectId}/activity`, { params });
}
