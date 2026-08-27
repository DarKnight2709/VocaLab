import {
  Eye,
  EyeOff,
  FileText,
  Handshake,
  Search,
  UserPlus,
  Users,
  LayoutGrid,
  BookOpen,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router";
import { useTranslation } from "@/shared/hooks/useTranslation";
import FollowersTab from "./profile-tabs/FollowersTab";
import FollowingTab from "./profile-tabs/FollowingTab";
import FriendsTab from "./profile-tabs/FriendsTab";
import PostsTab from "./profile-tabs/PostsTab";
import CollectionsTab from "./profile-tabs/CollectionsTab";
import GroupsTab from "./profile-tabs/GroupsTab";
import { ContentTab } from "../../../shared/enums/ContentTab.enum";
import { PostVisibility } from "../../../shared/enums/PostVisibility.enum";

function PostVisibilityFilter({
  value,
  onChange,
}: {
  value: PostVisibility;
  onChange: (v: PostVisibility) => void;
}) {
  const { t } = useTranslation();
  const options: { label: string; value: PostVisibility; icon: any }[] = [
    { label: t("profile.visibility.all"), value: PostVisibility.ALL, icon: FileText },
    { label: t("profile.visibility.public"), value: PostVisibility.PUBLIC, icon: Eye },
    { label: t("profile.visibility.private"), value: PostVisibility.PRIVATE, icon: EyeOff },
  ];

  return (
    <div className="inline-flex items-center gap-1 rounded-2xl bg-card border border-border/80 p-1 shadow-xs">
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              isActive
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
            }`}
          >
            <Icon size={13} />
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function ProfileContentSection({ 
  userId, 
  isOwnProfile,
  capabilities
}: { 
  userId?: string; 
  isOwnProfile?: boolean;
  capabilities?: {
    canSeeFollowers: boolean;
    canSeeFollowing: boolean;
    canSeeFriends: boolean;
    canSeeGroups: boolean;
  }
}) {
  const { t } = useTranslation();
  
  const contentTabs: Array<{
    key: ContentTab;
    label: string;
    icon: any;
  }> = [];

  if (capabilities?.canSeeFollowers) {
    contentTabs.push({ key: ContentTab.FOLLOWERS, label: t("profile.tabs.followers"), icon: UserPlus });
  }
  if (capabilities?.canSeeFollowing) {
    contentTabs.push({ key: ContentTab.FOLLOWING, label: t("profile.tabs.following"), icon: Users });
  }
  if (capabilities?.canSeeFriends) {
    contentTabs.push({ key: ContentTab.FRIENDS, label: t("profile.tabs.friends"), icon: Handshake });
  }
  contentTabs.push({ key: ContentTab.POSTS, label: t("profile.tabs.posts"), icon: BookOpen });
  contentTabs.push({ key: ContentTab.COLLECTIONS, label: t("profile.tabs.collections"), icon: LayoutGrid });
  if (capabilities?.canSeeGroups) {
    contentTabs.push({ key: ContentTab.GROUPS, label: t("profile.tabs.groups"), icon: Users });
  }

  const defaultTab = contentTabs.length > 0 ? contentTabs[0].key : ContentTab.POSTS;
  
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get("tab") as ContentTab | null;
  
  const activeTab = (urlTab && contentTabs.find(t => t.key === urlTab)) 
    ? urlTab 
    : defaultTab;

  const setActiveTab = (tab: ContentTab) => {
    setSearchParams(
      (prev) => {
        prev.set("tab", tab);
        return prev;
      },
      { replace: true }
    );
  };

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [postVisibility, setPostVisibility] = useState<PostVisibility>(PostVisibility.ALL);

  // Horizontal scroll controls
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll();
    const handleResize = () => checkScroll();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [checkScroll, contentTabs]);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollContainerRef.current && e.deltaY !== 0) {
      scrollContainerRef.current.scrollLeft += e.deltaY;
      checkScroll();
    }
  };

  const handleScrollBy = (offset: number) => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
    setTimeout(checkScroll, 300);
  };

  // Auto-scroll active tab into view
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const activeEl = scrollContainerRef.current.querySelector<HTMLElement>(
      '[data-active="true"]'
    );
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: "smooth", inline: "nearest", block: "nearest" });
    }
    setTimeout(checkScroll, 300);
  }, [activeTab, checkScroll]);

  const handleSearch = (val: string) => {
    setSearch(val);
    clearTimeout((handleSearch as any)._t);
    (handleSearch as any)._t = setTimeout(() => {
      setDebouncedSearch(val);
    }, 400);
  };

  const handleClearSearch = () => {
    setSearch("");
    setDebouncedSearch("");
  };

  return (
    <section className="space-y-4 pt-1">
      {/* Sleek Underline Tab Navigation Bar with Slide Controls */}
      <div className="relative flex items-center border-b border-border/80 pb-0">
        {/* Left Scroll Arrow */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => handleScrollBy(-180)}
            className="absolute left-0 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/90 border border-border/80 shadow-md text-foreground hover:bg-muted transition-all cursor-pointer -translate-x-1"
            title={t("common.scrollLeft", "Scroll left")}
          >
            <ChevronLeft size={16} />
          </button>
        )}

        {/* Scrollable Tabs Container */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          onWheel={handleWheel}
          className="flex-1 flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth"
        >
          {contentTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                data-active={isActive}
                onClick={() => {
                  setActiveTab(tab.key);
                }}
                className={`group relative flex items-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon
                  size={15}
                  className={
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground"
                  }
                />
                <span>{tab.label}</span>
                {/* Active Indicator Line */}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Scroll Arrow */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => handleScrollBy(180)}
            className="absolute right-0 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/90 border border-border/80 shadow-md text-foreground hover:bg-muted transition-all cursor-pointer translate-x-1"
            title={t("common.scrollRight", "Scroll right")}
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>

      {/* Filter and Search Bar Row */}
      <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
        <div className="w-auto">
          {(activeTab === ContentTab.POSTS || activeTab === ContentTab.COLLECTIONS) && isOwnProfile && (
            <PostVisibilityFilter
              value={postVisibility}
              onChange={setPostVisibility}
            />
          )}
        </div>

        <div className="relative flex-1 sm:w-64 sm:flex-none ml-auto">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={t("profile.searchPlaceholder")}
            className="h-9 w-full rounded-2xl border border-border/80 bg-card py-1.5 pl-9.5 pr-8 text-xs font-medium text-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 shadow-xs transition-all placeholder:text-muted-foreground"
          />
          {search && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Tab content */}
      <div className="pt-2 min-h-60">
        {userId ? (
            <>
              {activeTab === ContentTab.FOLLOWERS && <FollowersTab userId={userId} search={debouncedSearch} />}
              {activeTab === ContentTab.FOLLOWING && <FollowingTab userId={userId} search={debouncedSearch} />}
              {activeTab === ContentTab.FRIENDS && <FriendsTab userId={userId} search={debouncedSearch} />}
              {activeTab === ContentTab.POSTS && (
                <PostsTab 
                    userId={userId} 
                    search={debouncedSearch} 
                    visibility={postVisibility} 
                />
              )}
              {activeTab === ContentTab.COLLECTIONS && (
                <CollectionsTab 
                    userId={userId} 
                    search={debouncedSearch} 
                    visibility={postVisibility}
                />
              )}
              {activeTab === ContentTab.GROUPS && (
                <GroupsTab 
                    userId={userId} 
                    search={debouncedSearch} 
                />
              )}
            </>
        ) : (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-muted-foreground">{t("profile.userNotFound")}</p>
          </div>
        )}
      </div>
    </section>
  );
}
