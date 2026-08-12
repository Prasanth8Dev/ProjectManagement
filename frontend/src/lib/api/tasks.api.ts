import api from './axios';
import type { Task, TaskHistoryEntry, TaskStatus } from '@/types/task.types';
import type { ActivityLog } from '@/types/activity.types';
import type { ApiResponse, PaginationParams, PaginatedResponse } from '@/types/api.types';
import type { CreateTaskInput, UpdateTaskInput } from '@/lib/validators/task.schema';

export interface TaskFilterParams extends PaginationParams {
  projectId?: string;
  assigneeId?: string;
  status?: string;
  priority?: string;
  milestoneId?: string;
}

export async function getTasks(params?: TaskFilterParams): Promise<PaginatedResponse<Task>> {
  return api.get('/tasks', { params });
}

export async function getTask(id: string): Promise<ApiResponse<Task>> {
  return api.get(`/tasks/${id}`);
}

export async function createTask(data: CreateTaskInput): Promise<Task> {
  return api.post('/tasks', data);
}

export async function updateTask(id: string, data: UpdateTaskInput): Promise<Task> {
  return api.patch(`/tasks/${id}`, data);
}

export async function deleteTask(id: string): Promise<void> {
  return api.delete(`/tasks/${id}`);
}

export async function assignTask(id: string, assigneeId: string | null): Promise<Task> {
  return api.patch(`/tasks/${id}/assign`, { assigneeId });
}

export async function changeTaskStatus(id: string, status: TaskStatus): Promise<Task> {
  return api.patch(`/tasks/${id}/status`, { status });
}

export async function getTaskHistory(id: string): Promise<TaskHistoryEntry[]> {
  return api.get(`/tasks/${id}/history`);
}

export async function getTaskActivity(id: string): Promise<ActivityLog[]> {
  return api.get(`/tasks/${id}/activity`);
}
