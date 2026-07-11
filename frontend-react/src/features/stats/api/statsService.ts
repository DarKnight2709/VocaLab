import { useQuery } from "@tanstack/react-query";
import { api, fetchWithSchema } from "@/shared/lib/api";
import API_ROUTES from "@/shared/lib/api-routes";
import { StatsResponseSchema, CollectionStatsResponseSchema, type StatsResponse } from "@/shared/validations/ProgressSchema";

export const useStatsQuery = (weekOffset: number) => {
  return useQuery<StatsResponse>({
    queryKey: ["vocabulary-stats", weekOffset],
    queryFn: async () => {
      const result = await fetchWithSchema(
        api.get(API_ROUTES.PROGRESS.STATS, { params: { weekOffset } }),
        StatsResponseSchema
      );
      return result.data;
    },
  });
};

export const useCollectionStatsQuery = (collectionId: string) => {
  return useQuery({
    queryKey: ["collection-stats", collectionId],
    queryFn: async () => {
      const result = await fetchWithSchema(
        api.get(API_ROUTES.PROGRESS.COLLECTION_STATS(collectionId)),
        CollectionStatsResponseSchema
      );
      return result.data;
    },
    enabled: !!collectionId,
  });
};
