import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/query-keys';
import {
  getTaskInterventions,
  createTaskIntervention,
  getBugInterventions,
  createBugIntervention,
  getEmployeeInterventions,
  type CreateInterventionInput,
} from '@/lib/api/interventions.api';
import type { Intervention } from '@/types/intervention.types';

export type { CreateInterventionInput };

const unwrap = (d: any): Intervention[] => d?.data ?? d;

export const useTaskInterventions = (taskId: string) =>
  useQuery({
    queryKey: QUERY_KEYS.interventions.task(taskId),
    queryFn: () => getTaskInterventions(taskId),
    enabled: !!taskId,
    select: unwrap,
  });

export const useCreateTaskIntervention = (taskId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInterventionInput) => createTaskIntervention(taskId, data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.interventions.task(taskId) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.interventions.employee(variables.employeeId) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.performance.summary });
    },
  });
};

export const useBugInterventions = (bugId: string) =>
  useQuery({
    queryKey: QUERY_KEYS.interventions.bug(bugId),
    queryFn: () => getBugInterventions(bugId),
    enabled: !!bugId,
    select: unwrap,
  });

export const useCreateBugIntervention = (bugId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInterventionInput) => createBugIntervention(bugId, data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.interventions.bug(bugId) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.interventions.employee(variables.employeeId) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.performance.summary });
    },
  });
};

export const useEmployeeInterventions = (employeeId: string) =>
  useQuery({
    queryKey: QUERY_KEYS.interventions.employee(employeeId),
    queryFn: () => getEmployeeInterventions(employeeId),
    enabled: !!employeeId,
    select: unwrap,
  });
