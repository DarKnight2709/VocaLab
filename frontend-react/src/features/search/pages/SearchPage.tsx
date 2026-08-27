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
  SlidersHorizontal,
} from "lucide-react";
import Breadcrumb from "@/shared/components/Breadcrumb";
import { useTranslation } from "@/shared/hooks/useTranslation";
import {
  useSearchSidebar,
  useSearchInfinite,
  type SearchFilters,
} from "../api/searchService";
import { useOptionalAuth } from "@/features/auth/hooks/useOptionalAuth";
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
import { LanguagePicker } from "@/features/chat/components/LanguagePicker";
import Empty from "@/shared/components/Empty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

type Tab = "all" | "collections" | "posts" | "groups" | "profiles";

const filterTriggerClass =
  "h-9 w-auto min-w-[130px] max-w-[200px] shrink-0 inline-flex items-center justify-between rounded-xl bg-card border border-border/80 hover:bg-muted/60 transition-colors px-3.5 text-xs font-semibold text-foreground shadow-xs focus:ring-0 focus:ring-offset-0 cursor-pointer";
const languageTriggerClass =
  "min-h-9 w-auto min-w-[160px] shrink-0 inline-flex items-center rounded-xl bg-card border border-border/80 hover:bg-muted/60 transition-colors px-3.5 py-1 text-xs font-semibold text-foreground shadow-xs focus:ring-0 focus:ring-offset-0 cursor-pointer";

type SearchSortOption = "newest" | "oldest" | "popular";
type SearchProfileSortOption = "all" | "friends" | "mutual-friends";
type SearchGroupFilterOption = "all" | "my_groups" | "popular";
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
const VALID_GROUP_FILTER_VALUES: SearchGroupFilterOption[] = [
  "all",
  "my_groups",
  "popular",
];
const VALID_TIME_VALUES: SearchTimeOption[] = ["all", "24h", "7d", "30d", "1y"];

