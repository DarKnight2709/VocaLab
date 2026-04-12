import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Search, User, Users, BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/lib/api";
import API_ROUTES from "@/shared/lib/api-routes";
import ROUTES from "@/shared/lib/routes";
import Breadcrumb from "@/shared/components/Breadcrumb";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

type UserResult = {
  id: string;
  username: string;
  fullName: string;
  avatar?: string | null;
};

type GroupResult = {
  id: string;
  name: string;
  description?: string | null;
  avatar?: string | null;
  _count?: { members: number };
};

type BlogResult = {
  id: string;
  title: string;
  excerpt?: string | null;
  coverImage?: string | null;
  createdAt: string;
  author: { id: string; fullName: string; avatar?: string | null };
};

type Tab = "users" | "groups" | "blogs";

// ──────────────────────────────────────────────
// Search hooks
// ──────────────────────────────────────────────

const useUserSearch = (q: string) =>
  useQuery<UserResult[]>({
    queryKey: ["search", "users", q],
    queryFn: async () => {
      const res = await api.get(API_ROUTES.USER.SEARCH, { params: { q } });
      return (res.data?.users ?? res.data ?? []) as UserResult[];
    },
    enabled: q.length >= 1,
    staleTime: 30_000,
  });

const useGroupSearch = (q: string) =>
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

const useBlogSearch = (q: string) =>
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

// ──────────────────────────────────────────────
// Result card components
// ──────────────────────────────────────────────

function UserCard({ user }: { user: UserResult }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-shadow hover:shadow-sm">
      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-muted">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.fullName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-bold uppercase text-muted-foreground">
            {user.fullName[0]}
          </div>
        )}
      </div>
      <div>
        <p className="font-medium">{user.fullName}</p>
        <p className="text-sm text-muted-foreground">@{user.username}</p>
      </div>
    </div>
  );
}

function GroupCard({ group }: { group: GroupResult }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-shadow hover:shadow-sm">
      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-muted">
        {group.avatar ? (
          <img
            src={group.avatar}
            alt={group.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Users size={20} className="text-muted-foreground" />
          </div>
        )}
      </div>
      <div>
        <p className="font-medium">{group.name}</p>
        {group._count && (
          <p className="text-sm text-muted-foreground">
            {group._count.members} thành viên
          </p>
        )}
        {group.description && (
          <p className="line-clamp-1 text-sm text-muted-foreground">
            {group.description}
          </p>
        )}
      </div>
    </div>
  );
}

function BlogCard({ blog }: { blog: BlogResult }) {
  return (
    <Link
      to={ROUTES.BLOG_DETAIL.url.replace(":id", blog.id)}
      className="flex gap-4 rounded-xl border bg-card p-4 transition-shadow hover:shadow-sm"
    >
      {blog.coverImage && (
        <img
          src={blog.coverImage}
          alt={blog.title}
          className="h-20 w-28 shrink-0 rounded-lg object-cover"
        />
      )}
      <div className="min-w-0">
        <p className="font-medium line-clamp-2">{blog.title}</p>
        {blog.excerpt && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {blog.excerpt}
          </p>
        )}
        <p className="mt-2 text-xs text-muted-foreground">
          bởi {blog.author.fullName}
        </p>
      </div>
    </Link>
  );
}

// ──────────────────────────────────────────────
// Main page
// ──────────────────────────────────────────────

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "users", label: "Người dùng", icon: <User size={15} /> },
  { key: "groups", label: "Nhóm", icon: <Users size={15} /> },
  { key: "blogs", label: "Bài viết", icon: <BookOpen size={15} /> },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("users");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => setDebouncedQuery(query.trim()),
      400,
    );
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const { data: users = [], isFetching: usersLoading } =
    useUserSearch(debouncedQuery);
  const { data: groups = [], isFetching: groupsLoading } =
    useGroupSearch(debouncedQuery);
  const { data: blogs = [], isFetching: blogsLoading } =
    useBlogSearch(debouncedQuery);

  const counts: Record<Tab, number> = {
    users: users.length,
    groups: groups.length,
    blogs: blogs.length,
  };
  const loading =
    activeTab === "users"
      ? usersLoading
      : activeTab === "groups"
        ? groupsLoading
        : blogsLoading;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <Breadcrumb items={[{ label: "Tìm kiếm" }]} />
      <h1 className="mb-6 text-2xl font-bold">Tìm kiếm</h1>

      {/* Search input */}
      <div className="relative mb-6">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm người dùng, nhóm, bài viết..."
          className="w-full rounded-2xl border bg-background py-3 pl-11 pr-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-xl border bg-muted/30 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.icon}
            {tab.label}
            {debouncedQuery && counts[tab.key] > 0 && (
              <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                {counts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Results */}
      {!debouncedQuery ? (
        <div className="py-16 text-center text-muted-foreground">
          <Search size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nhập từ khóa để tìm kiếm</p>
        </div>
      ) : loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {activeTab === "users" &&
            (users.length === 0 ? (
              <Empty query={debouncedQuery} type="người dùng" />
            ) : (
              users.map((u) => <UserCard key={u.id} user={u} />)
            ))}
          {activeTab === "groups" &&
            (groups.length === 0 ? (
              <Empty query={debouncedQuery} type="nhóm" />
            ) : (
              groups.map((g) => <GroupCard key={g.id} group={g} />)
            ))}
          {activeTab === "blogs" &&
            (blogs.length === 0 ? (
              <Empty query={debouncedQuery} type="bài viết" />
            ) : (
              blogs.map((b) => <BlogCard key={b.id} blog={b} />)
            ))}
        </div>
      )}
    </div>
  );
}

function Empty({ query, type }: { query: string; type: string }) {
  return (
    <div className="py-12 text-center text-muted-foreground">
      Không tìm thấy {type} nào cho "
      <span className="font-medium text-foreground">{query}</span>"
    </div>
  );
}
