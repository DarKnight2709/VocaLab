import { useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  User,
  Users,
  BookOpen,
  LayoutGrid,
  Layers,
  ArrowRight,
} from "lucide-react";
import Breadcrumb from "@/shared/components/Breadcrumb";
import { useTranslation } from "@/shared/hooks/useTranslation";
import {
  useSearchSidebar,
  useSearchInfinite,
  type SearchFilters,
} from "../api/searchService";
import type {
  SearchCollectionResult as CollectionResult,
  SearchGroupResult as GroupResult,
  SearchUserResult as UserResult,
} from "@/shared/validations/SearchSchema";
import type { BlogItem as BlogResult } from "@/shared/validations/BlogSchema";
import { BlogCard } from "../components/BlogCard";
import { CollectionCard } from "../components/CollectionCard";
import { GroupCard } from "../components/GroupCard";
import { UserCard } from "@/features/user/components/UserCard";
import Empty from "@/shared/components/Empty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

type Tab = "all" | "collections" | "posts" | "groups" | "profiles";

type SearchSortOption = "newest" | "oldest" | "popular";
type SearchProfileSortOption = "all" | "friends" | "mutual-friends";
type SearchTimeOption = "all" | "24h" | "7d" | "30d" | "1y";

const SEARCH_SORT_OPTIONS: { value: SearchSortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "popular", label: "Popular" },
];

const SEARCH_PROFILE_SORT_OPTIONS: {
  value: SearchProfileSortOption;
  label: string;
}[] = [
  { value: "all", label: "All" },
  { value: "friends", label: "Friends" },
  {
    value: "mutual-friends",
    label: "Mutual Friends",
  },
];

const SEARCH_TIME_OPTIONS: { value: SearchTimeOption; label: string }[] = [
  { value: "all", label: "All time" },
  { value: "24h", label: "Past 24 hours" },
  { value: "7d", label: "Past week" },
  { value: "30d", label: "Past month" },
  { value: "1y", label: "Past year" },
];

const VALID_SORT_VALUES: SearchSortOption[] = ["newest", "oldest", "popular"];
const VALID_PROFILE_SORT_VALUES: SearchProfileSortOption[] = [
  "all",
  "friends",
  "mutual-friends",
];

const VALID_TIME_VALUES: SearchTimeOption[] = ["all", "24h", "7d", "30d", "1y"];

