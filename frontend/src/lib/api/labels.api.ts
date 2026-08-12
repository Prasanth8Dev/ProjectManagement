import api from './axios';
import type { Label } from '@/types/label.types';

export interface CreateLabelInput {
  name: string;
  color: string;
}

export interface UpdateLabelInput extends Partial<CreateLabelInput> {}

export async function getLabels(projectId: string): Promise<Label[]> {
  return api.get(`/projects/${projectId}/labels`);
}

export async function createLabel(projectId: string, data: CreateLabelInput): Promise<Label> {
  return api.post(`/projects/${projectId}/labels`, data);
}

export async function updateLabel(
  projectId: string,
  labelId: string,
  data: UpdateLabelInput
): Promise<Label> {
  return api.patch(`/projects/${projectId}/labels/${labelId}`, data);
}

export async function deleteLabel(projectId: string, labelId: string): Promise<void> {
  return api.delete(`/projects/${projectId}/labels/${labelId}`);
}

export async function attachLabel(taskId: string, labelId: string): Promise<void> {
  return api.post(`/tasks/${taskId}/labels/${labelId}`);
}

export async function detachLabel(taskId: string, labelId: string): Promise<void> {
  return api.delete(`/tasks/${taskId}/labels/${labelId}`);
}
