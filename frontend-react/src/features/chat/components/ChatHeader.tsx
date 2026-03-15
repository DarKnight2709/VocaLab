import { Button } from "@/shared/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import ROUTES from "@/shared/lib/routes";
import { getInitials } from "../utils";
import type { UserItem } from "@/shared/validations/ChatSchema";
import type { GroupItem } from "@/shared/validations/GroupSchema";

type ChatHeaderProps = {
  embedded?: boolean;
  selectedUser: UserItem | null;
  selectedGroup: GroupItem | null;
  isSelectedUserOnline: boolean;
  onBack?: () => void;
  onGroupInfoClick?: () => void;
};

export function ChatHeader({
  embedded = false,
  selectedUser,
  selectedGroup,
  isSelectedUserOnline,
  onBack,
  onGroupInfoClick,
}: ChatHeaderProps) {
  const selectedUserDisplayName = selectedUser
    ? selectedUser.fullName || selectedUser.username || "User"
    : "Chọn người để chat";

  return (
    <div className="border-b p-4 bg-card">
      <div className="flex items-center gap-3">
        {embedded && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onBack}
            aria-label="Quay lại danh sách"
            title="Quay lại"
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        {selectedGroup ? (
          <>
            <Avatar className="h-10 w-10">
              <AvatarImage src={selectedGroup?.avatar || undefined} />
              <AvatarFallback>
                {getInitials(selectedGroup.name || "Nhóm")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="font-semibold">
                  {selectedGroup.name || "Nhóm"}
                </div>
                {isSelectedUserOnline && (
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {isSelectedUserOnline
                  ? "Đang hoạt động"
                  : "Không hoạt động"}
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onGroupInfoClick}
              aria-label="Xem thông tin nhóm"
              title="Thông tin nhóm"
            >
              ...
            </Button>
          </>
        ) : (
          <>
            <Link 
              to={ROUTES.PROFILE.url.replace(':fullName', selectedUser?.fullName || selectedUser?.username || 'user')}
              className="hover:opacity-80 transition-opacity"
              aria-label={`Xem trang cá nhân của ${selectedUserDisplayName}`}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedUser?.avatar || undefined} />
                <AvatarFallback>
                  {getInitials(selectedUserDisplayName)}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="font-semibold">
                  {selectedUserDisplayName}
                </div>
                {isSelectedUserOnline && (
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {isSelectedUserOnline
                  ? "Đang hoạt động"
                  : "Không hoạt động"}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
