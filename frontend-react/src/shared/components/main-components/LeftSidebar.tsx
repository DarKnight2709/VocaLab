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
    {
      label: t("common.home"),
      url: ROUTES.HOME.url,
      icon: Home,
      iconColor: "text-rose-500 dark:text-rose-400",
      activeBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold",
    },
    {
      label: t("common.vocabulary"),
      url: ROUTES.VOCABULARY.url,
      icon: BookMarked,
      iconColor: "text-indigo-600 dark:text-indigo-400",
      activeBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold",
    },
    {
      label: t("common.grammar"),
      url: ROUTES.GRAMMAR.url,
      icon: BookOpen,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      activeBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold",
    },
    {
      label: t("common.stats"),
      url: ROUTES.STATS.url,
      icon: ChartNoAxesCombined,
      iconColor: "text-amber-500 dark:text-amber-400",
      activeBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold",
    },
  ];

  const socialItems = [
    {
      label: t("common.chat"),
      url: ROUTES.CHAT_TAB_USERS.url,
      icon: MessageCircle,
      activePrefix: "/chat",
      iconColor: "text-sky-500 dark:text-sky-400",
      activeBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold",
    },
    {
      label: t("common.blog"),
      url: ROUTES.BLOG.url,
      icon: PenSquare,
      iconColor: "text-purple-600 dark:text-purple-400",
      activeBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold",
    },
    {
      label: t("common.video"),
      url: ROUTES.VIDEO.url,
      icon: MonitorPlay,
      iconColor: "text-pink-500 dark:text-pink-400",
      activeBg: "bg-pink-500/10 text-pink-600 dark:text-pink-400 font-semibold",
    },
  ];

  const renderNavItem = ({
    label,
    url,
    icon: Icon,
    activePrefix,
    iconColor,
    activeBg,
  }: {
    label: string;
    url: string;
    icon: React.ComponentType<{ className?: string }>;
    activePrefix?: string;
    iconColor: string;
    activeBg: string;
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
        return `group relative flex items-center py-2 px-3 rounded-xl text-sm font-medium transition-all duration-150 overflow-hidden ${
          isMinimized ? "justify-center" : "gap-3"
        } ${
          active
            ? `${activeBg} shadow-xs`
            : "text-foreground/70 hover:bg-muted/70 hover:text-foreground"
        }`;
      }}
    >
      <div className="flex justify-center items-center shrink-0 w-5 h-5">
        <Icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${iconColor}`} />
      </div>
      <span
        className={`whitespace-nowrap transition-all duration-200 ${isMinimized ? "w-0 opacity-0 pointer-events-none" : "w-auto opacity-100"}`}
      >
        {label}
      </span>
    </NavLink>
  );

  return (
    <aside
      className={`bg-sidebar h-full min-h-0 flex flex-col transition-all duration-300 ${isMinimized ? "w-16" : "w-64"}`}
    >
      <nav className="flex flex-col gap-1 p-3 pt-3 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
        {/* Core Navigation */}
        {!isMinimized && (
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 px-3 pt-1 pb-1">
            {t("common.learn") || "Learn"}
          </div>
        )}
        <div className="flex flex-col gap-1">
          {coreItems.map(renderNavItem)}
        </div>

        {/* Divider */}
        <div className="my-2 mx-3 border-t border-border/60" />

        {/* Social */}
        {!isMinimized && (
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 px-3 pt-1 pb-1">
            {t("common.discover") || "Discover"}
          </div>
        )}
        <div className="flex flex-col gap-1">
          {socialItems.map(renderNavItem)}
        </div>
      </nav>
    </aside>
  );
}
