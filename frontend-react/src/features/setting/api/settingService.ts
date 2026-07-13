import { api, fetchWithSchema, getErrorMessage } from "@/shared/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import i18n from "@/shared/i18n";
import API_ROUTES from "@/shared/lib/api-routes";
import type { ScopeVisibilityType } from "@/shared/enums/ScopeVisibility.enum";
import { 
  NotificationSettingSchema, 
  ReminderListResponseSchema,
  ReminderResponseSchema,
  ReminderDeleteResponseSchema,
  DailyGoalResponseSchema
} from "@/shared/validations/SettingSchema";

export const NOTIFICATION_KEYS = {
  settings: () => ["notifications", "settings"] as const,
};

export const REMINDER_KEYS = {
  all: () => ["reminders"] as const,
  list: (params?: object) => ["reminders", "list", params] as const,
};

export const DAILY_GOAL_KEYS = {
  detail: () => ["daily-goal"] as const,
};

export const useAllowFollowMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (allowFollow: boolean) =>
      api.patch(API_ROUTES.SETTING.ALLOW_FOLLOW, { allowFollow }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (err) => toast.error(getErrorMessage(err, i18n.t("profile.updateFailed"))),
  });
};

export const useUpdateFollowersTabVisibilityMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (followersTabVisibility: ScopeVisibilityType) =>
      api.patch(API_ROUTES.SETTING.FOLLOWERS_TAB_VISIBILITY, { followersTabVisibility }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (err) => toast.error(getErrorMessage(err, i18n.t("profile.updateFailed"))),
  });
};

export const useUpdateFollowingTabVisibilityMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (followingTabVisibility: ScopeVisibilityType) =>
      api.patch(API_ROUTES.SETTING.FOLLOWING_TAB_VISIBILITY, { followingTabVisibility }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (err) => toast.error(getErrorMessage(err, i18n.t("profile.updateFailed"))),
  });
};

export const useUpdateFriendTabVisibilityMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (friendTabVisibility: ScopeVisibilityType) =>
      api.patch(API_ROUTES.SETTING.FRIEND_TAB_VISIBILITY, { friendTabVisibility }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (err) => toast.error(getErrorMessage(err, i18n.t("profile.updateFailed"))),
  });
};

export const useUpdateGroupsTabVisibilityMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (groupsTabVisibility: ScopeVisibilityType) =>
      api.patch(API_ROUTES.SETTING.GROUPS_TAB_VISIBILITY, { groupsTabVisibility }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (err) => toast.error(getErrorMessage(err, i18n.t("profile.updateFailed"))),
  });
};

export const useUpdateMessageScopeMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (messageScope: ScopeVisibilityType) =>
      api.patch(API_ROUTES.SETTING.MESSAGE_SCOPE, { messageScope }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (err) => toast.error(getErrorMessage(err, i18n.t("profile.updateFailed"))),
  });
};


export function useNotificationSettingsQuery() {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.settings(),
    queryFn: async () => {
      const result = await fetchWithSchema(
        api.get(API_ROUTES.SETTING.NOTIFICATION.BASE),
        NotificationSettingSchema
      );
      return result.data;
    },
  });
}


export const useUpdateChatMessagesMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (chatMessages: string) =>
      api.patch(API_ROUTES.SETTING.NOTIFICATION.CHAT_MESSAGES, { chatMessages }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: NOTIFICATION_KEYS.settings() });
    },
    onError: (err) => toast.error(getErrorMessage(err, i18n.t("profile.updateFailed"))),
  });
};

export const useUpdateCommentsMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (comments: string) =>
      api.patch(API_ROUTES.SETTING.NOTIFICATION.COMMENTS, { comments }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: NOTIFICATION_KEYS.settings() });
    },
    onError: (err) => toast.error(getErrorMessage(err, i18n.t("profile.updateFailed"))),
  });
};

