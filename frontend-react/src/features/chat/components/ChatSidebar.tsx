import { useState, useRef, useEffect, useMemo } from "react";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { useFriendSearchSuggestionQuery } from "@/features/chat/api/chatService";
import { useInView } from "react-intersection-observer";
import { Button } from "@/shared/components/ui/button";
import { useTranslation } from "@/shared/hooks/useTranslation";
import { Input } from "@/shared/components/ui/input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { Search, UserRound, UsersRound, X } from "lucide-react";
import { getInitials } from "../utils";
import type { UserItem } from "@/shared/validations/ChatSchema";
import type { GroupItem } from "@/shared/validations/GroupSchema";

type ChatSidebarProps = {
  embedded?: boolean;
  hideSidebarSearch?: boolean;
  isSidebarVisible: boolean;
  onSidebarVisibilityChange: (visible: boolean) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  activeTab: "users" | "groups";
  onActiveTabChange: (tab: "users" | "groups") => void;
  filteredUsers: UserItem[];
  filteredGroups: GroupItem[];
  loadingUsers: boolean;
  loadingGroups: boolean;
  selectedUser: UserItem | null;
  selectedGroup: GroupItem | null;
  onlineIds: Set<string>;
  myId: string;
  onUserClick: (user: UserItem) => void;
  onGroupClick: (group: GroupItem) => void;
  onCreateGroupClick: () => void;
};

