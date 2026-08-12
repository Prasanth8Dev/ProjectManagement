import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/query-keys';
import { searchAll, type SearchParams } from '@/lib/api/search.api';

export const useSearch = (params: SearchParams) =>
  useQuery({
    queryKey: QUERY_KEYS.search.results(params.q, params.type),
    queryFn: () => searchAll(params),
    enabled: params.q.length >= 2,
    staleTime: 15_000,
  });
