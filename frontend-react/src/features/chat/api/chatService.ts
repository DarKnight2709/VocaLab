import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/lib/api";

export const useSearchUsersQuery = (keyword: string) => {
  return useQuery({
    queryKey: ["users", "search", keyword],
    queryFn: async () => {
      if (!keyword.trim()) return [];
      const res = await api.get(
        `/users/search?keyword=${encodeURIComponent(keyword)}`,
      );
      // Assuming the API returns { users: [] } or array directly.
      // Based on user request "searchs: ... => api.get(...)"
      return (res.data as any)?.users || res.data || [];
    },
    enabled: !!keyword.trim(),
    staleTime: 1000 * 60, // 1 minute
  });
};
