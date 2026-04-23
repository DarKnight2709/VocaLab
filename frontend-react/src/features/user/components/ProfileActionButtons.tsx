import { Button } from "@/shared/components/ui/button";
import { MessageCircle, Pencil, UserPlus } from "lucide-react";

type ProfileActionButtonsProps = {
  isOwnProfile: boolean;
  onEditProfile: () => void;
};

export default function ProfileActionButtons({
  isOwnProfile,
  onEditProfile,
}: ProfileActionButtonsProps) {
  if (isOwnProfile) {
    return (
      <Button size="lg" onClick={onEditProfile}>
        <Pencil className="mr-1.5 h-4 w-4"/>
        Chỉnh sửa hồ sơ
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Button size="lg">
        <MessageCircle className="mr-1.5 h-4 w-4" />
        Nhắn tin
      </Button>
      <Button variant="outline">
        <UserPlus className="mr-1.5 h-4 w-4" />
        Follow
      </Button>
    </div>
  );
}
