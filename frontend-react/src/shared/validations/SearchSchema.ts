import { z } from "zod";
import { BlogItemSchema } from "./BlogSchema";
import { UserSummarySchema } from "./UserSchema";

export const SearchSuggestionResultSchema = z.object({
  id: z.string(),
  text: z.string(),
});

export const SearchSuggestionListSchema = z.array(SearchSuggestionResultSchema);

export const SearchUserResultSchema = UserSummarySchema;

export const SearchGroupMemberSchema = z.object({
  user: SearchUserResultSchema,
});

export const SearchGroupResultSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  avatar: z.string().nullable().optional(),
  ownerId: z.string().optional(),
  isActive: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  deletedAt: z.string().nullable().optional(),
  owner: SearchUserResultSchema.optional(),
  _count: z.object({ members: z.number() }).optional(),
  members: z.array(SearchGroupMemberSchema).optional(),
});

export const SearchCollectionResultSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  _count: z.object({ cards: z.number() }).optional(),
});

export const SearchPaginationMetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

export const SearchInfiniteResponseSchema = z.object({
  blogs: z.array(BlogItemSchema).optional(),
  collections: z.array(SearchCollectionResultSchema).optional(),
  groups: z.array(SearchGroupResultSchema).optional(),
  profiles: z.array(SearchUserResultSchema).optional(),
  meta: SearchPaginationMetaSchema.optional(),
});

export type SearchSuggestionResult = z.infer<typeof SearchSuggestionResultSchema>;
export type SearchUserResult = z.infer<typeof SearchUserResultSchema>;
export type SearchGroupMember = z.infer<typeof SearchGroupMemberSchema>;
export type SearchGroupResult = z.infer<typeof SearchGroupResultSchema>;
export type SearchCollectionResult = z.infer<typeof SearchCollectionResultSchema>;
export type SearchPaginationMeta = z.infer<typeof SearchPaginationMetaSchema>;
export const SearchSidebarResponseSchema = z.object({
  profiles: z.array(SearchUserResultSchema),
  groups: z.array(SearchGroupResultSchema),
  collections: z.object({
    collections: z.array(SearchCollectionResultSchema),
    meta: SearchPaginationMetaSchema,
  }),
});

export type SearchInfiniteResponse = z.infer<typeof SearchInfiniteResponseSchema>;
export type SearchSidebarResponse = z.infer<typeof SearchSidebarResponseSchema>;
