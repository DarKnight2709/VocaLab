import { api, fetchWithSchema, getErrorMessage } from "@/shared/lib/api";
import API_ROUTES from "@/shared/lib/api-routes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PostVisibility } from "../../../shared/enums/PostVisibility.enum";
import {
  UserProfileDataResponseSchema,
  UserPostsResponseSchema,
  UserFollowersResponseSchema,
  UserFollowingResponseSchema,
  UserFriendsResponseSchema,
  UserSocialsResponseSchema,
  CreateUserSocialResponseSchema,
  UpdateUserSocialResponseSchema,
  DeleteUserSocialResponseSchema,
  type UpdatePersonalInfoBodyType,
  type CreateUserSocialBody,
  getUpdateProfileResponseSchema,
  UserBlockedUsersResponseSchema,
} from "@/shared/validations/UserSchema";
import { toast } from "sonner";
import i18n from "@/shared/i18n";

export const useUpdatePersonalInfoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      body,
      file,
    }: {
      body: UpdatePersonalInfoBodyType;
      file?: File;
    }) => {
      const formData = new FormData();
      Object.entries(body).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value as string);
        }
      });
      if (file) {
        formData.append("avatar", file);
      }
      return fetchWithSchema(
        api.patch(API_ROUTES.USER.PROFILE, formData),
        getUpdateProfileResponseSchema(),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success(i18n.t("profile.updateSuccess"));
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, i18n.t("profile.updateFailed")));
    },
  });
};

export const useUserFollowersQuery = (
  userId: string | undefined,
  page = 1,
  limit = 12,
  search?: string,
) =>
  useQuery({
    queryKey: ["users", userId, "followers", page, search] as const,
    queryFn: async () => {
      const result = await fetchWithSchema(
        api.get(API_ROUTES.USER.getContentBy(userId as string, "followers"), {
          params: { page, limit, search },
        }),
        UserFollowersResponseSchema,
      );
      return result.data;
    },
    enabled: !!userId,
  });

export const useUserFollowingQuery = (
  userId: string | undefined,
  page = 1,
  limit = 12,
  search?: string,
) =>
  useQuery({
    queryKey: ["users", userId, "following", page, search] as const,
    queryFn: async () => {
      const result = await fetchWithSchema(
        api.get(API_ROUTES.USER.getContentBy(userId as string, "following"), {
          params: { page, limit, search },
        }),
        UserFollowingResponseSchema,
      );
      return result.data;
    },
    enabled: !!userId,
  });

export const useUserFriendsQuery = (
  userId: string | undefined,
  page = 1,
  limit = 12,
  search?: string,
) =>
  useQuery({
    queryKey: ["users", userId, "friends", page, search] as const,
    queryFn: async () => {
      const result = await fetchWithSchema(
        api.get(API_ROUTES.USER.getContentBy(userId as string, "friends"), {
          params: { page, limit, search },
        }),
        UserFriendsResponseSchema,
      );
      return result.data;
    },
    enabled: !!userId,
  });

export const useUserPostsQuery = (
  userId: string | undefined,
  page = 1,
  limit = 12,
  search?: string,
  visibility?: PostVisibility,
) =>
  useQuery({
    queryKey: ["users", userId, "posts", page, search, visibility] as const,
    queryFn: async () => {
      const result = await fetchWithSchema(
        api.get(API_ROUTES.USER.getContentBy(userId as string, "posts"), {
          params: { page, limit, search, visibility },
        }),
        UserPostsResponseSchema,
      );
      return result.data;
    },
    enabled: !!userId,
  });

export const useUserByUsernameQuery = (username: string | undefined) =>
  useQuery({
    queryKey: ["users", "profile-by-username", username] as const,
    queryFn: async () => {
      const result = await fetchWithSchema(
        api.get(API_ROUTES.USER.BY_USERNAME(username as string)),
        UserProfileDataResponseSchema,
      );
      return result.data;
    },
    staleTime: 30_000,
  });

export const useFollowUserMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => api.post(API_ROUTES.USER.FOLLOW(userId)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["me"] });
      toast.success(i18n.t("profile.followSuccess"));
    },
    onError: (err) =>
      toast.error(getErrorMessage(err, i18n.t("profile.followFailed"))),
  });
};

export const useUnfollowUserMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      api.delete(API_ROUTES.USER.UNFOLLOW(userId)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["me"] });
      toast.success(i18n.t("profile.unfollowSuccess"));
    },
    onError: (err) =>
      toast.error(getErrorMessage(err, i18n.t("profile.unfollowFailed"))),
  });
};

export const useMySocialsQuery = () =>
  useQuery({
    queryKey: ["me", "socials"],
    queryFn: () =>
      fetchWithSchema(
        api.get(API_ROUTES.USER.MY_SOCIALS),
        UserSocialsResponseSchema,
      ),
  });

export const useCreateSocialMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateUserSocialBody) =>
      fetchWithSchema(
        api.post(API_ROUTES.USER.CREATE_SOCIAL, body),
        CreateUserSocialResponseSchema,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me", "socials"] });
      toast.success(i18n.t("profile.socialAddSuccess"));
    },
    onError: (err) =>
      toast.error(getErrorMessage(err, i18n.t("profile.socialAddFailed"))),
  });
};

export const useUpdateSocialMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: CreateUserSocialBody }) =>
      fetchWithSchema(
        api.patch(API_ROUTES.USER.UPDATE_SOCIAL(id), body),
        UpdateUserSocialResponseSchema,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me", "socials"] });
      toast.success(i18n.t("profile.socialUpdateSuccess"));
    },
    onError: (err) =>
      toast.error(getErrorMessage(err, i18n.t("profile.socialUpdateFailed"))),
  });
};

export const useDeleteSocialMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchWithSchema(
        api.delete(API_ROUTES.USER.DELETE_SOCIAL(id)),
        DeleteUserSocialResponseSchema,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me", "socials"] });
      toast.success(i18n.t("profile.socialDeleteSuccess"));
    },
    onError: (err) =>
      toast.error(getErrorMessage(err, i18n.t("profile.socialDeleteFailed"))),
  });
};

export const useDeleteAccountMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete(API_ROUTES.USER.DELETE_ACCOUNT),
    onSuccess: () => {
      qc.clear();
      toast.success(i18n.t("profile.accountDeleteSuccess"));
    },
    onError: (err) =>
      toast.error(getErrorMessage(err, i18n.t("profile.accountDeleteFailed"))),
  });
};

export const useBlockUserMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      api.post(API_ROUTES.USER.BLOCK_USER(userId)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["me"] });
      toast.success(i18n.t("profile.blockSuccess"));
    },
    onError: (err) =>
      toast.error(getErrorMessage(err, i18n.t("profile.blockFailed"))),
  });
};

export const useUnblockUserMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      api.delete(API_ROUTES.USER.UNBLOCK_USER(userId)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["me"] });
      toast.success(i18n.t("profile.unblockSuccess"));
    },
    onError: (err) =>
      toast.error(getErrorMessage(err, i18n.t("profile.unblockFailed"))),
  });
};

export const useBlockedUsersQuery = (
  userId: string | undefined,
  page = 1,
  limit = 12,
  search?: string,
) =>
  useQuery({
    queryKey: ["users", userId, "blocked", page, search] as const,
    queryFn: async () => {
      const result = await fetchWithSchema(
        api.get(API_ROUTES.USER.GET_BLOCKED_USERS(userId as string), {
          params: { page, limit, search },
        }),
        UserBlockedUsersResponseSchema,
      );
      return result.data;
    },
    enabled: !!userId,
  });
