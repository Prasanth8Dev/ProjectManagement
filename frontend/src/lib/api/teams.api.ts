import api from './axios';
import type { Team, TeamMember } from '@/types/team.types';
import type { ApiResponse, PaginationParams, PaginatedResponse } from '@/types/api.types';
import type { CreateTeamInput, AddTeamMemberInput } from '@/lib/validators/team.schema';

export interface UpdateTeamInput extends Partial<CreateTeamInput> {}

export async function getTeams(params?: PaginationParams): Promise<PaginatedResponse<Team>> {
  return api.get('/teams', { params });
}

export async function getTeam(id: string): Promise<ApiResponse<Team>> {
  return api.get(`/teams/${id}`);
}

export async function createTeam(data: CreateTeamInput): Promise<ApiResponse<Team>> {
  return api.post('/teams', data);
}

export async function updateTeam(id: string, data: UpdateTeamInput): Promise<Team> {
  return api.patch(`/teams/${id}`, data);
}

export async function deleteTeam(id: string): Promise<void> {
  return api.delete(`/teams/${id}`);
}

export async function addTeamMember(teamId: string, data: AddTeamMemberInput): Promise<TeamMember> {
  return api.post(`/teams/${teamId}/members`, data);
}

export async function removeTeamMember(teamId: string, memberId: string): Promise<void> {
  return api.delete(`/teams/${teamId}/members/${memberId}`);
}

export async function changeTeamMemberRole(
  teamId: string,
  memberId: string,
  role: 'LEAD' | 'MEMBER'
): Promise<TeamMember> {
  return api.patch(`/teams/${teamId}/members/${memberId}/role`, { role });
}

export async function linkProjectToTeam(teamId: string, projectId: string): Promise<void> {
  return api.post(`/teams/${teamId}/projects`, { projectId });
}

export async function unlinkProjectFromTeam(teamId: string, projectId: string): Promise<void> {
  return api.delete(`/teams/${teamId}/projects/${projectId}`);
}
