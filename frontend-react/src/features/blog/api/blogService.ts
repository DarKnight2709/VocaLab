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
import { BlogDetailSchema, BlogListResponseSchema } from "@/shared/validations/BlogSchema";
import type { VoteType } from "@/shared/enums/VoteType.enum";

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

export const useVoteBlogMutation = (blogId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (type: VoteType) =>
      api.post(API_ROUTES.BLOG.VOTE(blogId), { type }),
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

export const useEditCommentMutation = (blogId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      commentId,
      content,
    }: {
      commentId: string;
      content: string | undefined;
    }) => api.patch(API_ROUTES.BLOG.EDIT_COMMENT(commentId), {content}),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: blogKeys.detail(blogId),
      }),
    onError: (err) =>
      toast.error(getErrorMessage(err, "Cập nhật bình luận thất bại")),
  });
};
export const useReplyCommentMutation = (blogId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      commentId,
      reply,
    }: {
      commentId: string;
      reply: string | undefined;
    }) => api.post(API_ROUTES.BLOG.REPLY_COMMENT(commentId), {reply}),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: blogKeys.detail(blogId),
      }),
    onError: (err) =>
      toast.error(getErrorMessage(err, "Phản hồi bình luận thất bại")),
  });
};

export const useVoteCommentMutation = (blogId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      commentId,
      type,
    }: {
      commentId: string;
      type: VoteType;
    }) => api.post(API_ROUTES.BLOG.VOTE_COMMENT(commentId), { type }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: blogKeys.detail(blogId) }),
    onError: (err) => toast.error(getErrorMessage(err, "Thao tác thất bại")),
  });
};



