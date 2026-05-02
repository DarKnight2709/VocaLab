import { api, fetchWithSchema, getErrorMessage } from "@/shared/lib/api";
import API_ROUTES from "@/shared/lib/api-routes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PostVisibility } from "../../../shared/enums/PostVisibility.enum";
import {
  UpdateProfileResponseSchema,
  UserProfileDataResponseSchema,
  UserStatsResponseSchema,
  UserPostsResponseSchema,
  UserFollowersResponseSchema,
  UserFollowingResponseSchema,
  UserFriendsResponseSchema,
  UserMeFollowingResponseSchema,
  UserSocialsResponseSchema,
  CreateUserSocialResponseSchema,
  UpdateUserSocialResponseSchema,
  DeleteUserSocialResponseSchema,
  type UpdatePersonalInfoBodyType,
  type CreateUserSocialBody,
} from "@/shared/validations/UserSchema";
import { toast } from "sonner";


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
        UpdateProfileResponseSchema,
      );
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success(data.message || "Cập nhật thông tin cá nhân thành công.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Cập nhật thông tin thất bại."));
    },
  });
};

export const useStatsQuery = (userId: string | undefined) =>
  useQuery({
    queryKey: ["users", userId, "stats"] as const,
    queryFn: async () => {
      const result = await fetchWithSchema(
        api.get(API_ROUTES.USER.STATS(userId as string)),
        UserStatsResponseSchema,
      );
      return result.data;
    },
    enabled: !!userId,
  });

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

export const useCheckFollowingListQuery = (userId: string | undefined) =>
  useQuery({
    queryKey: ["users", userId, "me-following"] as const,
    queryFn: async () => {
      const result = await fetchWithSchema(
        api.get(API_ROUTES.USER.ME_FOLLOWING(userId as string)),
        UserMeFollowingResponseSchema,
      );
      return result.data;
    },
    enabled: !!userId,
  });

export const useFollowUserMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => api.post(API_ROUTES.USER.FOLLOW(userId)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["me"] }); // Invalidate current user stats too if needed
      toast.success("Theo dõi thành công");
    },
    onError: (err) => toast.error(getErrorMessage(err, "Theo dõi thất bại")),
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
      toast.success("Bỏ theo dõi thành công");
    },
    onError: (err) => toast.error(getErrorMessage(err, "Bỏ theo dõi thất bại")),
  });
};

export const useMySocialsQuery = () =>
  useQuery({
    queryKey: ["me", "socials"],
    queryFn: () =>
      fetchWithSchema(api.get(API_ROUTES.USER.MY_SOCIALS), UserSocialsResponseSchema),
  });


export const useCreateSocialMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateUserSocialBody) =>
      fetchWithSchema(
        api.post(API_ROUTES.USER.CREATE_SOCIAL, body),
        CreateUserSocialResponseSchema,
      ),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["me", "socials"] });
      toast.success(data.message || "Thêm liên kết mạng xã hội thành công");
    },
    onError: (err) =>
      toast.error(getErrorMessage(err, "Thêm liên kết thất bại")),
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
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["me", "socials"] });
      toast.success(data.message || "Cập nhật liên kết thành công");
    },
    onError: (err) =>
      toast.error(getErrorMessage(err, "Cập nhật liên kết thất bại")),
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
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["me", "socials"] });
      toast.success(data.message || "Xóa liên kết thành công");
    },
    onError: (err) => toast.error(getErrorMessage(err, "Xóa liên kết thất bại")),
  });
};

export const useDeleteAccountMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete(API_ROUTES.USER.DELETE_ACCOUNT),
    onSuccess: (data) => {
      qc.clear(); // Clear all cache
      toast.success(data.data.message || "Xóa tài khoản thành công");
    },
    onError: (err) => toast.error(getErrorMessage(err, "Xóa tài khoản thất bại")),
  });
};
