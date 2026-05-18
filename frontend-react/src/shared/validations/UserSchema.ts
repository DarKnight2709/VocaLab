import { z } from "zod";
import { VoteType } from "../enums/VoteType.enum";
import { SocialPlatform } from "../enums/SocialPlatform";
import i18n from "@/shared/i18n";

export const getUpdatePersonalInfoSchema = () =>
  z
    .object({
      fullName: z.string().trim().min(1, i18n.t("validation.fullNameRequired")).optional(),
      username: z.string().trim().min(1, i18n.t("validation.usernameRequired")).optional(),
      email: z.string().email(i18n.t("validation.invalidEmail")).optional().nullable(),
      avatar: z.string().optional().nullable(),
    })
    .strict()
    .strip();

export const getUpdateProfileResponseSchema = () =>
  z.object({
    id: z.string(),
    username: z.string(),
    fullName: z.string(),
    email: z.string().email(i18n.t("validation.invalidEmail")),
    avatar: z.string().optional().nullable(),
  });

export const UserCapabilitiesSchema = z.object({
  canFollow: z.boolean(),
  canChat: z.boolean(),
  canSeeFollowers: z.boolean(),
  canSeeFollowing: z.boolean(),
  canSeeFriends: z.boolean(),
});

export const UserStatsResponseSchema = z.object({
  followers: z.number(),
  following: z.number(),
  friends: z.number(),
  posts: z.number(),
});

export const UserProfileDataResponseSchema = z.object({
  id: z.string(),
  username: z.string(),
  fullName: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
  hasPassword: z.boolean().optional(),
  stats: UserStatsResponseSchema,
  isFollowing: z.boolean(),
  capabilities: UserCapabilitiesSchema,
});


export const UserSummarySchema = z.object({
  id: z.string(),
  username: z.string(),
  fullName: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
  isFollowing: z.boolean().optional(),
  canFollow: z.boolean().optional(),
});

export const UserFollowerItemSchema = UserSummarySchema;
export const UserFollowingItemSchema = UserSummarySchema;
export const UserFriendItemSchema = UserSummarySchema;
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


export const UserFriendsResponseSchema = z.object({
  friends: z.array(UserFriendItemSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

// Keep the union for compatibility if needed, or remove it once the split is complete.
export const UserProfileContentResponseSchema = z.union([
  UserFollowersResponseSchema,
  UserFollowingResponseSchema,
  UserFriendsResponseSchema,
  UserPostsResponseSchema,
]);



export const UserSocialItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  platform: z.nativeEnum(SocialPlatform),
  name: z.string().nullable(),
  link: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const getCreateUserSocialSchema = () =>
  z.object({
    platform: z.nativeEnum(SocialPlatform),
    name: z.string().optional().nullable(),
    link: z.string().url(i18n.t("validation.invalidLink")).min(1, i18n.t("validation.enterLink")),
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
export type CreateUserSocialBody = z.infer<
  ReturnType<typeof getCreateUserSocialSchema>
>;

export type UpdateProfileResponse = z.infer<
  ReturnType<typeof getUpdateProfileResponseSchema>
>;
export type UpdatePersonalInfoBodyType = z.infer<
  ReturnType<typeof getUpdatePersonalInfoSchema>
>;
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
