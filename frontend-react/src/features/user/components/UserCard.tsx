import { Link, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const { data: me } = useMeQuery();
  const isMe = me?.id === user.id;

  const followMutation = useFollowUserMutation();
  const unfollowMutation = useUnfollowUserMutation();

  const handleFollowAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!me) {
      navigate(ROUTES.LOGIN.url);
      return;
    }
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
      className="group relative flex items-center gap-3.5 rounded-3xl border border-border/80 bg-card p-3.5 sm:p-4 shadow-xs hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="relative shrink-0">
        <Avatar className="h-12 w-12 border-2 border-background shadow-xs ring-1 ring-border/60 transition-transform duration-300 group-hover:scale-105">
          <AvatarImage src={user.avatar || undefined} />
          <AvatarFallback className="bg-muted text-foreground text-xs font-bold">
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>
        {user.isFollowing && (
          <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground ring-2 ring-background shadow-xs">
            <Check className="h-3 w-3 stroke-[3px]" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-bold text-foreground group-hover:text-primary transition-colors">
          {displayName}
        </h4>
        <p className="truncate text-[11px] leading-4 text-muted-foreground font-medium">
          @{user.username}
        </p>
      </div>

      {!isMe && user.isFollowing !== undefined && (user.canFollow || user.isFollowing) && (
        <Button
          size="sm"
          variant={user.isFollowing ? "outline" : "default"}
          onClick={handleFollowAction}
          disabled={followMutation.isPending || unfollowMutation.isPending}
          className="ml-2 h-8 rounded-xl px-3.5 text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all shrink-0"
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
