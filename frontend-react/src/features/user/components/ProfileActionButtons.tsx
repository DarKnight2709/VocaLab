import { Button } from "@/shared/components/ui/button";
import { MessageCircle, Pencil, UserPlus } from "lucide-react";
import {
  useBlockUserMutation,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useUnblockUserMutation,
} from "../api/userService";
import { useTranslation } from "@/shared/hooks/useTranslation";
import { useNavigate } from "react-router";
import ROUTES from "@/shared/lib/routes";
import { MoreOptionsMenu } from "./MoreOptionsMenu";
import { useOptionalAuth } from "@/features/auth/hooks/useOptionalAuth";

interface ProfileActionButtonsProps {
  isOwnProfile: boolean;
  onEditProfile: () => void;
  profileUserId: string | undefined;
  profileUsername?: string;
  profileFullName?: string | null;
  profileAvatar?: string | null;
  isFollowing?: boolean;
  canFollow?: boolean;
  canChat?: boolean;
  isBlocking?: boolean;
}

export default function ProfileActionButtons({
  isOwnProfile,
  onEditProfile,
  profileUserId,
  profileUsername,
  profileFullName,
  profileAvatar,
  isFollowing,
  canFollow,
  canChat,
  isBlocking,
}: ProfileActionButtonsProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuth } = useOptionalAuth();

  // Move all hooks to the top, before any conditional logic
  const followMutation = useFollowUserMutation();
  const unfollowMutation = useUnfollowUserMutation();
  const blockUserMutation = useBlockUserMutation();
  const unblockUserMutation = useUnblockUserMutation();

  if (isOwnProfile) {
    return (
      <Button
        size="default"
        onClick={onEditProfile}
        className="h-10 px-5 rounded-2xl font-bold text-xs gap-2 shadow-xs cursor-pointer active:scale-95 transition-all"
      >
        <Pencil className="h-4 w-4" />
        <span>{t("profile.editProfile")}</span>
      </Button>
    );
  }

  const handleFollowAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuth) {
      navigate(ROUTES.LOGIN.url);
      return;
    }
    if (isFollowing) {
      unfollowMutation.mutate(profileUserId!);
    } else {
      followMutation.mutate(profileUserId!);
    }
  };

  const handleChatAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuth) {
      navigate(ROUTES.LOGIN.url);
      return;
    }
    if (!profileUserId) return;
    navigate(ROUTES.CHAT_TAB_USERS_ID.url.replace(":id", profileUserId), {
      state: {
        startChatWith: {
          id: profileUserId,
          username: profileUsername || "",
          fullName: profileFullName || profileUsername || "",
          avatar: profileAvatar || null,
        },
      },
    });
  };

  const handleBlockUser = () => {
    if (!isAuth) {
      navigate(ROUTES.LOGIN.url);
      return;
    }
    if (!profileUserId) return;
    if (isBlocking) {
      unblockUserMutation.mutate(profileUserId);
    } else {
      blockUserMutation.mutate(profileUserId);
    }
  };

  const showFollowButton = canFollow || isFollowing;

  if (!showFollowButton && !canChat) return null;

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {canChat && (
        <Button
          size="default"
          variant="outline"
          onClick={handleChatAction}
          className="h-10 px-5 rounded-2xl border-border/80 font-bold text-xs gap-2 shadow-xs hover:bg-muted/80 cursor-pointer active:scale-95 transition-all"
        >
          <MessageCircle className="h-4 w-4 text-primary" />
          <span>{t("profile.message")}</span>
        </Button>
      )}
      {showFollowButton && (
        <Button
          size="default"
          variant={isFollowing ? "outline" : "default"}
          onClick={handleFollowAction}
          disabled={followMutation.isPending || unfollowMutation.isPending}
          className="h-10 px-5 rounded-2xl font-bold text-xs gap-2 shadow-xs cursor-pointer active:scale-95 transition-all min-w-[120px]"
        >
          {isFollowing ? (
            <span>{t("profile.unfollow")}</span>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              <span>{t("profile.follow")}</span>
            </>
          )}
        </Button>
      )}
      <MoreOptionsMenu onBlockUser={handleBlockUser} isBlocking={isBlocking} />
    </div>
  );
}
