import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, fetchWithSchema, getErrorMessage } from "@/shared/lib/api";
import { GetNotificationResponseSchema } from "@/shared/validations/NotificationSchema";
import API_ROUTES from "@/shared/lib/api-routes";
import { toast } from "sonner";
import i18n from "@/shared/i18n";
import z from "zod";

export const NOTIFICATION_KEYS = {
  all: ["notifications"] as const,
  lists: () => [...NOTIFICATION_KEYS.all, "list"] as const,
  unreadCount: () => [...NOTIFICATION_KEYS.all, "unreadCount"] as const,
};

export function useNotificationsQuery(page = 1, limit = 20) {
  return useQuery({
    queryKey: [...NOTIFICATION_KEYS.lists(), page, limit],
    queryFn: async () => {
      const result = await fetchWithSchema(
        api.get(API_ROUTES.NOTIFICATION.LIST, {
          params: { page, limit },
        }),
        GetNotificationResponseSchema
      );
      return result.data;
    },
  });
}

export function useUnreadCountQuery() {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.unreadCount(),
    queryFn: async () => {
      const result = await fetchWithSchema(
        api.get(API_ROUTES.NOTIFICATION.UNREAD_COUNT),
        z.number()
      );
      return result.data;
    },
    refetchInterval: 1000 * 60, // Refresh every minute
  });
}

export function useMarkAsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id?: string) => api.patch(API_ROUTES.NOTIFICATION.MARK_READ(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, i18n.t("common.actionFailed")));
    },
  });
}
