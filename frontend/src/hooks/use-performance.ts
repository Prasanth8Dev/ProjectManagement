import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/query-keys';
import { getPerformanceSummary, getPerformanceDetail } from '@/lib/api/performance.api';
import type { EmployeePerformanceSummary, EmployeePerformanceDetail } from '@/types/performance.types';

export const usePerformanceSummary = () =>
  useQuery({
    queryKey: QUERY_KEYS.performance.summary,
    queryFn: () => getPerformanceSummary(),
    staleTime: 30_000,
    select: (d: any): EmployeePerformanceSummary[] => d?.data ?? d,
  });

export const usePerformanceDetail = (userId: string) =>
  useQuery({
    queryKey: QUERY_KEYS.performance.detail(userId),
    queryFn: () => getPerformanceDetail(userId),
    enabled: !!userId,
    select: (d: any): EmployeePerformanceDetail => d?.data ?? d,
  });
