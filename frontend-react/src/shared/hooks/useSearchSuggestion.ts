import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/shared/hooks/useDebounce';
import API_ROUTES from '../lib/api-routes';
import { api, fetchWithSchema } from '../lib/api';
import { SearchSuggestionListSchema } from '../validations/SearchSchema';

export function useSearchSuggestion(query: string, options: { enabled?: boolean } = {}) {
  const debouncedQuery = useDebounce(query, 300);

  return useQuery({
    queryKey: ['search-suggestion', debouncedQuery],
    queryFn: async () => fetchWithSchema(api.get(API_ROUTES.SEARCH.SUGGESTION, {
        params: {
          query: debouncedQuery,
        },
      }), SearchSuggestionListSchema),
    enabled: (options.enabled ?? true) && debouncedQuery.length > 2,
  });
}