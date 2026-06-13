import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, User, Users, BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/lib/api";
import API_ROUTES from "@/shared/lib/api-routes";
import ROUTES from "@/shared/lib/routes";
import Breadcrumb from "@/shared/components/Breadcrumb";
import { useTranslation } from "@/shared/hooks/useTranslation";

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
  const { t } = useTranslation();
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
            {group._count.members} {t("search.members")}
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
  const { t } = useTranslation();
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
          {t("search.by")} {blog.author.fullName}
        </p>
      </div>
    </Link>
  );
}

// ──────────────────────────────────────────────
// Main page
// ──────────────────────────────────────────────

export default function SearchPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const qParam = searchParams.get("q") || "";

  const [activeTab, setActiveTab] = useState<Tab>("users");

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "users", label: t("search.tabs.users"), icon: <User size={15} /> },
    { key: "groups", label: t("search.tabs.groups"), icon: <Users size={15} /> },
    { key: "blogs", label: t("search.tabs.blogs"), icon: <BookOpen size={15} /> },
  ];

  const { data: users = [], isFetching: usersLoading } =
    useUserSearch(qParam);
  const { data: groups = [], isFetching: groupsLoading } =
    useGroupSearch(qParam);
  const { data: blogs = [], isFetching: blogsLoading } =
    useBlogSearch(qParam);

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
    <div className="h-full overflow-y-auto p-6 bg-background">
      <div className="max-w-6xl mx-auto w-full">
        <div className="max-w-2xl">
          <div className="mb-6">
            <Breadcrumb items={[{ label: t("search.title") }]} />
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
            {qParam && counts[tab.key] > 0 && (
              <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                {counts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Results */}
        {!qParam ? (
        <div className="py-16 text-center text-muted-foreground">
          <Search size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">{t("search.enterKeyword")}</p>
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
              <Empty query={qParam} type={t("search.types.users")} />
            ) : (
              users.map((u) => <UserCard key={u.id} user={u} />)
            ))}
          {activeTab === "groups" &&
            (groups.length === 0 ? (
              <Empty query={qParam} type={t("search.types.groups")} />
            ) : (
              groups.map((g) => <GroupCard key={g.id} group={g} />)
            ))}
          {activeTab === "blogs" &&
            (blogs.length === 0 ? (
              <Empty query={qParam} type={t("search.types.posts")} />
            ) : (
              blogs.map((b) => <BlogCard key={b.id} blog={b} />)
            ))}
        </div>
      )}
        </div>
      </div>
    </div>
  );
}

function Empty({ query, type }: { query: string; type: string }) {
  const { t } = useTranslation();
  return (
    <div className="py-12 text-center text-muted-foreground">
      {t("search.noResults", { type, query })}
    </div>
  );
}
