
import { useQuery} from "@tanstack/react-query";
import { api, fetchWithSchema } from "@/shared/lib/api";
import API_ROUTES from "@/shared/lib/api-routes";

import {
  GetUsersResponseSchema,
  GetMessagesResponseSchema,
} from "@/shared/validations/ChatSchema";



/**
 * Query keys factory
 */
export const chatKeys = {
  all: ["users"] as const,
  list: () => [...chatKeys.all, "list"] as const,
  detail: (id: string) => [...chatKeys.all, id, "detail"] as const,
  searchUsers: (keyword: string) =>
    [...chatKeys.all, "search", keyword] as const,
  messages: (friendId: string) =>
    [...chatKeys.detail(friendId), "messages"] as const,
};

export const useSearchUsersQuery = (keyword: string) => {
  const normalized = keyword.trim();
  return useQuery({
    queryKey: chatKeys.searchUsers(keyword),
    queryFn: async () => {
      if (!normalized) return [];
      const result = await fetchWithSchema(
        api.get(`${API_ROUTES.USER.SEARCH}?keyword=${encodeURIComponent(keyword)}`),
        GetUsersResponseSchema
      );

      return result.data.users ?? [];
    },
    enabled: !!normalized,
    staleTime: 1000 * 60, // 1 minute
  });
};


export function useUsersQuery(enabled = true) {
  return useQuery({
    queryKey: chatKeys.list(),
    queryFn: async () => {
      const result = await fetchWithSchema(
        api.get(API_ROUTES.MESSAGE.GET_USERS),
        GetUsersResponseSchema
      );

      return result.data.users ?? [];
    },
    enabled,
  });
}


export function useMessagesQuery(friendId: string) {
  return useQuery({
    queryKey: chatKeys.messages(friendId),
    queryFn: async () => {
      const result = await fetchWithSchema(
        api.get(API_ROUTES.MESSAGE.GET_MESSAGES(friendId)),
        GetMessagesResponseSchema
      );

      return result.data.messages ?? [];
    },
    enabled: !!friendId,
  });
}

