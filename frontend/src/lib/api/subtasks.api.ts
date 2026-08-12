import api from './axios';
import type { Task } from '@/types/task.types';

export interface CreateSubtaskInput {
  title: string;
  description?: string;
  assigneeId?: string | null;
  dueDate?: string | null;
  priority?: string;
}

export interface UpdateSubtaskInput extends Partial<CreateSubtaskInput> {
  status?: string;
}

export async function getSubtasks(taskId: string): Promise<Task[]> {
  return api.get(`/tasks/${taskId}/subtasks`);
}

export async function createSubtask(taskId: string, data: CreateSubtaskInput): Promise<Task> {
  return api.post(`/tasks/${taskId}/subtasks`, data);
}

export async function updateSubtask(
  taskId: string,
  subtaskId: string,
  data: UpdateSubtaskInput
): Promise<Task> {
  return api.patch(`/tasks/${taskId}/subtasks/${subtaskId}`, data);
}

export async function deleteSubtask(taskId: string, subtaskId: string): Promise<void> {
  return api.delete(`/tasks/${taskId}/subtasks/${subtaskId}`);
}

export async function toggleSubtaskComplete(taskId: string, subtaskId: string): Promise<Task> {
  return api.patch(`/tasks/${taskId}/subtasks/${subtaskId}/toggle`);
}
