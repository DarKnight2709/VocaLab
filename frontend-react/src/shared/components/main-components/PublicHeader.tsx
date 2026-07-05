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
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm shadow-xs transition-colors">
      <div className="h-18 px-6 flex items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleLeftSidebar}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted transition-colors text-foreground"
            aria-label={t("common.toggleSidebar")}
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link
            to="/"
            aria-label={t("common.home")}
            className="inline-flex items-center rounded-xl p-1 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <img
              src="/logo1.png"
              alt={t("common.logoAlt") || "VocaLab Logo"}
              className="h-24 w-24"
            />
          </Link>
        </div>

        <SearchBar />

        <div className="ml-auto flex items-center gap-4">
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted transition-colors text-foreground"
            aria-label={t("common.toggleTheme")}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-yellow-500" />
            ) : (
              <Moon className="h-5 w-5 text-indigo-600" />
            )}
          </button>

          <div className="hidden sm:flex items-center gap-2">
            <Button
              onClick={() => navigate(ROUTES.LOGIN.url)}
              className="font-medium rounded-full px-6"
            >
              {t("auth.getStarted", "Get started")}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
