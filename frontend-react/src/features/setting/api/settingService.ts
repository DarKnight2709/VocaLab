import { api, getErrorMessage } from "@/shared/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import i18n from "@/shared/i18n";
import API_ROUTES from "@/shared/lib/api-routes";
import type { ScopeVisibilityType } from "@/shared/enums/ScopeVisibility.enum";

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