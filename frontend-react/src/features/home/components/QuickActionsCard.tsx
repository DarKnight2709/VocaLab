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
      color: "from-emerald-500/15 to-teal-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: t("home.actions.grammar"),
      desc: t("home.actions.grammarDesc"),
      icon: BookOpen,
      href: ROUTES.GRAMMAR.url,
      color: "from-blue-500/15 to-indigo-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: t("home.actions.blog"),
      desc: t("home.actions.blogDesc"),
      icon: PenSquare,
      href: ROUTES.BLOG.url,
      color: "from-amber-500/15 to-orange-500/10",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    {
      title: t("home.actions.chat"),
      desc: t("home.actions.chatDesc"),
      icon: MessageCircle,
      href: ROUTES.CHAT_TAB_USERS.url,
      color: "from-purple-500/15 to-fuchsia-500/10",
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
            className="group/card flex items-start gap-3 rounded-2xl bg-card p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${action.color}`}
            >
              <action.icon size={20} className={action.iconColor} />
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
