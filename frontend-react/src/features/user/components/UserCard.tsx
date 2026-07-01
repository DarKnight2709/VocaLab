import { Link } from "react-router-dom";
import { UserPlus, Check } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import ROUTES from "@/shared/lib/routes";
import { useFollowUserMutation, useUnfollowUserMutation } from "../api/userService";
import { useMeQuery } from "@/features/auth/api/authService";
import { getInitials } from "@/shared/lib/utils";
import { useTranslation } from "@/shared/hooks/useTranslation";

interface UserCardProps {
  user: {
    id: string;
    username: string;
    fullName?: string | null;
    avatar?: string | null;
    isFollowing?: boolean;
    canFollow?: boolean;
  };
}

export function UserCard({ user }: UserCardProps) {
  const { t } = useTranslation();
  const { data: me } = useMeQuery();
  const isMe = me?.id === user.id;

  const followMutation = useFollowUserMutation();
  const unfollowMutation = useUnfollowUserMutation();

  const handleFollowAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (user.isFollowing) {
      unfollowMutation.mutate(user.id);
    } else {
      followMutation.mutate(user.id);
    }
  };

  const displayName = user.fullName || user.username;

  return (
    <Link
      to={ROUTES.PROFILE.url.replace(":username", user.username)}
      className="group relative flex items-center gap-3 rounded-3xl bg-transparent p-3 shadow-none backdrop-blur-0 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
    >
      <div className="relative">
        <Avatar className="h-12 w-12 ring-1 ring-border/70 ring-offset-0 transition-colors">
          <AvatarImage src={user.avatar || undefined} />
          <AvatarFallback className="bg-muted text-muted-foreground text-xs">
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>
        {user.isFollowing && (
          <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-[10px] text-white ring-2 ring-background shadow-sm dark:bg-zinc-100 dark:text-zinc-900">
            <Check className="h-3 w-3 stroke-[3px]" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-semibold text-foreground">
          {displayName}
        </h4>
        <p className="truncate text-[11px] leading-4 text-muted-foreground/80 font-medium">
          @{user.username}
        </p>
      </div>

      {!isMe && user.isFollowing !== undefined && (user.canFollow || user.isFollowing) && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleFollowAction}
          disabled={followMutation.isPending || unfollowMutation.isPending}
          className="ml-2 h-8 rounded-full border-border/60 bg-muted/70 px-4 text-[11px] font-medium text-foreground shadow-none transition-colors hover:bg-muted/90 active:scale-95 dark:bg-muted/20 dark:text-foreground dark:hover:bg-muted/30"
        >
          {user.isFollowing ? (
            t("profile.unfollow")
          ) : (
            <span className="flex items-center gap-1.5">
              <UserPlus className="h-3.5 w-3.5" />
              {t("profile.follow")}
            </span>
          )}
        </Button>
      )}
    </Link>
  );
}
