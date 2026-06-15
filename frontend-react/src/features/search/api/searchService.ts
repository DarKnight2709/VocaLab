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

export type SearchResults = {
  users?: UserResult[];
  groups?: GroupResult[];
  posts?: BlogResult[];
  collections?: CollectionResult[];
};

export const useSearch = (q: string, type: string) =>
  useQuery<SearchResults>({
    queryKey: ["search", type, q],
    queryFn: async () => {
      const res = await api.get(API_ROUTES.SEARCH.BASE, {
        params: { q, type },
      });
      return res.data;
    },
    enabled: q.length >= 1,
    staleTime: 30_000,
  });