export function ChatSidebar({
  embedded = false,
  hideSidebarSearch = false,
  isSidebarVisible,
  searchQuery,
  activeTab,
  onActiveTabChange,
  filteredUsers,
  filteredGroups,
  loadingUsers,
  loadingGroups,
  selectedUser,
  selectedGroup,
  onlineIds,
  myId,
  onUserClick,
  onGroupClick,
  onCreateGroupClick,
}: ChatSidebarProps) {
  const { t } = useTranslation();
  const isEmbeddedChatView = embedded && (!!selectedUser || !!selectedGroup);

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 300);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const {
    data: searchFriendResults,
    isLoading: isSearchingFriends,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFriendSearchSuggestionQuery(searchInput, {
    enabled: activeTab === "users",
  });
  const suggestedUsers = activeTab === "users" ? (searchFriendResults?.pages.flatMap(page => page.friends) || []) : [];

  const { ref: bottomRef } = useInView({
    onChange: (inView) => {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
  });

  const suggestedGroups = useMemo(() => {
    if (activeTab === "users") return [];
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return [];
    return filteredGroups.filter((g) =>
      (g.name || "").toLowerCase().includes(q)
    );
  }, [debouncedSearch, filteredGroups, activeTab]);

  return (
    <>
      {isSidebarVisible && (!embedded || !isEmbeddedChatView) && (
        <aside
          className={
            (embedded ? "w-full " : "w-full md:w-80 shrink-0 ") +
            ((selectedUser || selectedGroup) && !embedded ? "hidden md:flex " : "flex ") +
            "border-r border-border/60 flex-col bg-card/30"
          }
        >
          {!hideSidebarSearch && (
            <div className="px-4 border-b border-border/60 h-[72px] flex flex-col justify-center bg-card/40" ref={searchRef}>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("chat.searchPlaceholder")}
                  value={searchInput}
                  onFocus={() => setShowSuggestions(true)}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setShowSuggestions(true);
                  }}
                  className="pl-9 pr-9 h-10 rounded-2xl bg-muted/40 border-border/60 focus-visible:ring-primary/20 focus-visible:border-primary/50 text-sm"
                />
                {searchInput.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput("");
                      setShowSuggestions(true);
                    }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}

                {showSuggestions && searchInput.length > 0 && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-popover text-popover-foreground border border-border/80 rounded-2xl shadow-xl z-50 overflow-hidden">
                    {debouncedSearch.length > 0 && isSearchingFriends && activeTab === "users" ? (
                      <div className="px-4 py-2 text-sm text-muted-foreground">
                        {t("chat.loading", "Loading...")}
                      </div>
                    ) : debouncedSearch.length > 0 && suggestedUsers.length === 0 && suggestedGroups.length === 0 ? (
                      <div className="px-4 py-2 text-sm text-muted-foreground">
                        {t("chat.noResultsFound", "No results found.")}
                      </div>
                    ) : (
                      <ul className="py-1.5 max-h-64 overflow-auto">
                        {suggestedUsers.map((u) => (
                          <li
                            key={`su-${u.id}`}
                            className="px-4 py-2 hover:bg-muted/80 cursor-pointer transition-colors flex items-center gap-3"
                            onClick={() => {
                              onUserClick({ ...u, fullName: u.fullName || undefined });
                              setSearchInput("");
                              setShowSuggestions(false);
                            }}
                          >
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarImage src={u.avatar ?? undefined} />
                              <AvatarFallback>{getInitials(u.fullName || u.username || t("chat.user"))}</AvatarFallback>
                            </Avatar>
                            <span className="truncate flex-1 font-medium text-sm">{u.fullName || u.username || t("chat.user")}</span>
                          </li>
                        ))}
                        {suggestedGroups.map((g) => (
                          <li
                            key={`sg-${g.id}`}
                            className="px-4 py-2 hover:bg-muted/80 cursor-pointer transition-colors flex items-center gap-3"
                            onClick={() => {
                              onGroupClick(g);
                              setSearchInput("");
                              setShowSuggestions(false);
                            }}
                          >
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarImage src={g.avatar ?? undefined} />
                              <AvatarFallback>{getInitials(g.name || t("chat.group"))}</AvatarFallback>
                            </Avatar>
                            <span className="truncate flex-1 font-medium text-sm">{g.name || t("chat.group")}</span>
                          </li>
                        ))}
                        {activeTab === "users" && hasNextPage && (
                          <li ref={bottomRef} className="px-4 py-2 text-sm text-center text-muted-foreground">
                            {isFetchingNextPage ? t("chat.loading", "Loading...") : " "}
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <Tabs
            value={activeTab}
            onValueChange={(v) => onActiveTabChange(v as "users" | "groups")}
            className="flex-1 flex flex-col min-h-0"
          >
            <div className="px-3 pt-3 pb-1">
              <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/40 rounded-2xl border border-border/40">
                <TabsTrigger value="users" className="gap-2 rounded-xl text-xs font-bold data-[state=active]:bg-card data-[state=active]:shadow-xs">
                  <UserRound className="h-4 w-4" />
                  {t("chat.users")}
                </TabsTrigger>
                <TabsTrigger value="groups" className="gap-2 rounded-xl text-xs font-bold data-[state=active]:bg-card data-[state=active]:shadow-xs">
                  <UsersRound className="h-4 w-4" />
                  {t("chat.groups")}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="users"
              className="flex-1 overflow-auto overscroll-contain p-3 pb-12 m-0 custom-scrollbar"
            >
              {loadingUsers ? (
                <div className="p-4 text-sm text-muted-foreground text-center font-medium">
                  {t("chat.loading")}
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground text-center font-medium">
                  {searchQuery
                    ? t("chat.noUsersFound")
                    : t("chat.noUsersYet")}
                </div>
              ) : (
                filteredUsers.map((u: UserItem) => {
                  const name = u.fullName || u.username || t("chat.user");
                  const active = selectedUser?.id === u.id;
                  const online = onlineIds.has(u.id);
                  const unread = u.unreadCount || 0;

                  return (
                    <button
                      key={u.id}
                      className={`w-full text-left rounded-2xl p-3 mb-1.5 transition-all ${
                        active
                          ? "bg-primary/10 text-primary border border-primary/25 shadow-xs font-semibold"
                          : "hover:bg-muted/70 text-foreground border border-transparent"
                      }`}
                      onClick={() => onUserClick(u)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <Avatar className="h-11 w-11 rounded-2xl border border-border/40">
                            <AvatarImage src={u.avatar ?? undefined} />
                            <AvatarFallback className="rounded-2xl">{getInitials(name)}</AvatarFallback>
                          </Avatar>
                          {online && (
                            <div className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-emerald-500 border-2 border-card rounded-full shadow-xs" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <div
                              className={`truncate text-sm ${unread > 0 ? "font-bold text-foreground" : "font-medium"}`}
                            >
                              {name}
                            </div>
                            {unread > 0 && !active && (
                              <span className="bg-primary text-primary-foreground text-[11px] font-extrabold rounded-full px-2 py-0.5 min-w-[20px] text-center shadow-xs">
                                {unread}
                              </span>
                            )}
                          </div>
                          <div
                            className={`text-xs truncate mt-0.5 ${active ? "text-primary/80" : unread > 0 ? "font-semibold text-foreground" : "text-muted-foreground"}`}
                          >
                            {u.lastMessage
                              ? `${u.lastMessage.isMine ? `${t("chat.you")}: ` : ""}${u.lastMessage.content?.slice(0, 30)}${u.lastMessage.content && u.lastMessage.content.length > 30 ? "..." : ""}`
                              : `@${u.username || ""}`}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </TabsContent>

            <TabsContent
              value="groups"
              className="flex-1 flex flex-col min-h-0 p-3 m-0"
            >
              <div className="pb-3 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-2xl font-bold h-10 border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 transition-all justify-center"
                  onClick={onCreateGroupClick}
                >
                  + {t("chat.createGroup")}
                </Button>
              </div>

              <div className="flex-1 overflow-auto overscroll-contain pb-12 custom-scrollbar">
                {loadingGroups ? (
                  <div className="p-4 text-sm text-muted-foreground text-center font-medium">
                    {t("chat.loading")}
                  </div>
                ) : filteredGroups.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground text-center font-medium">
                    {searchQuery ? t("chat.noGroupsFound") : t("chat.noGroupsYet")}
                  </div>
                ) : (
                  filteredGroups.map((g) => {
                    const name = g.name || t("chat.group");
                    const active = selectedGroup?.id === g.id;
                    const unread = g.unreadCount || 0;
                    const last = g.lastMessage;
                    const preview = last?.content
                      ? `${last.senderName ? `${last.isMine ? t("chat.you") : last.senderName}: ` : ""}${last.content.slice(0, 30)}${last.content.length > 30 ? "..." : ""}`
                      : g.description || "";

                    const isGroupActive = g.members?.some(
                      (memberId) => memberId !== myId && onlineIds.has(memberId),
                    );

                    return (
                      <button
                        key={g.id}
                        className={`w-full text-left rounded-2xl p-3 mb-1.5 transition-all ${
                          active
                            ? "bg-primary/10 text-primary border border-primary/25 shadow-xs font-semibold"
                            : "hover:bg-muted/70 text-foreground border border-transparent"
                        }`}
                        onClick={() => onGroupClick(g)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <Avatar className="h-11 w-11 rounded-2xl border border-border/40">
                              <AvatarImage src={g.avatar ?? undefined} />
                              <AvatarFallback className="rounded-2xl">{getInitials(name)}</AvatarFallback>
                            </Avatar>
                            {isGroupActive && (
                              <div className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-emerald-500 border-2 border-card rounded-full shadow-xs" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <div className="flex items-center gap-2 truncate">
                                <span
                                  className={`text-sm truncate ${unread > 0 ? "font-bold text-foreground" : "font-medium"}`}
                                >
                                  {name}
                                </span>
                              </div>
                              {unread > 0 && !active && (
                                <span className="bg-primary text-primary-foreground text-[11px] font-extrabold rounded-full px-2 py-0.5 min-w-[20px] text-center shadow-xs">
                                  {unread}
                                </span>
                              )}
                            </div>
                            <div
                              className={`text-xs truncate mt-0.5 ${active ? "text-primary/80" : unread > 0 ? "font-semibold text-foreground" : "text-muted-foreground"}`}
                            >
                              {isGroupActive && !last?.content ? (
                                <span
                                  className={
                                    active
                                      ? "text-primary/80 font-semibold"
                                      : "text-emerald-600 dark:text-emerald-400 font-semibold"
                                  }
                                >
                                  {t("chat.online")}
                                </span>
                              ) : (
                                preview
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </TabsContent>
          </Tabs>
        </aside>
      )}
    </>
  );
}
