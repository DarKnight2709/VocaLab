import { api, fetchWithSchema } from "@/shared/lib/api";
import API_ROUTES from "@/shared/lib/api-routes";
import { SearchInfiniteResponseSchema, SearchSidebarResponseSchema } from "@/shared/validations/SearchSchema";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";

// ──────────────────────────────────────────────
// Search hooks
// ──────────────────────────────────────────────

export const useSearchSidebar = (q: string, enabled = true) =>
  useQuery({
    queryKey: ["search-sidebar", q],
    queryFn: async () => {
      const result = await fetchWithSchema(
        api.get(API_ROUTES.SEARCH.SIDEBAR, {
          params: { query: q },
        }),
        SearchSidebarResponseSchema,
      );
      return result.data;
    },
    enabled: enabled && q.length >= 1,
    staleTime: 30_000,
  });

export const useSearchInfinite = (q: string, type: string) =>
  useInfiniteQuery({
    queryKey: ["search-infinite", q, type],
    queryFn: async ({ pageParam = 1 }) => {
      const result = await fetchWithSchema(
        api.get(API_ROUTES.SEARCH.BASE(type), {
          params: { query: q, page: pageParam, limit: 5 },
        }),
        SearchInfiniteResponseSchema,
      );
      return result.data;
    },
    getNextPageParam: (lastPage) => {
      const meta = lastPage?.meta;
      if (!meta) return undefined;
      return meta.page < meta.totalPages ? meta.page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: q.length >= 1,
  });

