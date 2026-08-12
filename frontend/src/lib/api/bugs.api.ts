import api from './axios';
import type { Bug, BugStatus } from '@/types/bug.types';
import type { PaginationParams, PaginatedResponse, ApiResponse } from '@/types/api.types';

export interface BugFilterParams extends PaginationParams {
  search?: string;
  status?: string;
  severity?: string;
  priority?: string;
  projectId?: string;
  assigneeId?: string;
  reporterId?: string;
}

export interface CreateBugInput {
  title: string;
  description?: string;
  stepsToReproduce?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  environment?: string;
  status?: BugStatus;
  severity?: string;
  priority?: string;
  projectId?: string;
  assigneeId?: string;
  reporterId: string;
}

export type UpdateBugInput = Partial<CreateBugInput> & { isArchived?: boolean };

export async function getBugs(params?: BugFilterParams): Promise<PaginatedResponse<Bug>> {
  return api.get('/bugs', { params });
}

export async function getBug(id: string): Promise<ApiResponse<Bug>> {
  return api.get(`/bugs/${id}`);
}

export async function createBug(data: CreateBugInput): Promise<Bug> {
  return api.post('/bugs', data);
}

export async function updateBug(id: string, data: UpdateBugInput): Promise<Bug> {
  return api.patch(`/bugs/${id}`, data);
}

export async function deleteBug(id: string): Promise<void> {
  return api.delete(`/bugs/${id}`);
}

export async function assignBug(id: string, assigneeId: string | null): Promise<Bug> {
  return api.patch(`/bugs/${id}/assign`, { assigneeId });
}

export async function changeBugStatus(id: string, status: BugStatus): Promise<Bug> {
  return api.patch(`/bugs/${id}/status`, { status });
}
