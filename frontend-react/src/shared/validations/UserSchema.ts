import { z } from "zod";
import { VoteType } from "../enums/VoteType.enum";
import { SocialPlatform } from "../enums/SocialPlatform";

export const UpdatePersonalInfoSchema = z
  .object({
    fullName: z.string().trim().min(1, "Họ và tên không được để trống").optional(),
    username: z.string().trim().min(1, "Tên đăng nhập không được để trống").optional(),
    email: z.string().email("Email không hợp lệ").optional().nullable(),
    avatar: z.string().optional().nullable(),
  })
  .strict()
  .strip();

export const UpdateProfileResponseSchema = z.object({
  id: z.string(),
  username: z.string(),
  fullName: z.string(),
  email: z.string().email("Email không hợp lệ"),
  avatar: z.string().optional().nullable(),
});

export const UserProfileDataResponseSchema = z.object({
  id: z.string(),
  username: z.string(),
  fullName: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
});


export const UserFollowerItemSchema = UserProfileDataResponseSchema;
export const UserFollowingItemSchema = UserProfileDataResponseSchema;
export const UserFriendItemSchema = UserProfileDataResponseSchema;
export const UserPostItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  excerpt: z.string().optional().nullable(),
  coverImage: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  isPublic: z.boolean(),
  voteScore: z.number().optional(),
  userVote: z.enum([VoteType.UPVOTE, VoteType.DOWNVOTE]).nullable().optional(),
  _count: z.object({ comments: z.number() }).optional(),
});

export const UserPostsResponseSchema = z.object({
  posts: z.array(UserPostItemSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const UserFollowersResponseSchema = z.object({
  followers: z.array(UserFollowerItemSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const UserFollowingResponseSchema = z.object({
  following: z.array(UserFollowingItemSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const UserMeFollowingResponseSchema = z.object({
  isFollowing: z.boolean(),
});

export const UserFriendsResponseSchema = z.object({
  friends: z.array(UserFriendItemSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

// Giữ lại union để tương thích nếu cần, hoặc xóa nếu đã tách hoàn toàn
export const UserProfileContentResponseSchema = z.union([
  UserFollowersResponseSchema,
  UserFollowingResponseSchema,
  UserFriendsResponseSchema,
  UserPostsResponseSchema,
]);

export const UserStatsResponseSchema = z.object({
  followers: z.number(),
  following: z.number(),
  friends: z.number(),
  posts: z.number(),
});

export const UserSocialItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  platform: z.nativeEnum(SocialPlatform),
  name: z.string().nullable(),
  link: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateUserSocialSchema = z.object({
  platform: z.nativeEnum(SocialPlatform),
  name: z.string().optional().nullable(),
  link: z.string().url("Link không hợp lệ").min(1, "Vui lòng nhập link"),
});

export const UserSocialsResponseSchema = z.array(UserSocialItemSchema);
export const CreateUserSocialResponseSchema = UserSocialItemSchema;
export const UpdateUserSocialResponseSchema = UserSocialItemSchema;
export const DeleteUserSocialResponseSchema = z.object({
  id: z.string(),
});

export const FollowUserResponseSchema = z.object({
  message: z.string().optional(),
});

export const UnfollowUserResponseSchema = z.object({
  message: z.string().optional(),
});




export type UserSocialItem = z.infer<typeof UserSocialItemSchema>;
export type CreateUserSocialBody = z.infer<typeof CreateUserSocialSchema>;

export type UpdateProfileResponse = z.infer<typeof UpdateProfileResponseSchema>;
export type UpdatePersonalInfoBodyType = z.infer<typeof UpdatePersonalInfoSchema>;
export type UserProfileDataResponse = z.infer<
  typeof UserProfileDataResponseSchema
>;
export type UserStatsResponse = z.infer<typeof UserStatsResponseSchema>;
export type UserPostItem = z.infer<typeof UserPostItemSchema>;
export type UserPostsResponse = z.infer<typeof UserPostsResponseSchema>;
export type UserFollowersResponse = z.infer<typeof UserFollowersResponseSchema>;
export type UserFollowingResponse = z.infer<typeof UserFollowingResponseSchema>;
export type UserFriendsResponse = z.infer<typeof UserFriendsResponseSchema>;
export type UserProfileContentResponse = z.infer<
  typeof UserProfileContentResponseSchema
>;
