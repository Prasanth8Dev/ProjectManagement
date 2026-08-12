import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/query-keys';
import { getActivity, type ActivityFilterParams } from '@/lib/api/activity.api';

export const useActivity = (params?: ActivityFilterParams) =>
  useQuery({
    queryKey: QUERY_KEYS.activity.list(params),
    queryFn: () => getActivity(params),
    staleTime: 30_000,
  });
