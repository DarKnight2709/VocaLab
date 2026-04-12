import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, getErrorMessage } from "@/shared/lib/api";
import API_ROUTES from "@/shared/lib/api-routes";
import { toast } from "sonner";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface GrammarItem {
  id: string;
  title: string;
  structure: string;
  explanation: string;
  examples: string[] | null;
  category: string | null;
  level: string | null;
  isDefault: boolean;
  authorId: string | null;
  createdAt: string;
  author?: { id: string; username: string; fullName: string } | null;
}

export interface GrammarListResponse {
  items: GrammarItem[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface CreateGrammarBody {
  title: string;
  structure: string;
  explanation: string;
  examples?: string[];
  category?: string;
  level?: string;
}

// ──────────────────────────────────────────────
// Hooks
// ──────────────────────────────────────────────

export const useGrammarListQuery = (params: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  level?: string;
}) =>
  useQuery<GrammarListResponse>({
    queryKey: ["grammar", params],
    queryFn: async () => {
      const res = await api.get(API_ROUTES.GRAMMAR.LIST, { params });
      return res.data;
    },
    staleTime: 60_000,
  });

export const useGrammarCategoriesQuery = () =>
  useQuery<{ categories: string[] }>({
    queryKey: ["grammar-categories"],
    queryFn: async () => {
      const res = await api.get(API_ROUTES.GRAMMAR.CATEGORIES);
      return res.data;
    },
    staleTime: 300_000,
  });

export const useCreateGrammarMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateGrammarBody) =>
      api.post(API_ROUTES.GRAMMAR.CREATE, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grammar"] });
      queryClient.invalidateQueries({ queryKey: ["grammar-categories"] });
      toast.success("Tạo cấu trúc ngữ pháp thành công");
    },
    onError: (e) => toast.error(getErrorMessage(e, "Tạo thất bại")),
  });
};

export const useUpdateGrammarMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Partial<CreateGrammarBody>;
    }) => api.patch(API_ROUTES.GRAMMAR.UPDATE(id), body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grammar"] });
      toast.success("Cập nhật thành công");
    },
    onError: (e) => toast.error(getErrorMessage(e, "Cập nhật thất bại")),
  });
};

export const useDeleteGrammarMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(API_ROUTES.GRAMMAR.DELETE(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grammar"] });
      toast.success("Đã xóa cấu trúc ngữ pháp");
    },
    onError: (e) => toast.error(getErrorMessage(e, "Xóa thất bại")),
  });
};
