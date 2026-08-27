import { Link } from "react-router";
import { BookMarked, BookOpen, PenSquare, MessageCircle, ChevronRight } from "lucide-react";
import ROUTES from "@/shared/lib/routes";
import { useTranslation } from "@/shared/hooks/useTranslation";

export default function QuickActionsCard() {
  const { t } = useTranslation();

  const quickActions = [
    {
      title: t("home.actions.vocabulary"),
      desc: t("home.actions.vocabularyDesc"),
      icon: BookMarked,
      href: ROUTES.VOCABULARY.url,
      bg: "bg-indigo-500/10 group-hover/card:bg-indigo-500/20",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      borderColor: "hover:border-indigo-500/40",
      badgeColor: "text-indigo-600 dark:text-indigo-400",
    },
    {
      title: t("home.actions.grammar"),
      desc: t("home.actions.grammarDesc"),
      icon: BookOpen,
      href: ROUTES.GRAMMAR.url,
      bg: "bg-emerald-500/10 group-hover/card:bg-emerald-500/20",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      borderColor: "hover:border-emerald-500/40",
      badgeColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: t("home.actions.blog"),
      desc: t("home.actions.blogDesc"),
      icon: PenSquare,
      href: ROUTES.BLOG.url,
      bg: "bg-purple-500/10 group-hover/card:bg-purple-500/20",
      iconColor: "text-purple-600 dark:text-purple-400",
      borderColor: "hover:border-purple-500/40",
      badgeColor: "text-purple-600 dark:text-purple-400",
    },
    {
      title: t("home.actions.chat"),
      desc: t("home.actions.chatDesc"),
      icon: MessageCircle,
      href: ROUTES.CHAT_TAB_USERS.url,
      bg: "bg-sky-500/10 group-hover/card:bg-sky-500/20",
      iconColor: "text-sky-600 dark:text-sky-400",
      borderColor: "hover:border-sky-500/40",
      badgeColor: "text-sky-600 dark:text-sky-400",
    },
  ];

  return (
    <section className="flex flex-col justify-between">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
          {t("home.quickActions")}
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 flex-1">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            to={action.href}
            className={`group/card relative flex items-start gap-3.5 rounded-3xl bg-card border border-border/70 p-4 transition-all duration-200 hover:shadow-md ${action.borderColor} hover:-translate-y-0.5`}
          >
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-all duration-200 shadow-xs ${action.bg}`}
            >
              <action.icon size={20} className={`transition-transform duration-200 group-hover/card:scale-110 ${action.iconColor}`} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground group-hover/card:text-primary transition-colors">
                  {action.title}
                </h3>
                <ChevronRight size={15} className="text-muted-foreground/50 transition-transform duration-200 group-hover/card:translate-x-1 group-hover/card:text-primary" />
              </div>
              <p className="mt-1 text-xs text-muted-foreground leading-snug line-clamp-2">
                {action.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