export const useUpdateUpvotesMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (upvotes: string) =>
      api.patch(API_ROUTES.SETTING.NOTIFICATION.UPVOTES, { upvotes }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: NOTIFICATION_KEYS.settings() });
    },
    onError: (err) => toast.error(getErrorMessage(err, i18n.t("profile.updateFailed"))),
  });
};



export const useUpdateNewFollowersMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (newFollowers: string) =>
      api.patch(API_ROUTES.SETTING.NOTIFICATION.NEW_FOLLOWERS, { newFollowers }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: NOTIFICATION_KEYS.settings() });
    },
    onError: (err) => toast.error(getErrorMessage(err, i18n.t("profile.updateFailed"))),
  });
};

export const useUpdateActivityFromFollowedMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (activityFromFollowed: string) =>
      api.patch(API_ROUTES.SETTING.NOTIFICATION.ACTIVITY_FROM_FOLLOWED, { activityFromFollowed }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: NOTIFICATION_KEYS.settings() });
    },
    onError: (err) => toast.error(getErrorMessage(err, i18n.t("profile.updateFailed"))),
  });
};


// Reminders
export function useRemindersQuery(page = 1, limit = 12, search = "") {
  return useQuery({
    queryKey: REMINDER_KEYS.list({ page, limit, search }),
    queryFn: async () => {
      const result = await fetchWithSchema(
        api.get(API_ROUTES.SETTING.REMINDER.BASE, { params: { page, limit, search } }),
        ReminderListResponseSchema
      );
      return result.data;
    },
  });
}

export const useCreateReminderMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const result = await fetchWithSchema(
        api.post(API_ROUTES.SETTING.REMINDER.BASE, data),
        ReminderResponseSchema
      );
      return result.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: REMINDER_KEYS.all() });
      toast.success(i18n.t("settings.reminder.createSuccess"));
    },
    onError: (err) => toast.error(getErrorMessage(err, i18n.t("settings.reminder.createFailed"))),
  });
};

export const useUpdateReminderMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const result = await fetchWithSchema(
        api.patch(API_ROUTES.SETTING.REMINDER.BY_ID(id), data),
        ReminderResponseSchema
      );
      return result.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: REMINDER_KEYS.all() });
      toast.success(i18n.t("settings.reminder.updateSuccess"));
    },
    onError: (err) => toast.error(getErrorMessage(err, i18n.t("settings.reminder.updateFailed"))),
  });
};

export const useToggleReminderMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(API_ROUTES.SETTING.REMINDER.TOGGLE(id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: REMINDER_KEYS.all() });
    },
    onError: (err) => toast.error(getErrorMessage(err, i18n.t("settings.reminder.updateFailed"))),
  });
};

export const useDeleteReminderMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await fetchWithSchema(
        api.delete(API_ROUTES.SETTING.REMINDER.BY_ID(id)),
        ReminderDeleteResponseSchema
      );
      return result.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: REMINDER_KEYS.all() });
      toast.success(i18n.t("settings.reminder.deleteSuccess"));
    },
    onError: (err) => toast.error(getErrorMessage(err, i18n.t("settings.reminder.deleteFailed"))),
  });
};

export function useDailyGoalQuery() {
  return useQuery({
    queryKey: DAILY_GOAL_KEYS.detail(),
    queryFn: async () => {
      const result = await fetchWithSchema(
        api.get(API_ROUTES.SETTING.DAILY_GOAL),
        DailyGoalResponseSchema
      );
      return result.data;
    },
  });
}

export const useUpdateDailyGoalMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dailyGoalMinutes: number) => {
      const result = await fetchWithSchema(
        api.patch(API_ROUTES.SETTING.DAILY_GOAL, { dailyGoalMinutes }),
        DailyGoalResponseSchema
      );
      return result.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DAILY_GOAL_KEYS.detail() });
      toast.success(i18n.t("settings.dailyGoal.updateSuccess"));
    },
    onError: (err) => toast.error(getErrorMessage(err, i18n.t("profile.updateFailed"))),
  });
};
