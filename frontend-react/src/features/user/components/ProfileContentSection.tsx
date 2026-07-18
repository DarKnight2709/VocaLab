import { Eye, EyeOff, FileText, Handshake, Search, UserPlus, Users } from "lucide-react";
import { useState } from "react";
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
    <div className="inline-flex items-center gap-1 rounded-full bg-muted/50 p-1">
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={[
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground",
            ].join(" ")}
          >
            <Icon className="h-3.5 w-3.5" />
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
    icon: typeof Users;
  }> = [];

  if (capabilities?.canSeeFollowers) {
    contentTabs.push({ key: ContentTab.FOLLOWERS, label: t("profile.tabs.followers"), icon: Users });
  }
  if (capabilities?.canSeeFollowing) {
    contentTabs.push({ key: ContentTab.FOLLOWING, label: t("profile.tabs.following"), icon: UserPlus });
  }
  if (capabilities?.canSeeFriends) {
    contentTabs.push({ key: ContentTab.FRIENDS, label: t("profile.tabs.friends"), icon: Handshake });
  }
  contentTabs.push({ key: ContentTab.POSTS, label: t("profile.tabs.posts"), icon: FileText });
  contentTabs.push({ key: ContentTab.COLLECTIONS, label: t("profile.tabs.collections"), icon: FileText }); // You might want to use a different icon like Folder or Library here, but sticking to existing ones for now. Let's use FileText
  if (capabilities?.canSeeGroups) {
    contentTabs.push({ key: ContentTab.GROUPS, label: t("profile.tabs.groups"), icon: Users });
  }

  const defaultTab = contentTabs.length > 0 ? contentTabs[0].key : ContentTab.POSTS;
  
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get("tab") as ContentTab | null;
  
  // Ensure activeTab is valid when capabilities change
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

  const handleSearch = (val: string) => {
    setSearch(val);
    clearTimeout((handleSearch as any)._t);
    (handleSearch as any)._t = setTimeout(() => {
      setDebouncedSearch(val);
    }, 400);
  };

  return (
    <section className="mt-10 border-t pt-5">
      {/* Tab nav & Search bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-1">
        <div className="flex items-center gap-1 overflow-x-auto">
          {contentTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key);
                }}
                className={[
                  "inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2 text-base font-medium transition-colors",
                  isActive
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                <Icon className="h-4.5 w-4.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {(activeTab === ContentTab.POSTS || activeTab === ContentTab.COLLECTIONS) && isOwnProfile && (
            <PostVisibilityFilter
              value={postVisibility}
              onChange={setPostVisibility}
            />
          )}

          <div className="relative flex-1 sm:min-w-64">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={t("profile.searchPlaceholder")}
              className="w-full rounded-xl border bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
            />
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="mt-8 min-h-80">
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