export default function SearchPage() {
  const { t } = useTranslation();
  const { isAuth } = useOptionalAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const qParam = searchParams.get("q") || "";
  const typeParam = searchParams.get("type") || "all";
  const sortParam = searchParams.get("sort") || "newest";
  const profileSortParam = searchParams.get("profileSort") || "all";
  const groupFilterParam = searchParams.get("filter") || "all";
  const languagesParam = searchParams.get("languages") || "";
  const timeParam = searchParams.get("time") || "all";

  const handleTabChange = (tab: Tab) => {
    const newParams = new URLSearchParams();
    if (qParam) newParams.set("q", qParam);
    newParams.set("type", tab);
    setSearchParams(newParams);
  };

  const updateSearchParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }

    const currentType = searchParams.get("type") || "all";
    if (currentType === "all") {
      newParams.set("type", "posts");
    }

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

  const activeGroupFilter = VALID_GROUP_FILTER_VALUES.includes(
    groupFilterParam as SearchGroupFilterOption,
  )
    ? (groupFilterParam as SearchGroupFilterOption)
    : "all";

  const activeTime = VALID_TIME_VALUES.includes(timeParam as SearchTimeOption)
    ? (timeParam as SearchTimeOption)
    : "all";

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
    if (activeTab === "groups") {
      return {
        filter: activeGroupFilter,
        languages: languagesParam ? languagesParam.split(",") : undefined,
      };
    }
    if (activeTab === "collections") {
      return {
        sort: activeSort,
        time: activeTime,
        languages: languagesParam ? languagesParam.split(",") : undefined,
      };
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

  const summaryProfiles = sidebarData?.profiles ?? [];
  const summaryGroups = sidebarData?.groups ?? [];
  const summaryCollections = sidebarData?.collections ?? [];

  const infinitePages = infiniteData?.pages ?? [];

  const blogs = useMemo<BlogResult[]>(() => {
    return infiniteData?.pages.flatMap((p) => p.posts ?? []) ?? [];
  }, [infiniteData?.pages]);

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
        infiniteSearchType === "collections" ? p.collections ?? [] : [],
      );
  const profiles =
    isAllPage || isPostsPage
      ? summaryProfiles
      : infinitePages.flatMap((p) =>
          infiniteSearchType === "profiles" ? p.profiles ?? [] : [],
        );
  const groups =
    isAllPage || isPostsPage
      ? summaryGroups
      : infinitePages.flatMap((p) =>
          infiniteSearchType === "groups" ? p.groups ?? [] : [],
        );

  const loading = isAllPage
    ? loadingSidebar || loadingInfinite
    : loadingInfinite;

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    {
      key: "all",
      label: t("search.tabs.all"),
      icon: <Layers size={14} />,
    },
    {
      key: "collections",
      label: t("search.tabs.collections"),
      icon: <LayoutGrid size={14} />,
    },
    {
      key: "posts",
      label: t("search.tabs.posts"),
      icon: <BookOpen size={14} />,
    },
    {
      key: "groups",
      label: t("search.tabs.groups"),
      icon: <Users size={14} />,
    },
    {
      key: "profiles",
      label: t("search.tabs.profiles"),
      icon: <User size={14} />,
    },
  ];

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
        ? "grid gap-3.5 sm:grid-cols-1 md:grid-cols-2"
        : "flex flex-col gap-3";

    return (
      <section className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-extrabold text-foreground">{title}</h3>
            <span className="px-2 py-0.5 rounded-full bg-muted/80 text-[11px] font-bold text-muted-foreground">
              {items.length}
            </span>
          </div>
          <button
            onClick={() => handleTabChange(tabKey)}
            className="flex items-center gap-1 text-xs font-bold text-primary hover:underline group cursor-pointer"
          >
            <span>{t("search.seeMore")}</span>
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
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
      <aside className="min-w-0 lg:sticky lg:top-4 lg:self-start">
        <div className="rounded-3xl bg-card border border-border/80 p-5 shadow-xs">
          <div className="space-y-6 lg:max-h-[calc(100vh-10rem)] lg:overflow-y-auto lg:pr-1 custom-scrollbar">
            {renderSection(
              t("search.tabs.groups"),
              groups,
              GroupCard,
              "groups",
              "sidebar",
              4,
            )}
            {renderSection(
              t("search.tabs.profiles"),
              profiles,
              UserCard,
              "profiles",
              "sidebar",
              4,
            )}
          </div>
        </div>
      </aside>
    );
  };

  const renderPostsList = () => (
    <div className="space-y-4">
      <div className="space-y-3.5">
        {blogs.map((blog: BlogResult) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
        <div ref={lastElementRef} className="h-6 w-full" />
      </div>

      {isFetchingNextPage && (
        <div className="py-4 text-center text-xs font-semibold text-muted-foreground flex items-center justify-center gap-2">
          <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          {t("search.loading")}
        </div>
      )}
    </div>
  );

  const renderPostFilters = () => (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground mr-1">
        <SlidersHorizontal size={13} className="text-primary" />
        <span>{t("search.filter")}</span>
      </div>
      <Select
        value={activeSort}
        onValueChange={(value) => updateSearchParam("sort", value)}
      >
        <SelectTrigger className={filterTriggerClass}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-2xl">
          {SEARCH_SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value} className="text-xs font-medium rounded-xl">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={activeTime}
        onValueChange={(value) => updateSearchParam("time", value)}
      >
        <SelectTrigger className={filterTriggerClass}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-2xl">
          {SEARCH_TIME_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value} className="text-xs font-medium rounded-xl">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const renderProfileFilters = () => {
    if (!isAuth) return null;
    return (
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground mr-1">
          <SlidersHorizontal size={13} className="text-primary" />
          <span>{t("search.filter")}</span>
        </div>
        <Select
          value={activeProfileSort}
          onValueChange={(value) => updateSearchParam("profileSort", value)}
        >
          <SelectTrigger className={filterTriggerClass}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-2xl">
            {SEARCH_PROFILE_SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-xs font-medium rounded-xl">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };

  const renderCollectionFilters = () => (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground mr-1">
        <SlidersHorizontal size={13} className="text-primary" />
        <span>{t("search.filter")}</span>
      </div>
      <Select
        value={activeSort}
        onValueChange={(value) => updateSearchParam("sort", value)}
      >
        <SelectTrigger className={filterTriggerClass}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-2xl">
          {SEARCH_SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value} className="text-xs font-medium rounded-xl">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={activeTime}
        onValueChange={(value) => updateSearchParam("time", value)}
      >
        <SelectTrigger className={filterTriggerClass}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-2xl">
          {SEARCH_TIME_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value} className="text-xs font-medium rounded-xl">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="w-auto">
        <LanguagePicker
          selected={languagesParam ? languagesParam.split(",") : []}
          onChange={(selected) => updateSearchParam("languages", selected.join(","))}
          maxDisplayed={2}
          triggerClassName={languageTriggerClass}
        />
      </div>
    </div>
  );

  const renderGroupFilters = () => (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground mr-1">
        <SlidersHorizontal size={13} className="text-primary" />
        <span>{t("search.filter")}</span>
      </div>
      <Select
        value={activeGroupFilter}
        onValueChange={(value) => updateSearchParam("filter", value)}
      >
        <SelectTrigger className={filterTriggerClass}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-2xl">
          {VALID_GROUP_FILTER_VALUES.filter((value) =>
            isAuth || value !== "my_groups"
          ).map((value) => (
            <SelectItem key={value} value={value} className="text-xs font-medium rounded-xl">
              {t(`search.filters.${value.replace("_groups", "Groups")}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="w-auto">
        <LanguagePicker
          selected={languagesParam ? languagesParam.split(",") : []}
          onChange={(selected) => updateSearchParam("languages", selected.join(","))}
          maxDisplayed={2}
          triggerClassName={languageTriggerClass}
        />
      </div>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 md:p-8 bg-background">
      <div className="w-full max-w-[1400px] mx-auto space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb items={[{ label: t("search.title") }]} />

        {/* When NO search query is entered: Show clean prompt */}
        {!qParam ? (
          <div className="py-24 text-center text-muted-foreground">
            <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-muted/60 border border-border/60 text-muted-foreground/40 shadow-xs">
              <Search size={36} />
            </div>
            <h3 className="text-sm font-semibold text-muted-foreground">
              {t("search.enterKeyword")}
            </h3>
          </div>
        ) : (
          /* When Search Query IS Present */
          <div className="space-y-6">
            {/* Segmented Pill Tabs with counts */}
            <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-card border border-border/80 shadow-xs overflow-x-auto no-scrollbar">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => handleTabChange(tab.key)}
                    className={`flex shrink-0 items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Loading State */}
            {loading && activeTab !== "all" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-36 animate-pulse rounded-3xl bg-muted/40 border border-border/60"
                  />
                ))}
              </div>
            ) : (
              /* Content State */
              <div className="space-y-6">
                {/* TAB: ALL */}
                {activeTab === "all" && (
                  <>
                    {renderPostFilters()}
                    {collections.length === 0 && blogs.length === 0 && groups.length === 0 && profiles.length === 0 && !loading ? (
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
                            <section className="space-y-3.5">
                              <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="text-sm font-extrabold text-foreground">
                                    {t("search.tabs.posts")}
                                  </h3>
                                  <span className="px-2 py-0.5 rounded-full bg-muted/80 text-[11px] font-bold text-muted-foreground">
                                    {blogs.length}
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleTabChange("posts")}
                                  className="flex items-center gap-1 text-xs font-bold text-primary hover:underline group cursor-pointer"
                                >
                                  <span>{t("search.seeMore")}</span>
                                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
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

                {/* TAB: COLLECTIONS */}
                {activeTab === "collections" && (
                  <>
                    {renderCollectionFilters()}
                    {collections.length === 0 ? (
                      <Empty query={qParam} type={t("search.types.collections")} />
                    ) : (
                      <div className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                          {collections.map((c: CollectionResult) => (
                            <CollectionCard key={c.id} collection={c} />
                          ))}
                        </div>
                        <div ref={lastElementRef} className="h-6 w-full" />
                        {isFetchingNextPage && (
                          <div className="py-4 text-center text-xs font-semibold text-muted-foreground flex items-center justify-center gap-2">
                            <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                            {t("search.loading")}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* TAB: POSTS */}
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

                {/* TAB: GROUPS */}
                {activeTab === "groups" && (
                  <>
                    {renderGroupFilters()}
                    {groups.length === 0 ? (
                      <Empty query={qParam} type={t("search.types.groups")} />
                    ) : (
                      <div className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                          {groups.map((g: GroupResult) => (
                            <GroupCard key={g.id} group={g} />
                          ))}
                        </div>
                        <div ref={lastElementRef} className="h-6 w-full" />
                        {isFetchingNextPage && (
                          <div className="py-4 text-center text-xs font-semibold text-muted-foreground flex items-center justify-center gap-2">
                            <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                            {t("search.loading")}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* TAB: PROFILES */}
                {activeTab === "profiles" && (
                  <>
                    {renderProfileFilters()}
                    {profiles.length === 0 ? (
                      <Empty query={qParam} type={t("search.types.profiles")} />
                    ) : (
                      <div className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                          {profiles.map((u: UserResult) => (
                            <UserCard key={u.id} user={u} />
                          ))}
                        </div>
                        <div ref={lastElementRef} className="h-6 w-full" />
                        {isFetchingNextPage && (
                          <div className="py-4 text-center text-xs font-semibold text-muted-foreground flex items-center justify-center gap-2">
                            <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                            {t("search.loading")}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
