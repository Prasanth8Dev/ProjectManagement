import api from './axios';
import type { ChecklistItem } from '@/types/task.types';

export interface AddChecklistItemInput {
  title: string;
}

export interface UpdateChecklistItemInput {
  title?: string;
  isCompleted?: boolean;
}

export interface ReorderChecklistInput {
  items: { id: string; position: number }[];
}

export async function getChecklist(taskId: string): Promise<ChecklistItem[]> {
  return api.get(`/tasks/${taskId}/checklist`);
}

export async function addChecklistItem(
  taskId: string,
  data: AddChecklistItemInput
): Promise<ChecklistItem> {
  return api.post(`/tasks/${taskId}/checklist`, data);
}

export async function updateChecklistItem(
  taskId: string,
  itemId: string,
  data: UpdateChecklistItemInput
): Promise<ChecklistItem> {
  return api.patch(`/tasks/${taskId}/checklist/${itemId}`, data);
}

export async function deleteChecklistItem(taskId: string, itemId: string): Promise<void> {
  return api.delete(`/tasks/${taskId}/checklist/${itemId}`);
}

export async function reorderChecklist(
  taskId: string,
  data: ReorderChecklistInput
): Promise<ChecklistItem[]> {
  return api.patch(`/tasks/${taskId}/checklist/reorder`, data);
}
