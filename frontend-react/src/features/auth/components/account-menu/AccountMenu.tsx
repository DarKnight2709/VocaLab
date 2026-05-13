import { useMemo } from "react";
import { CircleHelp, Settings, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { getInitials } from "@/shared/lib/utils";
import type { MeResponse } from "@/shared/validations/AuthSchema";
import { AccountMenuProfileBlock } from "./AccountMenuProfileBlock";
import { useTranslation } from "@/shared/hooks/useTranslation";

interface AccountMenuProps {
  me: MeResponse | undefined | null;
  onViewProfile: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onSignOut: () => void;
}

export function AccountMenu({
  me,
  onViewProfile,
  onOpenSettings,
  onOpenHelp,
  onSignOut,
}: AccountMenuProps) {
  const { t } = useTranslation();
  const displayName = useMemo(() => {
    return me?.fullName || me?.username || t("chat.user");
  }, [me, t]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="shrink-0 transition-transform active:scale-95"
          aria-label={t("common.openAccountMenu")}
        >
          <Avatar className="h-11 w-11 border-2 border-border/50">
            <AvatarImage src={me?.avatar || "image.png"} />
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-85 rounded-xl p-0"
      >
        <AccountMenuProfileBlock
          avatar={me?.avatar}
          displayName={displayName}
        />

        <DropdownMenuItem
          onClick={onViewProfile}
          className="px-4 py-3 text-base text-foreground"
        >
          <User  className="h-5 w-5 text-muted-foreground" />
          {t("common.viewProfile")}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onOpenSettings}
          className="px-4 py-3 text-base text-foreground"
        >
          <Settings className="h-5 w-5 text-muted-foreground" />
          {t("common.settings")}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onOpenHelp}
          className="px-4 py-3 text-base text-foreground"
        >
          <CircleHelp className="h-5 w-5 text-muted-foreground" />
          {t("common.help")}
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-0" />

        <DropdownMenuSeparator className="my-0" />

        <div className="px-4 py-3">
          <button
            type="button"
            onClick={onSignOut}
            className="text-left text-base text-foreground hover:opacity-80 transition-opacity"
          >
            {t("common.signOut")}
          </button>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {me?.email || ""}
          </p>
        </div>

        <DropdownMenuSeparator className="my-0" />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
