import { Link, useNavigate } from "react-router";
import { Sun, Moon, Menu } from "lucide-react";
import { useTheme } from "@/shared/components/ThemeProvider";
import ROUTES from "@/shared/lib/routes";
import { useTranslation } from "@/shared/hooks/useTranslation";
import { SearchBar } from "@/shared/components/SearchBar";
import { Button } from "@/shared/components/ui/button";

interface PublicHeaderProps {
  toggleLeftSidebar?: () => void;
}

export default function PublicHeader({ toggleLeftSidebar }: PublicHeaderProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md transition-colors border-b border-border/80 shadow-xs">
      <div className="h-16 md:h-20 px-3 md:px-6 flex items-center gap-2 md:gap-4">
        <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
          <button
            type="button"
            onClick={toggleLeftSidebar}
            className="inline-flex h-9.5 w-9.5 md:h-10 md:w-10 items-center justify-center rounded-xl hover:bg-muted/80 active:scale-95 transition-all text-foreground cursor-pointer"
            aria-label={t("common.toggleSidebar")}
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link
            to="/"
            aria-label={t("common.home")}
            className="inline-flex items-center rounded-xl p-1 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 shrink-0"
          >
            <img
              src="/logo1.png"
              alt={t("common.logoAlt") || "VocaLab Logo"}
              className="h-14 md:h-20 w-auto object-contain scale-110 md:scale-125 origin-left"
            />
          </Link>
        </div>

        <div className="flex-1 flex justify-center min-w-0 px-2">
          <SearchBar />
        </div>

        <div className="ml-auto flex items-center gap-1.5 md:gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="inline-flex h-9.5 w-9.5 md:h-10 md:w-10 items-center justify-center rounded-xl hover:bg-muted/80 active:scale-95 transition-all text-foreground cursor-pointer"
            aria-label={t("common.toggleTheme")}
          >
            {theme === "dark" ? (
              <Sun className="h-4.5 w-4.5 text-yellow-500" />
            ) : (
              <Moon className="h-4.5 w-4.5 text-indigo-600" />
            )}
          </button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate(ROUTES.LOGIN.url)}
              className="hidden sm:inline-flex h-9.5 px-4 rounded-xl text-xs font-bold hover:bg-muted cursor-pointer"
            >
              {t("auth.signIn", "Đăng nhập")}
            </Button>
            <Button
              onClick={() => navigate(ROUTES.LOGIN.url)}
              className="h-9.5 px-4.5 rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              {t("auth.getStarted", "Bắt đầu")}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
