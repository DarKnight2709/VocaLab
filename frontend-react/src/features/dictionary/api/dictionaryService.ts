import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { api, fetchWithSchema } from '@/shared/lib/api';
import API_ROUTES from '@/shared/lib/api-routes';
import { SearchSuggestionListSchema } from '@/shared/validations/SearchSchema';
import { DictionaryWordLookupResponseSchema } from '@/shared/validations/DictionarySchema';


export function useDictionarySuggestion(query: string, options: { enabled?: boolean } = {}) {
  const debouncedQuery = useDebounce(query, 300);

  return useQuery({
    queryKey: ['dictionary-suggestion', debouncedQuery],
    queryFn: async () => fetchWithSchema(api.get(API_ROUTES.DICTIONARY.SUGGESTION, {
        params: {
          query: debouncedQuery,
        },
      }), SearchSuggestionListSchema),
    enabled: (options.enabled ?? true) && debouncedQuery.length > 1,
  });
}

export function useDictionaryWordLookup(word: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ['dictionary-lookup', word],
    queryFn: async () => {
      const response = await fetchWithSchema(
        api.get(API_ROUTES.DICTIONARY.LOOKUP(word)),
        DictionaryWordLookupResponseSchema
      );
      return response.data;
    },
    enabled: (options.enabled ?? true) && !!word,
  });
}
