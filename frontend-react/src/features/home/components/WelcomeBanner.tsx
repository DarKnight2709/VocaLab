import { useMemo } from "react";
import { Sparkles, Flame, CheckCircle2, Clock } from "lucide-react";
import { useTranslation } from "@/shared/hooks/useTranslation";
import { useMeQuery } from "@/features/auth/api/authService";
import { useStatsQuery } from "@/features/stats/api/statsService";

function getGreeting(t: (key: string) => string): string {
  const hour = new Date().getHours();
  if (hour < 12) return t("home.greeting.morning");
  if (hour < 18) return t("home.greeting.afternoon");
  return t("home.greeting.evening");
}

export default function WelcomeBanner() {
  const { t } = useTranslation();
  const { data: me } = useMeQuery();
  const { data: stats } = useStatsQuery(0);
  const greeting = useMemo(() => getGreeting(t), [t]);

  const firstName = me?.fullName?.split(" ").pop() || me?.username || "";
  const currentStreak = stats?.currentStreak ?? 0;
  const masteredCards = stats?.masteredCards ?? 0;
  const totalCards = stats?.totalCards ?? 0;
  const todayMinutes = stats?.todayMinutes ?? 0;
  const dailyGoal = stats?.dailyGoalMinutes ?? 10;

  return (
    <section className="relative rounded-3xl bg-card border border-border/80 p-6 sm:p-8 shadow-xs">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>VocaLab Daily Focus</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {greeting}, {firstName} 👋
        </h1>

        <p className="text-sm font-medium text-muted-foreground leading-relaxed">
          {t("home.subtitle")}
        </p>

        {/* Quick live progress chips */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/50 border border-border/60 text-foreground shadow-xs text-xs font-semibold">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>{currentStreak} {t("stats.dayStreak", { defaultValue: "Day Streak" })}</span>
          </div>

          {totalCards > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/50 border border-border/60 text-foreground shadow-xs text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>{masteredCards} / {totalCards} {t("stats.cardsMastered", { defaultValue: "Mastered" })}</span>
            </div>
          )}

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/50 border border-border/60 text-foreground shadow-xs text-xs font-semibold">
            <Clock className="w-4 h-4 text-primary" />
            <span>{todayMinutes}m / {dailyGoal}m {t("stats.goal", { defaultValue: "Goal" })}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
