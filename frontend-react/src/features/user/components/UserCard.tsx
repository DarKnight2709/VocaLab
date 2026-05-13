import { Link } from "react-router-dom";
import { UserPlus, Check } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import ROUTES from "@/shared/lib/routes";
import { useCheckFollowingListQuery, useFollowUserMutation, useUnfollowUserMutation } from "../api/userService";
import { useMeQuery } from "@/features/auth/api/authService";
import { getInitials } from "@/shared/lib/utils";
import { useTranslation } from "@/shared/hooks/useTranslation";

interface UserCardProps {
  user: {
    id: string;
    username: string;
    fullName?: string | null;
    avatar?: string | null;
  };
}

export function UserCard({ user }: UserCardProps) {
  const { t } = useTranslation();
  const { data: me } = useMeQuery();
  const isMe = me?.id === user.id;

  const { data: followStatus } = useCheckFollowingListQuery(isMe ? undefined : user.id);
  const followMutation = useFollowUserMutation();
  const unfollowMutation = useUnfollowUserMutation();

  const handleFollowAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (followStatus?.isFollowing) {
      unfollowMutation.mutate(user.id);
    } else {
      followMutation.mutate(user.id);
    }
  };

  const displayName = user.fullName || user.username;

  return (
    <Link
      to={ROUTES.PROFILE.url.replace(":username", user.username)}
      className="group relative flex items-center gap-4 rounded-3xl border border-white/10 bg-white/50 p-4 transition-all duration-300 hover:border-primary/10 hover:bg-white/70 dark:bg-white/2 dark:hover:bg-white/4 backdrop-blur-xl shadow-sm hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="relative">
        <Avatar className="h-14 w-14 ring-2 ring-background ring-offset-2 ring-offset-primary/10 transition-transform group-hover:scale-105">
          <AvatarImage src={user.avatar || undefined} />
          <AvatarFallback className="bg-primary/5 text-primary text-xs">
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>
        {followStatus?.isFollowing && (
          <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-white ring-2 ring-background shadow-lg scale-110">
            <Check className="h-3 w-3 stroke-[3px]" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="truncate text-base font-bold text-foreground">
          {displayName}
        </h4>
        <p className="truncate text-xs text-muted-foreground/80 font-medium">
          @{user.username}
        </p>
      </div>

      {!isMe && (
        <Button
          size="sm"
          variant={followStatus?.isFollowing ? "outline" : "default"}
          onClick={handleFollowAction}
          disabled={followMutation.isPending || unfollowMutation.isPending}
          className="ml-2 rounded-full px-5 h-9 font-semibold text-xs transition-all active:scale-95 shadow-sm hover:shadow-md"
        >
          {followStatus?.isFollowing ? (
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
