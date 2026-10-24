import api from './axios';
import type { Intervention } from '@/types/intervention.types';
import { actorParams } from './actor';

export interface CreateInterventionInput {
  employeeId: string;
  note: string;
}

export async function getTaskInterventions(taskId: string): Promise<Intervention[]> {
  return api.get(`/tasks/${taskId}/interventions`);
}

export async function createTaskIntervention(
  taskId: string,
  data: CreateInterventionInput
): Promise<Intervention> {
  return api.post(`/tasks/${taskId}/interventions`, data, { params: actorParams() });
}

export async function getBugInterventions(bugId: string): Promise<Intervention[]> {
  return api.get(`/bugs/${bugId}/interventions`);
}

export async function createBugIntervention(
  bugId: string,
  data: CreateInterventionInput
): Promise<Intervention> {
  return api.post(`/bugs/${bugId}/interventions`, data, { params: actorParams() });
}

export async function getEmployeeInterventions(employeeId: string): Promise<Intervention[]> {
  return api.get(`/employees/${employeeId}/interventions`);
}
