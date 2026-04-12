import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Search, Sun, Moon, Menu } from "lucide-react";
import { getInitials } from "@/shared/lib/utils";
import { useTheme } from "@/shared/components/ThemeProvider";

import { EditProfileDialog } from "@/features/auth/components/EditProfileDialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Input } from "@/shared/components/ui/input";
import ROUTES from "@/shared/lib/routes";
import type { MeResponse } from "@/shared/validations/AuthSchema";
import { useLogoutMutation } from "@/features/auth/api/authService";
import { useAppSelector, useAppDispatch } from "@/shared/stores/redux/hooks";
import { logoutAction } from "@/shared/stores/redux/authActions";

interface MainHeaderProps {
  me: MeResponse | undefined | null;
  toggleLeftSidebar?: () => void;
}

export default function MainHeader({ me, toggleLeftSidebar }: MainHeaderProps) {
  const [headerSearch, setHeaderSearch] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  const logoutMutation = useLogoutMutation();

  const navigate = useNavigate();

  const dispatch = useAppDispatch();
  const refreshToken = useAppSelector(
    (state) => state.auth.token?.refreshToken,
  );

  async function handleLogout() {
    if (!refreshToken) {
      // Nếu không có refresh token thì cứ logout ở client
      dispatch(logoutAction());
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

  function onProfileOpenChange(open: boolean) {
    setProfileOpen(open);
  }

  const displayName = useMemo(() => {
    return me?.fullName || me?.username || "User";
  }, [me]);

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
              to={ROUTES.BLOG.url}
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
              placeholder="Tìm kiếm trên Blog..."
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

            <button
              type="button"
              onClick={() => onProfileOpenChange(true)}
              className="shrink-0 transition-transform active:scale-95"
              aria-label="Mở thông tin cá nhân"
            >
              <Avatar className="h-11 w-11 border-2 border-border/50">
                <AvatarImage src={me?.avatar || "image.png"} />
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
            </button>
          </div>
        </div>
      </header>

      <EditProfileDialog
        open={profileOpen}
        onOpenChange={onProfileOpenChange}
        me={me}
        onLogout={handleLogout}
      />
    </>
  );
}
