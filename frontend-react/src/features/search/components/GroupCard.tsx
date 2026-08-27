import { CalendarDays, Info, UserRound, Users, Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { SearchGroupResult as GroupResult } from "@/shared/validations/SearchSchema";
import type { SearchUserResult as UserResult } from "@/shared/validations/SearchSchema";

import { useAuthStore } from "@/features/auth/stores/authStore";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { getInitials } from "@/shared/lib/utils";
import { useMemo } from "react";
import ROUTES from "@/shared/lib/routes";
import { useNavigate } from "react-router";
import { useJoinSearchGroupMutation } from "@/features/chat/api/groupService";

function AvatarBubble({
  user,
  className = "h-7 w-7",
}: {
  user?: UserResult | null;
  className?: string;
}) {
  const label = user?.fullName || user?.username || "User";

  return (
    <div
      className={`${className} shrink-0 overflow-hidden rounded-full border-2 border-background bg-muted`}
      title={label}
    >
      {user?.avatar ? (
        <img
          src={user.avatar}
          alt={label}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-muted-foreground">
          {getInitials(label)}
        </div>
      )}
    </div>
  );
}

export function GroupCard({ group }: { group: GroupResult }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate(); // Initialize navigator
  const currentUserId = useAuthStore((state) => state.userId);
  const joinMutation = useJoinSearchGroupMutation();

  const nonOwnerMembers = useMemo(
    () =>
      (group.members ?? [])
        .map((member) => member.user)
        .filter(
          (user) =>
            user?.id &&
            user.id !== group.owner?.id &&
            user.id !== group.ownerId,
        ),
    [group.members, group.owner?.id, group.ownerId],
  );

  const visibleMembers = nonOwnerMembers.slice(0, 5);
  const remainingMembers = Math.max(
    nonOwnerMembers.length - visibleMembers.length,
    0,
  );
  const isCurrentUserMember =
    !!currentUserId &&
    (group.members ?? []).some((member) => member.user?.id === currentUserId);
  const createdDate = group.createdAt
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
        new Date(group.createdAt),
      )
    : t("search.unknownDate");

  const handleCardClick = () => {
    if (isCurrentUserMember) {
      navigate(ROUTES.CHAT_TAB_GROUPS_ID.url.replace(":id", group.id));
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative flex items-start gap-4 rounded-3xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs transition-all duration-300 hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5 ${
        isCurrentUserMember ? "cursor-pointer" : ""
      }`}
    >
      <div className="h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-2xl bg-muted/60 border border-border/50">
        {group.avatar ? (
          <img
            src={group.avatar}
            alt={group.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
            <Users size={22} />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 pr-6">
        <div className="min-w-0">
          <p className="truncate text-sm sm:text-base font-extrabold text-foreground group-hover:text-primary transition-colors">
            {group.name}
          </p>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
            {group.description || t("search.noGroupDescription")}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-xl"
              aria-label={t("search.groupDetails")}
            >
              <Info className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2 shadow-lg">
            <DropdownMenuLabel className="font-bold text-xs">{t("search.groupDetails")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="space-y-3 p-2 text-xs">
              <div className="flex items-center gap-3">
                <AvatarBubble user={group.owner} className="h-9 w-9" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <UserRound className="h-3 w-3" />
                    {t("search.owner")}
                  </div>
                  <p className="truncate font-bold text-foreground">
                    {group.owner?.fullName ||
                      group.owner?.username ||
                      t("search.unknownOwner")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                <span>{t("search.createdAt", { date: createdDate })}</span>
              </div>
              {group.languages && group.languages.length > 0 && (
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Languages className="h-3.5 w-3.5 text-primary" />
                  <span className="font-medium">
                    {group.languages.map((lang) => {
                      try {
                        return new Intl.DisplayNames([i18n.language], { type: "language" }).of(lang);
                      } catch {
                        return lang.toUpperCase();
                      }
                    }).join(" + ")}
                  </span>
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="mt-3 flex items-center justify-between gap-3">
          {/* Member avatars */}
          <div className="flex items-center">
            {visibleMembers.map((member) => (
              <div key={member.id} className="-ml-2 first:ml-0">
                <AvatarBubble user={member} />
              </div>
            ))}
            {remainingMembers > 0 && (
              <div className="-ml-2 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-background bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow-xs">
                +{remainingMembers}
              </div>
            )}
          </div>

          {!isCurrentUserMember && (
            <Button
              type="button"
              size="sm"
              className="h-8 rounded-xl px-3.5 text-xs font-bold shadow-xs cursor-pointer active:scale-95"
              disabled={joinMutation.isPending}
              onClick={(e) => {
                e.stopPropagation();
                if (!currentUserId) {
                  navigate(ROUTES.LOGIN.url);
                  return;
                }
                joinMutation.mutate(group.id);
              }}
            >
              {joinMutation.isPending ? t("search.joining") : t("search.join")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
