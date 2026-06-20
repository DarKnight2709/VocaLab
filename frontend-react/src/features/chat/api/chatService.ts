
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { api, fetchWithSchema } from "@/shared/lib/api";
import API_ROUTES from "@/shared/lib/api-routes";
import { useDebounce } from "@/shared/hooks/useDebounce";
import {
  GetUsersResponseSchema,
  GetMessagesResponseSchema,
  SearchFriendsResponseSchema,
  UserChatInfoResponseSchema,
  type SearchFriendsResponse,
  type UserChatInfoResponse,
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
  friendSearchSuggestion: (keyword: string) =>
    [...chatKeys.all, "friend-search-suggestion", keyword] as const,
  chatInfo: (userId: string) =>
    [...chatKeys.all, "chat-info", userId] as const,
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

export function useFriendSearchSuggestionQuery(query: string, options: { enabled?: boolean } = {}) {
  const debouncedQuery = useDebounce(query, 300);

  return useInfiniteQuery<SearchFriendsResponse>({
    queryKey: chatKeys.friendSearchSuggestion(debouncedQuery),
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetchWithSchema(
        api.get(API_ROUTES.USER.SEARCH_FRIENDS, {
          params: {
            q: debouncedQuery,
            page: pageParam,
            limit: 5,
          },
        }),
        SearchFriendsResponseSchema
      );
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    enabled: (options.enabled ?? true) && debouncedQuery.length > 0,
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

export function useUserChatInfoQuery(userId: string, options: { enabled?: boolean } = {}) {
  return useQuery<UserChatInfoResponse>({
    queryKey: chatKeys.chatInfo(userId),
    queryFn: async () => {
      const result = await fetchWithSchema(
        api.get(API_ROUTES.USER.CHAT_INFO(userId)),
        UserChatInfoResponseSchema
      );
      return result.data;
    },
    enabled: (options.enabled ?? true) && !!userId,
    staleTime: 1000 * 30, // 30 seconds
    retry: false, // don't retry on 404
  });
}
