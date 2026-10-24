import api from './axios';
import type {
  EmployeePerformanceSummary,
  EmployeePerformanceDetail,
} from '@/types/performance.types';

export async function getPerformanceSummary(): Promise<EmployeePerformanceSummary[]> {
  return api.get('/performance');
}

export async function getPerformanceDetail(userId: string): Promise<EmployeePerformanceDetail> {
  return api.get(`/performance/${userId}`);
}
