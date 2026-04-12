import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { api, fetchWithSchema, getErrorMessage } from "@/shared/lib/api";
import API_ROUTES from "@/shared/lib/api-routes";
import { toast } from "sonner";
import { z } from "zod";

// ──────────────────────────────────────────────
// Schemas
// ──────────────────────────────────────────────

const AuthorSchema = z.object({
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
  _count: z.object({ comments: z.number(), likes: z.number() }).optional(),
  isLiked: z.boolean().optional(),
});

const CommentSchema = z.object({
  id: z.string(),
  content: z.string(),
  createdAt: z.string(),
  author: AuthorSchema,
});

export const BlogDetailSchema = BlogItemSchema.extend({
  comments: z.array(CommentSchema).optional(),
});

const MetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

const BlogListResponseSchema = z.object({
  blogs: z.array(BlogItemSchema),
  meta: MetaSchema,
});

export type BlogItem = z.infer<typeof BlogItemSchema>;
export type BlogDetail = z.infer<typeof BlogDetailSchema>;
export type BlogComment = z.infer<typeof CommentSchema>;
export type BlogListResponse = z.infer<typeof BlogListResponseSchema>;

// ──────────────────────────────────────────────
// Query keys
// ──────────────────────────────────────────────

export const blogKeys = {
  all: ["blogs"] as const,
  list: (params?: object) => ["blogs", "list", params] as const,
  detail: (id: string) => ["blogs", "detail", id] as const,
  myList: () => ["blogs", "my"] as const,
};

// ──────────────────────────────────────────────
// Hooks
// ──────────────────────────────────────────────

export const useBlogsQuery = (page = 1, limit = 12, search = "") =>
  useQuery({
    queryKey: blogKeys.list({ page, limit, search }),
    queryFn: () =>
      fetchWithSchema(
        api.get(API_ROUTES.BLOG.LIST, {
          params: { page, limit, search: search || undefined },
        }),
        BlogListResponseSchema,
      ),
  });

export const useBlogsInfiniteQuery = (search = "") =>
  useInfiniteQuery({
    queryKey: blogKeys.list({ search, infinite: true }),
    queryFn: ({ pageParam = 1 }) =>
      fetchWithSchema(
        api.get(API_ROUTES.BLOG.LIST, {
          params: { page: pageParam, limit: 10, search: search || undefined },
        }),
        BlogListResponseSchema,
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.page < lastPage.meta.totalPages
        ? lastPage.meta.page + 1
        : undefined,
  });

export const useMyBlogsQuery = () =>
  useQuery({
    queryKey: blogKeys.myList(),
    queryFn: () =>
      fetchWithSchema(api.get(API_ROUTES.BLOG.MY_LIST), BlogListResponseSchema),
  });

export const useBlogDetailQuery = (id: string) =>
  useQuery({
    queryKey: blogKeys.detail(id),
    queryFn: () =>
      fetchWithSchema(
        api.get(API_ROUTES.BLOG.DETAIL(id)),
        z.object({ blog: BlogDetailSchema }),
      ),
    enabled: !!id,
  });

export const useCreateBlogMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      title: string;
      content: string;
      excerpt?: string;
      coverImage?: string;
      isPublic?: boolean;
    }) => api.post(API_ROUTES.BLOG.CREATE, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: blogKeys.all });
      toast.success("Đăng bài thành công!");
    },
    onError: (err) => toast.error(getErrorMessage(err, "Đăng bài thất bại")),
  });
};

export const useUpdateBlogMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<{
        title: string;
        content: string;
        excerpt: string;
        isPublic: boolean;
      }>;
    }) => api.patch(API_ROUTES.BLOG.UPDATE(id), data),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: blogKeys.detail(vars.id) });
      qc.invalidateQueries({ queryKey: blogKeys.all });
      toast.success("Cập nhật bài viết thành công!");
    },
    onError: (err) => toast.error(getErrorMessage(err, "Cập nhật thất bại")),
  });
};

export const useDeleteBlogMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(API_ROUTES.BLOG.DELETE(id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: blogKeys.all });
      toast.success("Xóa bài viết thành công!");
    },
    onError: (err) => toast.error(getErrorMessage(err, "Xóa thất bại")),
  });
};

export const useToggleLikeMutation = (blogId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(API_ROUTES.BLOG.TOGGLE_LIKE(blogId)),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: blogKeys.detail(blogId) }),
    onError: (err) => toast.error(getErrorMessage(err, "Thao tác thất bại")),
  });
};

export const useAddCommentMutation = (blogId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      api.post(API_ROUTES.BLOG.ADD_COMMENT(blogId), { content }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: blogKeys.detail(blogId) }),
    onError: (err) =>
      toast.error(getErrorMessage(err, "Gửi bình luận thất bại")),
  });
};

export const useDeleteCommentMutation = (blogId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) =>
      api.delete(API_ROUTES.BLOG.DELETE_COMMENT(commentId)),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: blogKeys.detail(blogId) }),
    onError: (err) =>
      toast.error(getErrorMessage(err, "Xóa bình luận thất bại")),
  });
};
