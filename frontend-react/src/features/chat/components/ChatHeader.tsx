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
    <div className="border-b border-border/60 px-5 h-[72px] flex flex-col justify-center bg-card/60 backdrop-blur-xs shrink-0">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onBack}
          aria-label={t("chat.backToList")}
          title={t("chat.back")}
          className={`shrink-0 h-9 w-9 rounded-xl hover:bg-muted ${!embedded ? "md:hidden" : ""}`}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        {selectedGroup ? (
          <>
            <div className="relative shrink-0">
              <Avatar className="h-11 w-11 rounded-2xl border border-border/40">
                <AvatarImage src={selectedGroup?.avatar || undefined} />
                <AvatarFallback className="rounded-2xl">
                  {getInitials(selectedGroup.name || t("chat.group"))}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-foreground truncate">
                {selectedGroup.name || t("chat.group")}
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5 font-medium">
                {selectedGroup.members && selectedGroup.members.length > 0 && (
                  <span>{selectedGroup.members.length} {t("chat.members", { defaultValue: "thành viên" })}</span>
                )}
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onGroupInfoClick}
              aria-label={t("chat.groupInfo")}
              title={t("chat.groupInfo")}
              className="h-9 w-9 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground"
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
              className="hover:opacity-80 transition-opacity relative shrink-0"
              aria-label={t("chat.viewProfileOf", { name: selectedUserDisplayName })}
            >
              <Avatar className="h-11 w-11 rounded-2xl border border-border/40">
                <AvatarImage src={selectedUser?.avatar || undefined} />
                <AvatarFallback className="rounded-2xl">
                  {getInitials(selectedUserDisplayName)}
                </AvatarFallback>
              </Avatar>
              {isSelectedUserOnline && (
                <div className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-emerald-500 border-2 border-card rounded-full shadow-xs" />
              )}
            </Link>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-foreground truncate">{selectedUserDisplayName}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5 font-medium">
                {isSelectedUserOnline ? (
                  <>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{t("chat.online")}</span>
                  </>
                ) : (
                  <span>{t("chat.offline")}</span>
                )}
              </div>
            </div>
            {onCallClick && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onCallClick}
                title={t("chat.voiceCall")}
                className="shrink-0 h-9 w-9 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <Phone className="h-4 w-4" />
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
