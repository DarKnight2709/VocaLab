import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Search, Sun, Moon, Menu } from "lucide-react";
import { useTheme } from "@/shared/components/ThemeProvider";
import { toast } from "sonner";

import { AccountMenu } from "@/features/auth/components/account-menu/AccountMenu";
import { Input } from "@/shared/components/ui/input";
import ROUTES from "@/shared/lib/routes";
import type { MeResponse } from "@/shared/validations/AuthSchema";
import { useLogoutMutation } from "@/features/auth/api/authService";
import { useAuthStore } from "@/features/auth/stores/authStore";

interface MainHeaderProps {
  me: MeResponse | undefined | null;
  toggleLeftSidebar?: () => void;
}

export default function MainHeader({ me, toggleLeftSidebar }: MainHeaderProps) {
  const [headerSearch, setHeaderSearch] = useState("");

  const logoutMutation = useLogoutMutation();

  const navigate = useNavigate();

  const logout = useAuthStore((state) => state.logout);
  const refreshToken = useAuthStore((state) => state.token?.refreshToken);

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

  function onHeaderSearchChange(value: string) {
    setHeaderSearch(value);
  }

  function handleViewProfile() {
    navigate(ROUTES.PROFILE.url.replace(":username", me?.username || "user"));
  }

  function handleOpenSettings() {
    navigate(ROUTES.ME_SETTING.url);
  }

  function handleHelp() {
    toast.info("Mục Help sẽ được cập nhật sớm");
  }

  const { theme, setTheme } = useTheme();

  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm shadow-xs transition-colors">
        <div className="h-18 px-6 flex items-center gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleLeftSidebar}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted transition-colors text-foreground"
              aria-label="Thu gọn/Mở rộng thanh bên"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link
              to={ROUTES.HOME.url}
              aria-label="Mở blog"
              className="inline-flex items-center rounded-xl p-1 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <img src="/logo1.png" alt="Blog app" className="h-24 w-24" />
            </Link>
          </div>

          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={headerSearch}
              onChange={(e) => onHeaderSearchChange(e.target.value)}
              placeholder="Tìm kiếm trên..."
              className="h-10 pl-9 bg-muted/50 border-transparent focus:bg-background focus:border-border transition-all"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted transition-colors text-foreground"
              aria-label="Đổi chế độ sáng/tối"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-indigo-600" />
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
