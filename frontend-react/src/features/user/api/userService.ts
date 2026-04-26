import { api, fetchWithSchema, getErrorMessage } from "@/shared/lib/api";
import API_ROUTES from "@/shared/lib/api-routes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PostVisibility } from "../../../shared/enums/PostVisibility.enum";
import {
  UserProfileDataResponseSchema,
  UserStatsResponseSchema,
  UserPostsResponseSchema,
  UserFollowersResponseSchema,
  UserFollowingResponseSchema,
  UserFriendsResponseSchema,
  UserMeFollowingResponseSchema,
} from "@/shared/validations/UserSchema";
import { toast } from "sonner";

export const useStatsQuery = (userId: string | undefined) =>
  useQuery({
    queryKey: ["users", userId, "stats"] as const,
    queryFn: () =>
      fetchWithSchema(
        api.get(API_ROUTES.USER.STATS(userId as string)),
        UserStatsResponseSchema,
      ),
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
    queryFn: () =>
      fetchWithSchema(
        api.get(API_ROUTES.USER.getContentBy(userId as string, "followers"), {
          params: { page, limit, search },
        }),
        UserFollowersResponseSchema,
      ),
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
    queryFn: () =>
      fetchWithSchema(
        api.get(API_ROUTES.USER.getContentBy(userId as string, "following"), {
          params: { page, limit, search },
        }),
        UserFollowingResponseSchema,
      ),
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
    queryFn: () =>
      fetchWithSchema(
        api.get(API_ROUTES.USER.getContentBy(userId as string, "friends"), {
          params: { page, limit, search },
        }),
        UserFriendsResponseSchema,
      ),
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
    queryFn: () =>
      fetchWithSchema(
        api.get(API_ROUTES.USER.getContentBy(userId as string, "posts"), {
          params: { page, limit, search, visibility },
        }),
        UserPostsResponseSchema,
      ),
    enabled: !!userId,
  });

export const useUserByUsernameQuery = (username: string | undefined) =>
  useQuery({
    queryKey: ["users", "profile-by-username", username] as const,
    queryFn: () =>
      fetchWithSchema(
        api.get(API_ROUTES.USER.BY_USERNAME(username as string)),
        UserProfileDataResponseSchema,
      ),
    staleTime: 30_000,
  });

export const useCheckFollowingListQuery = (userId: string | undefined) =>
  useQuery({
    queryKey: ["users", userId, "me-following"] as const,
    queryFn: () =>
      fetchWithSchema(
        api.get(API_ROUTES.USER.ME_FOLLOWING(userId as string)),
        UserMeFollowingResponseSchema,
      ),
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
