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

  // Move all hooks to the top, before any conditional logic
  const followMutation = useFollowUserMutation();
  const unfollowMutation = useUnfollowUserMutation();
  const blockUserMutation = useBlockUserMutation();
  const unblockUserMutation = useUnblockUserMutation();

  if (isOwnProfile) {
    return (
      <Button size="lg" onClick={onEditProfile}>
        <Pencil className="mr-1.5 h-4 w-4" />
        {t("profile.editProfile")}
      </Button>
    );
  }

  const handleFollowAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFollowing) {
      unfollowMutation.mutate(profileUserId!);
    } else {
      followMutation.mutate(profileUserId!);
    }
  };

  const handleChatAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!profileUserId) return;
    navigate(ROUTES.CHAT.url, {
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
    <div className="flex items-center gap-3">
      {canChat && (
        <Button
          size="lg"
          variant="outline"
          onClick={handleChatAction}
          className="rounded-full px-6 font-bold transition-all active:scale-95 shadow-sm hover:bg-muted"
        >
          <MessageCircle className="h-5 w-5" />
          {t("profile.message")}
        </Button>
      )}
      {showFollowButton && (
        <Button
          size="lg"
          variant={isFollowing ? "secondary" : "default"}
          onClick={handleFollowAction}
          disabled={followMutation.isPending || unfollowMutation.isPending}
          className="rounded-full px-6 font-bold transition-all active:scale-95 shadow-sm hover:shadow-md min-w-35"
        >
          {isFollowing ? (
            t("profile.unfollow")
          ) : (
            <span className="flex items-center gap-1.5">
              <UserPlus className="h-5 w-5" />
              {t("profile.follow")}
            </span>
          )}
        </Button>
      )}
      <MoreOptionsMenu onBlockUser={handleBlockUser} isBlocking={isBlocking} />
    </div>
  );
}
