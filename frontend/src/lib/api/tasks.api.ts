import api from './axios';
import type { Task, TaskActivityEvent, TaskTimeTracking, TaskStatus } from '@/types/task.types';
import type { ActivityLog } from '@/types/activity.types';
import type { ApiResponse, PaginationParams, PaginatedResponse } from '@/types/api.types';
import type { CreateTaskInput, UpdateTaskInput } from '@/lib/validators/task.schema';
import { actorParams } from './actor';

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
  return api.post('/tasks', data, { params: actorParams() });
}

export async function updateTask(id: string, data: UpdateTaskInput): Promise<Task> {
  return api.patch(`/tasks/${id}`, data, { params: actorParams() });
}

export async function deleteTask(id: string): Promise<void> {
  return api.delete(`/tasks/${id}`);
}

export async function assignTask(id: string, assigneeId: string | null): Promise<Task> {
  return api.patch(`/tasks/${id}/assign`, { assigneeId }, { params: actorParams() });
}

export async function changeTaskStatus(id: string, status: TaskStatus): Promise<Task> {
  return api.patch(`/tasks/${id}/status`, { status }, { params: actorParams() });
}

export async function getTaskHistory(id: string): Promise<TaskActivityEvent[]> {
  return api.get(`/tasks/${id}/history`);
}

export async function getTaskActivity(id: string): Promise<ActivityLog[]> {
  return api.get(`/tasks/${id}/activity`);
}

export async function getTaskTimeTracking(id: string): Promise<TaskTimeTracking> {
  return api.get(`/tasks/${id}/time-tracking`);
}

export async function startTask(id: string): Promise<Task> {
  return api.post(`/tasks/${id}/start`, undefined, { params: actorParams() });
}

export async function pauseTask(id: string, reason?: string): Promise<Task> {
  return api.post(`/tasks/${id}/pause`, { reason }, { params: actorParams() });
}

export async function resumeTask(id: string): Promise<Task> {
  return api.post(`/tasks/${id}/resume`, undefined, { params: actorParams() });
}

export async function blockTask(id: string, reason?: string): Promise<Task> {
  return api.post(`/tasks/${id}/block`, { reason }, { params: actorParams() });
}

export async function unblockTask(id: string): Promise<Task> {
  return api.post(`/tasks/${id}/unblock`, undefined, { params: actorParams() });
}

export async function completeTask(id: string, comment?: string): Promise<Task> {
  return api.post(`/tasks/${id}/complete`, { comment }, { params: actorParams() });
}

export async function sendTaskForReview(id: string, comment?: string): Promise<Task> {
  return api.post(`/tasks/${id}/send-for-review`, { comment }, { params: actorParams() });
}

export async function completeTaskReview(id: string, comment?: string): Promise<Task> {
  return api.post(`/tasks/${id}/complete-review`, { comment }, { params: actorParams() });
}

export async function closeTask(id: string, comment?: string): Promise<Task> {
  return api.post(`/tasks/${id}/close`, { comment }, { params: actorParams() });
}