export default function SearchPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const qParam = searchParams.get("q") || "";
  const typeParam = searchParams.get("type") || "all";
  const sortParam = searchParams.get("sort") || "newest";
  const profileSortParam = searchParams.get("profileSort") || "all";
  const timeParam = searchParams.get("time") || "all";

  const handleTabChange = (tab: Tab) => {
    const newParams = new URLSearchParams();
    // Only preserve the search query
    if (qParam) newParams.set("q", qParam);
    newParams.set("type", tab);
    setSearchParams(newParams);
  };

  const updateSearchParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set(key, value);
    setSearchParams(newParams);
  };

  const activeTab = useMemo(() => {
    const validTabs: Tab[] = [
      "all",
      "collections",
      "posts",
      "groups",
      "profiles",
    ];
    return validTabs.includes(typeParam as Tab) ? (typeParam as Tab) : "all";
  }, [typeParam]);

  const activeSort = VALID_SORT_VALUES.includes(sortParam as SearchSortOption)
    ? (sortParam as SearchSortOption)
    : "newest";

  const activeProfileSort = VALID_PROFILE_SORT_VALUES.includes(
    profileSortParam as SearchProfileSortOption,
  )
    ? (profileSortParam as SearchProfileSortOption)
    : "all";

  const activeTime = VALID_TIME_VALUES.includes(timeParam as SearchTimeOption)
    ? (timeParam as SearchTimeOption)
    : "all";

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "all", label: t("search.tabs.all"), icon: <Layers size={15} /> },
    {
      key: "collections",
      label: t("search.tabs.collections"),
      icon: <LayoutGrid size={15} />,
    },
    {
      key: "posts",
      label: t("search.tabs.posts"),
      icon: <BookOpen size={15} />,
    },
    {
      key: "groups",
      label: t("search.tabs.groups"),
      icon: <Users size={15} />,
    },
    {
      key: "profiles",
      label: t("search.tabs.profiles"),
      icon: <User size={15} />,
    },
  ];

  const { data: sidebarData, isFetching: loadingSidebar } = useSearchSidebar(
    qParam,
    activeTab === "all",
    { sort: activeSort, time: activeTime },
  );
  const infiniteSearchType = activeTab === "all" ? "posts" : activeTab;
  const filters: SearchFilters = (() => {
    if (activeTab === "posts" || activeTab === "all") {
      return { sort: activeSort, time: activeTime };
    }
    if (activeTab === "profiles") {
      return { profileSort: activeProfileSort };
    }
    return {};
  })();

  const {
    data: infiniteData,
    isLoading: loadingInfinite,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSearchInfinite(qParam, infiniteSearchType, filters);

  const isAllPage = activeTab === "all";
  const isPostsPage = activeTab === "posts";

  // Data mapping from summary vs infinite sources
  const summaryProfiles = sidebarData?.profiles ?? [];
  const summaryGroups = sidebarData?.groups ?? [];
  const summaryCollections = sidebarData?.collections ?? [];

  const infinitePages = infiniteData?.pages ?? [];

  // Normalise each page based on active type — the API returns different shapes per endpoint
  // 1. Memoize the flattened list properly
  const blogs = useMemo<BlogResult[]>(() => {
    return infiniteData?.pages.flatMap((p) => p.blogs ?? []) ?? [];
  }, [infiniteData?.pages]);

  // 2. Optimized Intersection Observer
  const observerRef = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) observerRef.current.disconnect();
      if (!node) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        },
        { rootMargin: "200px" },
      );

      observerRef.current.observe(node);
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );
  const collections = isAllPage
    ? summaryCollections
    : infinitePages.flatMap((p) =>
        infiniteSearchType === "collections" ? (p.collections ?? []) : [],
      );
  const profiles =
    isAllPage || isPostsPage
      ? summaryProfiles
      : infinitePages.flatMap((p) =>
          infiniteSearchType === "profiles" ? (p.profiles ?? []) : [],
        );
  const groups =
    isAllPage || isPostsPage
      ? summaryGroups
      : infinitePages.flatMap((p) =>
          infiniteSearchType === "groups" ? (p.groups ?? []) : [],
        );

  const loading = isAllPage
    ? loadingSidebar || loadingInfinite
    : loadingInfinite;

  const counts = useMemo(
    () => ({
      all: profiles.length + groups.length + blogs.length + collections.length,
      profiles: profiles.length,
      groups: groups.length,
      posts: blogs.length,
      collections: collections.length,
    }),
    [profiles.length, groups.length, blogs.length, collections.length],
  );

  type SectionLayout = "grid" | "list" | "sidebar";

  const renderSection = (
    title: string,
    items: { id: string }[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CardComponent: React.ComponentType<any>,
    tabKey: Tab,
    layout: SectionLayout = "grid",
    limit = 4,
  ) => {
    if (items.length === 0) return null;

    const propKey =
      tabKey === "posts"
        ? "blog"
        : tabKey === "profiles"
          ? "user"
          : tabKey.slice(0, -1);
    const contentClass =
      layout === "grid"
        ? "grid gap-3 sm:grid-cols-1 md:grid-cols-2"
        : layout === "list"
          ? "flex flex-col gap-2"
          : "flex flex-col gap-2";

    return (
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <button
            onClick={() => handleTabChange(tabKey)}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            {t("search.seeMore")} <ArrowRight size={12} />
          </button>
        </div>
        <div className={contentClass}>
          {items.slice(0, limit).map((item) => (
            <CardComponent key={item.id} {...{ [propKey]: item }} />
          ))}
        </div>
      </section>
    );
  };

  const renderSidebar = () => {
    if (groups.length === 0 && profiles.length === 0) return null;

    return (
      <aside className="min-w-0 lg:sticky lg:top-2 lg:mt-6 lg:self-start">
        <div className="rounded-2xl bg-zinc-50/90 p-4 lg:h-[calc(100dvh-9rem)] lg:overflow-hidden dark:bg-zinc-900/30">
          <div className="space-y-6 lg:h-full lg:overflow-y-auto lg:pr-1 custom-scrollbar lg:[scrollbar-gutter:stable]">
            {renderSection(
              t("search.tabs.groups"),
              groups,
              GroupCard,
              "groups",
              "sidebar",
              5,
            )}
            {renderSection(
              t("search.tabs.profiles"),
              profiles,
              UserCard,
              "profiles",
              "sidebar",
              5,
            )}
          </div>
        </div>
      </aside>
    );
  };

  const renderPostsList = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        {blogs.map((blog: BlogResult) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}

        <div ref={lastElementRef} className="h-10 w-full" />
      </div>

      {isFetchingNextPage && (
        <div className="py-4 text-center text-sm text-muted-foreground">
          {t("search.loading")}
        </div>
      )}
    </div>
  );

  const renderPostFilters = () => (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
      <Select
        value={activeSort}
        onValueChange={(value) => updateSearchParam("sort", value)}
      >
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SEARCH_SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={activeTime}
        onValueChange={(value) => updateSearchParam("time", value)}
      >
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SEARCH_TIME_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const renderProfileFilters = () => (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
      <Select
        value={activeProfileSort}
        onValueChange={(value) => updateSearchParam("profileSort", value)}
      >
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SEARCH_PROFILE_SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto p-6 bg-background">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6">
          <Breadcrumb items={[{ label: t("search.title") }]} />
        </div>

        {/* Tabs */}
        <div className="mb-2 flex gap-1 overflow-x-auto rounded-xl p-1 no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex shrink-0 items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-base font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Results */}
        {!qParam ? (
          <div className="py-20 text-center text-muted-foreground">
            <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
              <Search size={40} className="opacity-20" />
            </div>
            <p className="text-sm font-medium">{t("search.enterKeyword")}</p>
          </div>
        ) : loading && activeTab !== "all" ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-xl bg-muted/50"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-10">
            {activeTab === "all" && (
              <>
                {renderPostFilters()}
                {counts.all === 0 && !loading ? (
                  <Empty query={qParam} type={t("search.types.all")} />
                ) : (
                  <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
                    {/* Left column: collections + posts */}
                    <div className="min-w-0 space-y-8">
                      {renderSection(
                        t("search.tabs.collections"),
                        collections,
                        CollectionCard,
                        "collections",
                        "grid",
                        4,
                      )}
                      {blogs.length > 0 && (
                        <section className="space-y-3">
                          <div className="flex items-center justify-between px-1">
                            <h3 className="text-sm font-semibold text-foreground">
                              {t("search.tabs.posts")}
                            </h3>
                            <button
                              onClick={() => handleTabChange("posts")}
                              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                            >
                              {t("search.seeMore")} <ArrowRight size={12} />
                            </button>
                          </div>
                          {renderPostsList()}
                        </section>
                      )}
                    </div>

                    {/* Right column: groups + users */}
                    {renderSidebar()}
                  </div>
                )}
              </>
            )}

            {activeTab === "profiles" && (
              <>
                {renderProfileFilters()}
                {profiles.length === 0 ? (
                  <Empty query={qParam} type={t("search.types.profiles")} />
                ) : (
                  <div className="space-y-6">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {profiles.map((u: UserResult) => (
                        <UserCard key={u.id} user={u} />
                      ))}
                    </div>
                    <div ref={lastElementRef} className="h-10 w-full" />
                    {isFetchingNextPage && (
                      <div className="py-4 text-center text-sm text-muted-foreground">
                        {t("search.loading")}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {activeTab === "groups" &&
              (groups.length === 0 ? (
                <Empty query={qParam} type={t("search.types.groups")} />
              ) : (
                <div className="space-y-6">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {groups.map((g: GroupResult) => (
                      <GroupCard key={g.id} group={g} />
                    ))}
                  </div>
                  <div ref={lastElementRef} className="h-10 w-full" />
                  {isFetchingNextPage && (
                    <div className="py-4 text-center text-sm text-muted-foreground">
                      {t("search.loading")}
                    </div>
                  )}
                </div>
              ))}

            {activeTab === "posts" && (
              <>
                {renderPostFilters()}
                {blogs.length === 0 && !loading ? (
                  <Empty query={qParam} type={t("search.types.posts")} />
                ) : (
                  <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
                    {renderPostsList()}
                    {renderSidebar()}
                  </div>
                )}
              </>
            )}

            {activeTab === "collections" &&
              (collections.length === 0 ? (
                <Empty query={qParam} type={t("search.types.collections")} />
              ) : (
                <div className="space-y-6">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {collections.map((c: CollectionResult) => (
                      <CollectionCard key={c.id} collection={c} />
                    ))}
                  </div>
                  <div ref={lastElementRef} className="h-10 w-full" />
                  {isFetchingNextPage && (
                    <div className="py-4 text-center text-sm text-muted-foreground">
                      {t("search.loading")}
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
