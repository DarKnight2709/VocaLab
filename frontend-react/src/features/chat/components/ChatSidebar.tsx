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
import { Search, UserRound, UsersRound } from "lucide-react";
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
  onSearchQueryChange,
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

  return (
    <>
      {isSidebarVisible && (!embedded || !isEmbeddedChatView) && (
        <aside
          className={
            (embedded ? "w-full " : "w-80 shrink-0 ") +
            "border-r bg-card flex flex-col"
          }
        >
          {!hideSidebarSearch && (
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("chat.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => onSearchQueryChange(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          )}

          <Tabs
            value={activeTab}
            onValueChange={(v) => onActiveTabChange(v as "users" | "groups")}
            className="flex-1 flex flex-col"
          >
            <div className="px-4 pt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="users" className="gap-2">
                  <UserRound className="h-4 w-4" />
                  {t("chat.users")}
                </TabsTrigger>
                <TabsTrigger value="groups" className="gap-2">
                  <UsersRound className="h-4 w-4" />
                  {t("chat.groups")}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="users"
              className="flex-1 overflow-auto overscroll-contain p-2 m-0"
            >
              {loadingUsers ? (
                <div className="p-4 text-sm text-muted-foreground text-center">
                  {t("chat.loading")}
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground text-center">
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
                      className={`w-full text-left rounded-lg p-3 mb-2 transition-colors ${
                        active
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                      onClick={() => onUserClick(u)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={u.avatar ?? undefined} />
                            <AvatarFallback>{getInitials(name)}</AvatarFallback>
                          </Avatar>
                          {online && (
                            <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div
                              className={`truncate ${unread > 0 ? "font-bold" : "font-medium"}`}
                            >
                              {name}
                            </div>
                            {unread > 0 && !active && (
                              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-5 text-center">
                                {unread}
                              </span>
                            )}
                          </div>
                          <div
                            className={`text-xs truncate ${active ? "opacity-90" : unread > 0 ? "font-bold text-foreground" : "text-muted-foreground"}`}
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
              className="flex-1 overflow-auto overscroll-contain p-2 m-0"
            >
              <div className="px-2 pt-2 pb-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={onCreateGroupClick}
                >
                  + {t("chat.createGroup")}
                </Button>
              </div>

              {loadingGroups ? (
                <div className="p-4 text-sm text-muted-foreground text-center">
                  {t("chat.loading")}
                </div>
              ) : filteredGroups.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground text-center">
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
                      className={`w-full text-left rounded-lg p-3 mb-2 transition-colors ${
                        active
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                      onClick={() => onGroupClick(g)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={g.avatar ?? undefined} />
                            <AvatarFallback>{getInitials(name)}</AvatarFallback>
                          </Avatar>
                          {isGroupActive && (
                            <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 truncate">
                              <span
                                className={`${unread > 0 ? "font-bold" : "font-medium"} truncate`}
                              >
                                {name}
                              </span>
                            </div>
                            {unread > 0 && !active && (
                              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-5 text-center">
                                {unread}
                              </span>
                            )}
                          </div>
                          <div
                            className={`text-xs truncate ${active ? "opacity-90" : unread > 0 ? "font-bold text-foreground" : "text-muted-foreground"}`}
                          >
                            {isGroupActive && !last?.content ? (
                              <span
                                className={
                                  active
                                    ? "text-primary-foreground/80"
                                    : "text-green-600 font-medium"
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
            </TabsContent>
          </Tabs>
        </aside>
      )}
    </>
  );
}
