import { useState, useEffect } from "react";
import {
  Users,
  ShieldX,
  UserX,
  Search,
  X,
  UserMinus,
  Shield,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { useTranslation } from "@/shared/hooks/useTranslation";
import { cn } from "@/shared/lib/utils";
import { Switch } from "@/shared/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import type { MeResponse } from "@/shared/validations/AuthSchema";
import {
  ScopeVisibility,
  type ScopeVisibilityType,
} from "@/shared/enums/ScopeVisibility.enum";
import {
  useBlockedUsersQuery,
  useUnblockUserMutation,
} from "@/features/user/api/userService";

interface PrivacySettingTabProps {
  me?: MeResponse;
  onAllowFollow: (allowFollow: boolean) => void;
  onUpdateMessageScope?: (scope: ScopeVisibilityType) => void;
  onUpdateFollowersTabVisibility?: (scope: ScopeVisibilityType) => void;
  onUpdateFollowingTabVisibility?: (scope: ScopeVisibilityType) => void;
  onUpdateFriendTabVisibility?: (scope: ScopeVisibilityType) => void;
}

export default function PrivacySettingTab({
  me,
  onAllowFollow,
  onUpdateMessageScope,
  onUpdateFollowersTabVisibility,
  onUpdateFollowingTabVisibility,
  onUpdateFriendTabVisibility,
}: PrivacySettingTabProps) {
  const { t } = useTranslation();

  /* ── 1. Core Privacy Configuration States ── */
  const [allowFollow, setAllowFollow] = useState(me?.privacySettings?.allowFollow ?? true);
  const [whoCanMessage, setWhoCanMessage] = useState<ScopeVisibilityType>(
    (me?.privacySettings?.messageScope as ScopeVisibilityType) ?? ScopeVisibility.EVERYONE,
  );
  const [followersTabVisibility, setFollowersTabVisibility] = useState<ScopeVisibilityType>(
    (me?.privacySettings?.followersTabVisibility as ScopeVisibilityType) ?? ScopeVisibility.EVERYONE,
  );
  const [followingTabVisibility, setFollowingTabVisibility] = useState<ScopeVisibilityType>(
    (me?.privacySettings?.followingTabVisibility as ScopeVisibilityType) ?? ScopeVisibility.EVERYONE,
  );
  const [friendTabVisibility, setFriendTabVisibility] = useState<ScopeVisibilityType>(
    (me?.privacySettings?.friendTabVisibility as ScopeVisibilityType) ?? ScopeVisibility.EVERYONE,
  );

  /* ── 2. Blocking UI Management States ── */
  const [blockSearch, setBlockSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [unblockTarget, setUnblockTarget] = useState<string | null>(null);
  const [showBlockedList, setShowBlockedList] = useState(false);
  const [page] = useState(1);

  const unblockMutation = useUnblockUserMutation();

  // Handle cleaner typing search debouncing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(blockSearch);
    }, 350);
    return () => clearTimeout(handler);
  }, [blockSearch]);

  // Fetch from single source of truth (Server State API)
  const { data: blockedData, isLoading: isLoadingBlocked } = useBlockedUsersQuery(
    showBlockedList ? me?.id : undefined,
    page,
    12,
    debouncedSearch, // Use backend filtering dynamically instead of doubling with frontend filters
  );

  const blockedList = blockedData?.blockedUsers ?? [];

  // Keep state variables synchronized when parent profile entity shifts
  useEffect(() => {
    if (me?.privacySettings) {
      if (me.privacySettings.allowFollow !== undefined) setAllowFollow(me.privacySettings.allowFollow);
      if (me.privacySettings.messageScope) setWhoCanMessage(me.privacySettings.messageScope as ScopeVisibilityType);
      if (me.privacySettings.followersTabVisibility) setFollowersTabVisibility(me.privacySettings.followersTabVisibility as ScopeVisibilityType);
      if (me.privacySettings.followingTabVisibility) setFollowingTabVisibility(me.privacySettings.followingTabVisibility as ScopeVisibilityType);
      if (me.privacySettings.friendTabVisibility) setFriendTabVisibility(me.privacySettings.friendTabVisibility as ScopeVisibilityType);
    }
  }, [me]);

  /* ── 3. Action Event Dispatches ── */
  const handleFollowToggle = (checked: boolean) => {
    setAllowFollow(checked);
    onAllowFollow(checked);
  };

  const handleUnblock = (id: string) => {
    setUnblockTarget(id); // Fire opacity animation target instantly
    unblockMutation.mutate(id, {
      onSuccess: () => {
        setUnblockTarget(null);
      },
      onError: () => {
        setUnblockTarget(null); // Clear item freeze layout on request error failures
      },
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* ────────── Connections Privacy Panel ────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">{t("settings.tabs.privacy")}</h2>
        </div>

        <div className="grid gap-4">
          {/* Allow standard followers configuration switch */}
          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
            <div className="flex-1 pr-4">
              <p className="font-medium">{t("settings.privacy.whoCanFollow")}</p>
              <p className="text-sm text-muted-foreground">{t("settings.privacy.whoCanFollowDesc")}</p>
            </div>
            <Switch checked={allowFollow} onCheckedChange={handleFollowToggle} />
          </div>

          {/* Messaging Scope Access Selection */}
          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
            <div className="flex-1 pr-4">
              <p className="font-medium">{t("settings.privacy.whoCanMessage")}</p>
              <p className="text-sm text-muted-foreground">{t("settings.privacy.whoCanMessageDesc")}</p>
            </div>
            <div className="w-[180px]">
              <Select value={whoCanMessage} onValueChange={(val) => { setWhoCanMessage(val as ScopeVisibilityType); onUpdateMessageScope?.(val as ScopeVisibilityType); }}>
                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="EVERYONE">{t("settings.privacy.everyone")}</SelectItem>
                  <SelectItem value="FRIENDS">{t("settings.privacy.friends")}</SelectItem>
                  <SelectItem value="PRIVATE">{t("settings.privacy.nobody")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Followers NavTab TabVisibility Configuration */}
          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
            <div className="flex-1 pr-4">
              <p className="font-medium">{t("settings.privacy.followersTab")}</p>
              <p className="text-sm text-muted-foreground">{t("settings.privacy.followersTabDesc")}</p>
            </div>
            <div className="w-[180px]">
              <Select value={followersTabVisibility} onValueChange={(val) => { setFollowersTabVisibility(val as ScopeVisibilityType); onUpdateFollowersTabVisibility?.(val as ScopeVisibilityType); }}>
                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="EVERYONE">{t("settings.privacy.everyone")}</SelectItem>
                  <SelectItem value="FRIENDS">{t("settings.privacy.friends")}</SelectItem>
                  <SelectItem value="PRIVATE">{t("settings.privacy.nobody")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Following Tab Visibility Option */}
          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
            <div className="flex-1 pr-4">
              <p className="font-medium">{t("settings.privacy.followingTab")}</p>
              <p className="text-sm text-muted-foreground">{t("settings.privacy.followingTabDesc")}</p>
            </div>
            <div className="w-[180px]">
              <Select value={followingTabVisibility} onValueChange={(val) => { setFollowingTabVisibility(val as ScopeVisibilityType); onUpdateFollowingTabVisibility?.(val as ScopeVisibilityType); }}>
                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="EVERYONE">{t("settings.privacy.everyone")}</SelectItem>
                  <SelectItem value="FRIENDS">{t("settings.privacy.friends")}</SelectItem>
                  <SelectItem value="PRIVATE">{t("settings.privacy.nobody")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Friend Tab Visibility System Configuration */}
          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
            <div className="flex-1 pr-4">
              <p className="font-medium">{t("settings.privacy.friendTab")}</p>
              <p className="text-sm text-muted-foreground">{t("settings.privacy.friendTabDesc")}</p>
            </div>
            <div className="w-[180px]">
              <Select value={friendTabVisibility} onValueChange={(val) => { setFriendTabVisibility(val as ScopeVisibilityType); onUpdateFriendTabVisibility?.(val as ScopeVisibilityType); }}>
                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="EVERYONE">{t("settings.privacy.everyone")}</SelectItem>
                  <SelectItem value="FRIENDS">{t("settings.privacy.friends")}</SelectItem>
                  <SelectItem value="PRIVATE">{t("settings.privacy.nobody")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* ────────── Security & Moderation Section ────────── */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <ShieldX className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">{t("settings.privacy.blockedAccounts")}</h2>
        </div>

        <div className="grid gap-4">
          <div className="flex flex-col rounded-lg border bg-muted/30 overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{t("settings.privacy.blockedAccounts")}</p>
                <p className="text-sm text-muted-foreground">{t("settings.privacy.blockedAccountsDesc")}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBlockedList(!showBlockedList)}
                className="gap-2"
              >
                {showBlockedList ? t("common.cancel") : t("common.view")}
                <ChevronDown className={cn("h-4 w-4 transition-transform", showBlockedList && "rotate-180")} />
              </Button>
            </div>

            {/* Blocked Accounts Management Popover Body Container */}
            {showBlockedList && (
              <div className="p-4 pt-0 space-y-4 border-t bg-card/50 animate-in slide-in-from-top-2 duration-300">
                
                {/* Search query contextual element */}
                <div className="relative mt-4">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={blockSearch}
                    onChange={(e) => setBlockSearch(e.target.value)}
                    placeholder={t("settings.privacy.searchBlocked")}
                    className="w-full h-9 pl-9 pr-9 py-2 text-sm rounded-md border bg-background focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground"
                  />
                  {blockSearch && (
                    <button
                      type="button"
                      onClick={() => setBlockSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Main Data Iteration Loop */}
                {isLoadingBlocked ? (
                  <div className="flex items-center justify-center py-8 gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : blockedList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-2 rounded-md border border-dashed bg-muted/10">
                    <Shield size={20} className="text-muted-foreground/50" />
                    <p className="text-xs text-muted-foreground font-medium">
                      {blockSearch ? t("settings.privacy.noBlockedSearchResults") : t("settings.privacy.noBlockedAccounts")}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {blockedList.map((user) => {
                      const isUnblocking = unblockTarget === user.id;
                      return (
                        <div
                          key={user.id}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-md border bg-background transition-all duration-300",
                            isUnblocking && "opacity-40 scale-[0.98] border-destructive/20 bg-destructive/5"
                          )}
                        >
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.fullName || user.username}
                              className="h-8 w-8 rounded-full object-cover shrink-0 grayscale"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                              <UserX size={14} className="text-muted-foreground" />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate text-foreground">{user.fullName}</p>
                            <p className="text-[10px] text-muted-foreground truncate">@{user.username}</p>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isUnblocking}
                            onClick={() => handleUnblock(user.id)}
                            className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            {isUnblocking ? (
                              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                            ) : (
                              <UserMinus className="h-3.5 w-3.5 mr-1.5" />
                            )}
                            {t("settings.privacy.unblock")}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {blockedList.length > 0 && !isLoadingBlocked && (
                  <p className="text-[10px] text-muted-foreground text-right italic">
                    {blockedList.length} {t("settings.privacy.accountsBlocked")}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}