import { Link, useNavigate } from "react-router";
import { Menu, Bell } from "lucide-react";
import { toast } from "sonner";

import { AccountMenu } from "@/features/auth/components/account-menu/AccountMenu";
import ROUTES from "@/shared/lib/routes";
import type { MeResponse } from "@/shared/validations/AuthSchema";
import { useLogoutMutation } from "@/features/auth/api/authService";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { useTranslation } from "@/shared/hooks/useTranslation";
import { useUnreadCountQuery } from "@/features/notification/api/notificationService";
import { SearchBar } from "@/shared/components/SearchBar";

interface MainHeaderProps {
  me: MeResponse | undefined | null;
  toggleLeftSidebar?: () => void;
}

export default function MainHeader({ me, toggleLeftSidebar }: MainHeaderProps) {
  const { t } = useTranslation();

  const logoutMutation = useLogoutMutation();

  const navigate = useNavigate();

  const logout = useAuthStore((state) => state.logout);
  const refreshToken = useAuthStore((state) => state.authToken?.refreshToken);

  async function handleLogout() {
    if (!refreshToken) {
      // Nếu không có refresh token thì cứ logout ở client
      logout();
      navigate(ROUTES.LOGIN.url);
      return;
    }

    try {
      await logoutMutation.mutateAsync(refreshToken);
      navigate(ROUTES.LOGIN.url);
    } catch (error) {
      console.error("Logout error:", error);
    }
  }



  function handleViewProfile() {
    navigate(ROUTES.PROFILE.url.replace(":username", me?.username || "user"));
  }

  function handleOpenSettings() {
    navigate(ROUTES.ME_SETTING.url);
  }

  function handleHelp() {
    toast.info(t("common.helpSoon"));
  }



  const { data: unreadCount = 0 } = useUnreadCountQuery();

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm transition-colors">
        <div className="h-14 pl-3 pr-3 md:pr-6 flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-1 md:gap-3 shrink-0">
            <button
              type="button"
              onClick={toggleLeftSidebar}
              className="inline-flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-lg hover:bg-muted transition-colors text-foreground"
              aria-label={t("common.toggleSidebar")}
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link
              to={ROUTES.HOME.url}
              aria-label={t("common.home")}
              className="inline-flex items-center rounded-xl p-1 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 shrink-0"
            >
              <img
                src="/logo1.png"
                alt={t("common.logoAlt")}
                className="h-10 w-10 md:h-16 md:w-16 object-contain"
              />
            </Link>
          </div>

          <div className="flex-1 flex justify-center min-w-0 px-2">
            <SearchBar />
          </div>

          <div className="ml-auto flex items-center gap-1 md:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => navigate(ROUTES.ME_NOTIFICATION.url)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted transition-colors text-foreground relative"
              aria-label={t("common.notifications")}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-background">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>


            <AccountMenu
              me={me}
              onViewProfile={handleViewProfile}
              onOpenSettings={handleOpenSettings}
              onOpenHelp={handleHelp}
              onSignOut={() => void handleLogout()}
            />
          </div>
        </div>
      </header>
    </>
  );
}
