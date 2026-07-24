import { NavLink, useLocation } from "react-router";
import {
  Home,
  BookOpen,
  BookMarked,
  MessageCircle,
  PenSquare,
  ChartNoAxesCombined,
  MonitorPlay,
} from "lucide-react";
import ROUTES from "@/shared/lib/routes";
import { useTranslation } from "@/shared/hooks/useTranslation";

export default function LeftSidebar({
  isMinimized = false,
}: {
  isMinimized?: boolean;
}) {
  const { t } = useTranslation();
  const location = useLocation();

  const coreItems = [
    { label: t("common.home"), url: ROUTES.HOME.url, icon: Home },
    {
      label: t("common.vocabulary"),
      url: ROUTES.VOCABULARY.url,
      icon: BookMarked,
    },
    { label: t("common.grammar"), url: ROUTES.GRAMMAR.url, icon: BookOpen },
    {
      label: t("common.stats"),
      url: ROUTES.STATS.url,
      icon: ChartNoAxesCombined,
    },
  ];

  const socialItems = [
    {
      label: t("common.chat"),
      url: ROUTES.CHAT_TAB_USERS.url,
      icon: MessageCircle,
      activePrefix: "/chat",
    },
    { label: t("common.blog"), url: ROUTES.BLOG.url, icon: PenSquare },
    { label: t("common.video"), url: ROUTES.VIDEO.url, icon: MonitorPlay },
  ];

  const renderNavItem = ({
    label,
    url,
    icon: Icon,
    activePrefix,
  }: {
    label: string;
    url: string;
    icon: React.ComponentType<{ className?: string }>;
    activePrefix?: string;
  }) => (
    <NavLink
      key={url}
      to={url}
      end={url === "/"}
      title={isMinimized ? label : undefined}
      className={({ isActive }) => {
        const active = activePrefix
          ? location.pathname.startsWith(activePrefix)
          : isActive;
        return `relative flex items-center py-2.5 rounded-xl text-sm font-medium transition-all duration-300 overflow-hidden px-2.5 ${
          isMinimized ? "gap-0" : "gap-3.5"
        } ${
          active
            ? "bg-primary/10 text-primary border-l-[3px] border-primary"
            : "text-foreground/70 hover:bg-muted hover:text-foreground border-l-[3px] border-transparent"
        } ${!isMinimized && !active ? "hover:translate-x-0.5" : ""}`;
      }}
    >
      <div className="flex justify-center items-center shrink-0 w-5 h-5">
        <Icon className="h-5 w-5" />
      </div>
      <span
        className={`whitespace-nowrap transition-all duration-300 ${isMinimized ? "w-0 opacity-0" : "w-auto opacity-100"}`}
      >
        {label}
      </span>
    </NavLink>
  );

  return (
    <aside
      className={`bg-card h-full min-h-0 flex flex-col transition-all duration-300 ${isMinimized ? "w-16" : "w-64"}`}
    >
      <nav className="flex flex-col gap-1 p-3 pt-4.5 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain transition-all duration-300">
        {/* Core Navigation */}
        <div className="flex flex-col gap-0.5">
          {coreItems.map(renderNavItem)}
        </div>

        {/* Divider */}
        <div className="my-3 mx-3 border-t border-border/50" />

        {/* Social */}
        <div className="flex flex-col gap-0.5">
          {socialItems.map(renderNavItem)}
        </div>
      </nav>
    </aside>
  );
}
