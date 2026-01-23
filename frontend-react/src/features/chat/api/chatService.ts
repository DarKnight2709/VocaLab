
import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/lib/api";
import API_ROUTES from "@/shared/lib/api-routes";

import type {
  GetUsersResponse,
  GetMessagesResponse,
} from "@/shared/validations/ChatSchema";

export const useSearchUsersQuery = (keyword: string) => {
  return useQuery({
    queryKey: ["users", "search", keyword],
    queryFn: async () => {
      if (!keyword.trim()) return [];
      const res = await api.get<GetUsersResponse>(
        `${API_ROUTES.USER.SEARCH}?keyword=${encodeURIComponent(keyword)}`,
      );
      return res.data?.users || []; 
    },
    enabled: !!keyword.trim(),
    staleTime: 1000 * 60, // 1 minute
  });
};


export function useUsersQuery() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get<GetUsersResponse>(API_ROUTES.MESSAGE.GET_USERS);
      return res.data?.users || [];
    },
  });
}


export function useMessagesQuery(friendId: string) {
  return useQuery({
    queryKey: ['messages', friendId],
    queryFn: async () => {
      if (!friendId) return [];
      const res = await api.get<GetMessagesResponse>(API_ROUTES.MESSAGE.GET_MESSAGES(friendId));
      return res.data?.messages || [];
    },
    enabled: !!friendId,
  });
}


