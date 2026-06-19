import { NavLink, useLocation } from "react-router";
import {
  Home,
  BookOpen,
  BookMarked,
  MessageCircle,
  PenSquare,
  ChartNoAxesCombined,
} from "lucide-react";
import ROUTES from "@/shared/lib/routes";
import { useTranslation } from "@/shared/hooks/useTranslation";

export default function LeftSidebar() {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { label: t("common.home"), url: ROUTES.HOME.url, icon: Home },
    { label: t("common.grammar"), url: ROUTES.GRAMMAR.url, icon: BookOpen },
    {
      label: t("common.vocabulary"),
      url: ROUTES.VOCABULARY.url,
      icon: BookMarked,
    },
    { label: t("common.stats"), url: ROUTES.STATS.url, icon: ChartNoAxesCombined },
    { label: t("common.chat"), url: ROUTES.CHAT_TAB_USERS.url, icon: MessageCircle, activePrefix: "/chat" },
    { label: t("common.blog"), url: ROUTES.BLOG.url, icon: PenSquare },
  ];

  return (
    <aside className="bg-card h-full min-h-0 overflow-auto overscroll-contain w-64">
      <nav className="flex flex-col gap-1 p-3 pt-4">
        {navItems.map(({ label, url, icon: Icon, activePrefix }) => (
          <NavLink
            key={url}
            to={url}
            end={url === "/"}
            className={({ isActive }) => {
              const active = activePrefix
                ? location.pathname.startsWith(activePrefix)
                : isActive;
              return `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground/70 hover:bg-muted hover:text-foreground"
              }`;
            }}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
