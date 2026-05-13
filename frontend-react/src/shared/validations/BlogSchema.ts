import z from "zod"
import { VoteType } from "../enums/VoteType.enum";
import type { VoteType as VoteTypeType } from "../enums/VoteType.enum";
import i18n from "@/shared/i18n";

export const getEditCommentSectionSchema = () =>
  z
    .object({
      content: z.string().trim().min(1, i18n.t("validation.fieldRequired")),
    })
    .strict()
    .strip();

export const VoteTypeSchema = z.enum([VoteType.UPVOTE, VoteType.DOWNVOTE]);

export const AuthorSchema = z.object({
  id: z.string(),
  username: z.string(),
  fullName: z.string(),
  avatar: z.string().nullable().optional(),
});

export const BlogItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  excerpt: z.string().nullable().optional(),
  coverImage: z.string().nullable().optional(),
  isPublic: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  author: AuthorSchema,
  _count: z.object({ comments: z.number() }).optional(),
  voteScore: z.number().optional(),
  userVote: VoteTypeSchema.nullable().optional(),
});

export type Author = {
  id: string,
  username: string,
  fullName: string,
  avatar?: string | null,
};


export type Comment = {
  id: string;
  content: string | null;
  blogId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  author: Author;
  parentCommentId?: string | null;
  replies: Comment[];
  voteScore?: number;
  userVote?: VoteTypeType | null;
};

export const CommentSchema: z.ZodType<Comment> = z.lazy(() =>
  z.object({
    id: z.string(),
    content: z.string().nullable(),
    blogId: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    deletedAt: z.string().nullable(),
    author: AuthorSchema,
    parentCommentId: z.string().nullable(),
    replies: z.array(CommentSchema).default([]),
    voteScore: z.number().optional(),
    userVote: VoteTypeSchema.nullable().optional(),
  })
);


export const BlogDetailSchema = BlogItemSchema.extend({
  comments: z.array(CommentSchema),
});

export const MetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

export const BlogListResponseSchema = z.object({
  blogs: z.array(BlogItemSchema),
  meta: MetaSchema,
});

export type BlogItem = z.infer<typeof BlogItemSchema>;
export type BlogDetail = z.infer<typeof BlogDetailSchema>;
export type BlogComment = z.infer<typeof CommentSchema>;
export type BlogListResponse = z.infer<typeof BlogListResponseSchema>;
export type EditCommentSectionBodyType = z.infer<
  ReturnType<typeof getEditCommentSectionSchema>
>;