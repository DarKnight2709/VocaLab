import { api, fetchWithSchema } from "@/shared/lib/api";
import API_ROUTES from "@/shared/lib/api-routes";
import { SearchInfiniteResponseSchema, SearchSidebarResponseSchema } from "@/shared/validations/SearchSchema";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";

type SearchSort = "relevance" | "newest" | "oldest" | "popular" | "active";
type SearchTime = "all" | "24h" | "7d" | "30d" | "1y";

type SearchFilters = {
  sort?: SearchSort;
  time?: SearchTime;
};

// ──────────────────────────────────────────────
// Search hooks
// ──────────────────────────────────────────────

export const useSearchSidebar = (
  q: string,
  enabled = true,
  filters: SearchFilters = {},
) =>
  useQuery({
    queryKey: ["search-sidebar", q, filters.sort, filters.time],
    queryFn: async () => {
      const result = await fetchWithSchema(
        api.get(API_ROUTES.SEARCH.SIDEBAR, {
          params: {
            query: q,
            sort: filters.sort,
            time: filters.time,
          },
        }),
        SearchSidebarResponseSchema,
      );
      return result.data;
    },
    enabled: enabled && q.length >= 1,
    staleTime: 30_000,
  });

export const useSearchInfinite = (
  q: string,
  type: string,
  filters: SearchFilters = {},
) =>
  useInfiniteQuery({
    queryKey: ["search-infinite", q, type, filters.sort, filters.time],
    queryFn: async ({ pageParam = 1 }) => {
      const result = await fetchWithSchema(
        api.get(API_ROUTES.SEARCH.BASE(type), {
          params: {
            query: q,
            page: pageParam,
            limit: 5,
            sort: filters.sort,
            time: filters.time,
          },
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

