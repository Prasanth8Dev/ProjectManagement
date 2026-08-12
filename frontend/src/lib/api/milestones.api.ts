import api from './axios';
import type { Milestone } from '@/types/milestone.types';
import type { ApiResponse } from '@/types/api.types';

export interface CreateMilestoneInput {
  name: string;
  description?: string;
  dueDate?: string;
  status?: string;
}

export interface UpdateMilestoneInput extends Partial<CreateMilestoneInput> {}

export async function getMilestones(projectId: string): Promise<ApiResponse<Milestone[]>> {
  return api.get(`/projects/${projectId}/milestones`);
}

export async function getMilestone(id: string): Promise<ApiResponse<Milestone>> {
  return api.get(`/milestones/${id}`);
}

export async function createMilestone(
  projectId: string,
  data: CreateMilestoneInput
): Promise<Milestone> {
  return api.post(`/projects/${projectId}/milestones`, data);
}

export async function updateMilestone(id: string, data: UpdateMilestoneInput): Promise<Milestone> {
  return api.patch(`/milestones/${id}`, data);
}

export async function deleteMilestone(id: string): Promise<void> {
  return api.delete(`/milestones/${id}`);
}
