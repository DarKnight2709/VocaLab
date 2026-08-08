import { Link } from "react-router";
import { BookMarked, BookOpen, PenSquare, MessageCircle } from "lucide-react";
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
      bg: "bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: t("home.actions.grammar"),
      desc: t("home.actions.grammarDesc"),
      icon: BookOpen,
      href: ROUTES.GRAMMAR.url,
      bg: "bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: t("home.actions.blog"),
      desc: t("home.actions.blogDesc"),
      icon: PenSquare,
      href: ROUTES.BLOG.url,
      bg: "bg-amber-500/10",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    {
      title: t("home.actions.chat"),
      desc: t("home.actions.chatDesc"),
      icon: MessageCircle,
      href: ROUTES.CHAT_TAB_USERS.url,
      bg: "bg-purple-500/10",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
  ];

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold text-foreground">
        {t("home.quickActions")}
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            to={action.href}
            className="group/card flex items-start gap-3 rounded-2xl bg-card border border-border/40 p-4 transition-colors hover:bg-accent/40"
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${action.bg}`}
            >
              <action.icon size={18} className={action.iconColor} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold leading-tight">
                {action.title}
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground leading-snug">
                {action.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
