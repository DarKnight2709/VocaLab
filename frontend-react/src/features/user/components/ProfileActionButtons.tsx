import { Button } from "@/shared/components/ui/button";
import { MessageCircle, Pencil, UserPlus } from "lucide-react";
import {
  useCheckFollowingListQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
} from "../api/userService";

type ProfileActionButtonsProps = {
  isOwnProfile: boolean;
  onEditProfile: () => void;
  profileUserId: string | undefined;
};

export default function ProfileActionButtons({
  isOwnProfile,
  onEditProfile,
  profileUserId,
}: ProfileActionButtonsProps) {
  if (isOwnProfile) {
    return (
      <Button size="lg" onClick={onEditProfile}>
        <Pencil className="mr-1.5 h-4 w-4" />
        Chỉnh sửa hồ sơ
      </Button>
    );
  }

  // check dữ liệu gửi từ backend xem người này có trong following list của mình không
  const { data: followStatus } = useCheckFollowingListQuery(profileUserId);

  const followMutation = useFollowUserMutation();
  const unfollowMutation = useUnfollowUserMutation();

  const handleFollowAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (followStatus?.isFollowing) {
      unfollowMutation.mutate(profileUserId!);
    } else {
      followMutation.mutate(profileUserId!);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        size="lg"
        variant="outline"
        className="rounded-full px-6 font-bold transition-all active:scale-95 shadow-sm hover:bg-muted"
      >
        <MessageCircle className="h-5 w-5" />
        Nhắn tin
      </Button>
      <Button
        size="lg"
        variant={followStatus?.isFollowing ? "secondary" : "default"}
        onClick={handleFollowAction}
        disabled={followMutation.isPending || unfollowMutation.isPending}
        className="rounded-full px-6 font-bold transition-all active:scale-95 shadow-sm hover:shadow-md min-w-[140px]"
      >
        {followStatus?.isFollowing ? (
          "Unfollow"
        ) : (
          <span className="flex items-center gap-1.5">
            <UserPlus className="h-5 w-5" />
            Follow
          </span>
        )}
      </Button>
    </div>
  );
}
