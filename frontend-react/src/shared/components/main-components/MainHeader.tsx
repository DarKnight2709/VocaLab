import { Link, useNavigate } from "react-router";
import { Menu, Bell, Sun, Moon } from "lucide-react";
import { toast } from "sonner";

import { AccountMenu } from "@/features/auth/components/account-menu/AccountMenu";
import ROUTES from "@/shared/lib/routes";
import type { MeResponse } from "@/shared/validations/AuthSchema";
import { useLogoutMutation } from "@/features/auth/api/authService";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { useTranslation } from "@/shared/hooks/useTranslation";
import { useUnreadCountQuery } from "@/features/notification/api/notificationService";
import { SearchBar } from "@/shared/components/SearchBar";
import { useTheme } from "@/shared/components/ThemeProvider";

interface MainHeaderProps {
  me: MeResponse | undefined | null;
  toggleLeftSidebar?: () => void;
}

export default function MainHeader({ me, toggleLeftSidebar }: MainHeaderProps) {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();

  const logoutMutation = useLogoutMutation();

  const navigate = useNavigate();

  const logout = useAuthStore((state) => state.logout);

  async function handleLogout() {
    try {
      await logoutMutation.mutateAsync();
      logout();
      navigate(ROUTES.LOGIN.url);
    } catch (error) {
      console.error("Logout error:", error);
      logout();
      navigate(ROUTES.LOGIN.url);
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
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md transition-colors border-b border-border/80 shadow-xs">
        <div className="h-16 md:h-20 px-3 md:px-6 flex items-center justify-between gap-3 md:gap-4">
          <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
            <button
              type="button"
              onClick={toggleLeftSidebar}
              className="inline-flex h-9.5 w-9.5 md:h-10 md:w-10 items-center justify-center rounded-xl hover:bg-muted/80 active:scale-95 transition-all text-foreground"
              aria-label={t("common.toggleSidebar")}
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link
              to={ROUTES.HOME.url}
              aria-label={t("common.home")}
              className="inline-flex items-center rounded-xl p-1 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 shrink-0 transition-opacity hover:opacity-90"
            >
              <img
                src="/logo1.png"
                alt={t("common.logoAlt")}
                className="h-14 md:h-20 w-auto object-contain scale-110 md:scale-125 origin-left"
              />
            </Link>
          </div>

          <div className="flex-1 flex justify-center min-w-0 px-2 max-w-xl mx-auto">
            <SearchBar />
          </div>

          <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="inline-flex h-9.5 w-9.5 md:h-10 md:w-10 items-center justify-center rounded-xl hover:bg-muted/80 active:scale-95 transition-all text-foreground relative border border-transparent hover:border-border/60"
              aria-label={t("common.toggleTheme")}
              title={theme === "dark" ? t("common.lightMode") || "Light mode" : t("common.darkMode") || "Dark mode"}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-amber-500 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="h-5 w-5 text-slate-700 hover:-rotate-12 transition-transform" />
              )}
            </button>

            {/* Notifications Button */}
            <button
              type="button"
              onClick={() => navigate(ROUTES.ME_NOTIFICATION.url)}
              className="inline-flex h-9.5 w-9.5 md:h-10 md:w-10 items-center justify-center rounded-xl hover:bg-muted/80 active:scale-95 transition-all text-foreground relative border border-transparent hover:border-border/60"
              aria-label={t("common.notifications")}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-xs ring-2 ring-background">
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
