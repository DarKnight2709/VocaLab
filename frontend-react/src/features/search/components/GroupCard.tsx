import { CalendarDays, Info, UserRound, Users } from "lucide-react";
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
  const { t } = useTranslation();
 const currentUserId = useAuthStore((state) => state.userId);
  // const joinMutation = useJoinSearchGroupMutation();

  const nonOwnerMembers = useMemo(
    () =>
      (group.members ?? [])
        .map((member) => member.user)
        .filter(
          (user) =>
            user?.id && user.id !== group.owner?.id && user.id !== group.ownerId,
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

  return (
    <div className="relative flex gap-4 rounded-xl border bg-card p-4 transition-all hover:border-primary/25 hover:bg-accent/5">
      <div className="my-auto h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
        {group.avatar ? (
          <img
            src={group.avatar}
            alt={group.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Users size={22} className="text-muted-foreground" />
          </div>
        )}
      </div>
       <div className="min-w-0 flex-1 pr-8 sm:pr-28">
        <div className="min-w-0">
          <p className="truncate font-semibold">{group.name}</p>
          <p className="mt-1 line-clamp-2 text-xs leading-4 text-muted-foreground">
            {group.description || t("search.noGroupDescription")}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              aria-label={t("search.groupDetails")}
            >
              <Info className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>{t("search.groupDetails")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="space-y-3 p-2 text-sm">
              <div className="flex items-center gap-3">
                <AvatarBubble user={group.owner} className="h-9 w-9" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <UserRound className="h-3 w-3" />
                    {t("search.owner")}
                  </div>
                  <p className="truncate font-medium">
                    {group.owner?.fullName ||
                      group.owner?.username ||
                      t("search.unknownOwner")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                <span>{t("search.createdAt", { date: createdDate })}</span>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="mt-2 flex items-center gap-3">
          <div className="min-w-0">
            <div className="flex items-center">
              {visibleMembers.map((member) => (
                <div key={member.id} className="-ml-2 first:ml-0">
                  <AvatarBubble user={member} />
                </div>
              ))}
              {remainingMembers > 0 && (
                <div className="-ml-2 flex h-7 min-w-7 items-center justify-center rounded-full border-2 border-background bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                  +{remainingMembers}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
       {!isCurrentUserMember && (
        <Button
          type="button"
          size="sm"
          className="absolute bottom-4 right-4 shrink-0"
          // disabled={joinMutation.isPending}
          // onClick={() => joinMutation.mutate(group.id)}
        >
          {/* {joinMutation.isPending ? t("search.joining") : t("search.join")} */}
        </Button>
      )}
    </div>
  );
}
