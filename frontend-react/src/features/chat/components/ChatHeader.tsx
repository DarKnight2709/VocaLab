import { Button } from "@/shared/components/ui/button";
import { useTranslation } from "@/shared/hooks/useTranslation";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { ArrowLeft, Phone, MoreHorizontal } from "lucide-react";
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
  onCallClick?: () => void;
};

export function ChatHeader({
  embedded = false,
  selectedUser,
  selectedGroup,
  isSelectedUserOnline,
  onBack,
  onGroupInfoClick,
  onCallClick,
}: ChatHeaderProps) {
  const { t } = useTranslation();
  const selectedUserDisplayName = selectedUser
    ? selectedUser.fullName || selectedUser.username || t("chat.user")
    : t("chat.chooseSomeone");

  return (
    <div className="border-b p-4 h-[76px] flex flex-col justify-center">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onBack}
          aria-label={t("chat.backToList")}
          title={t("chat.back")}
          className={`shrink-0 ${!embedded ? "md:hidden" : ""}`}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        {selectedGroup ? (
          <>
            <Avatar className="h-10 w-10">
              <AvatarImage src={selectedGroup?.avatar || undefined} />
              <AvatarFallback>
                {getInitials(selectedGroup.name || t("chat.group"))}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="font-semibold">
                  {selectedGroup.name || t("chat.group")}
                </div>
                {isSelectedUserOnline && (
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {isSelectedUserOnline ? t("chat.online") : t("chat.offline")}
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onGroupInfoClick}
              aria-label={t("chat.groupInfo")}
              title={t("chat.groupInfo")}
            >
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </>
        ) : (
          <>
            <Link
              to={ROUTES.PROFILE.url.replace(
                ":username",
                selectedUser?.username || t("chat.user"),
              )}
              className="hover:opacity-80 transition-opacity"
              aria-label={t("chat.viewProfileOf", { name: selectedUserDisplayName })}
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
                <div className="font-semibold">{selectedUserDisplayName}</div>
                {isSelectedUserOnline && (
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {isSelectedUserOnline ? t("chat.online") : t("chat.offline")}
              </div>
            </div>
            {onCallClick && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onCallClick}
                title={t("chat.voiceCall")}
                className="shrink-0"
              >
                <Phone className="h-5 w-5" />
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
