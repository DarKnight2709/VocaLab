


// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

import { api } from "@/shared/lib/api";
import API_ROUTES from "@/shared/lib/api-routes";
import type { BlogItem } from "@/shared/validations/BlogSchema";
import { useQuery } from "@tanstack/react-query";

export type UserResult = {
  id: string;
  username: string;
  fullName: string;
  avatar?: string | null;
};

export type GroupResult = {
  id: string;
  name: string;
  description?: string | null;
  avatar?: string | null;
  _count?: { members: number };
};

export type BlogResult = BlogItem;

export type CollectionResult = {
  id: string;
  name: string;
  description?: string | null;
  _count?: { cards: number };
};

// ──────────────────────────────────────────────
// Search hooks
// ──────────────────────────────────────────────

export const useUserSearch = (q: string) =>
  useQuery<UserResult[]>({
    queryKey: ["search", "users", q],
    queryFn: async () => {
      const res = await api.get(API_ROUTES.USER.SEARCH, { params: { q } });
      return (res.data?.users ?? res.data ?? []) as UserResult[];
    },
    enabled: q.length >= 1,
    staleTime: 30_000,
  });

export const useGroupSearch = (q: string) =>
  useQuery<GroupResult[]>({
    queryKey: ["search", "groups", q],
    queryFn: async () => {
      const res = await api.get(API_ROUTES.GROUP.GET_ALL, {
        params: { search: q },
      });
      return (res.data?.groups ?? res.data ?? []) as GroupResult[];
    },
    enabled: q.length >= 1,
    staleTime: 30_000,
  });

export const useBlogSearch = (q: string) =>
  useQuery<BlogResult[]>({
    queryKey: ["search", "blogs", q],
    queryFn: async () => {
      const res = await api.get(API_ROUTES.BLOG.LIST, {
        params: { search: q, limit: 20 },
      });
      return (res.data?.blogs ?? res.data ?? []) as BlogResult[];
    },
    enabled: q.length >= 1,
    staleTime: 30_000,
  });

export const useCollectionSearch = (q: string) =>
  useQuery<CollectionResult[]>({
    queryKey: ["search", "collections", q],
    queryFn: async () => {
      const res = await api.get(API_ROUTES.VOCABULARY.COLLECTIONS, {
        params: { search: q },
      });
      return (res.data?.collections ?? res.data ?? []) as CollectionResult[];
    },
    enabled: q.length >= 1,
    staleTime: 30_000,
  });