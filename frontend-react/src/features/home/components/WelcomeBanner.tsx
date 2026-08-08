import { useMemo } from "react";
import { useTranslation } from "@/shared/hooks/useTranslation";
import { useMeQuery } from "@/features/auth/api/authService";

function getGreeting(t: (key: string) => string): string {
  const hour = new Date().getHours();
  if (hour < 12) return t("home.greeting.morning");
  if (hour < 18) return t("home.greeting.afternoon");
  return t("home.greeting.evening");
}

export default function WelcomeBanner() {
  const { t } = useTranslation();
  const { data: me } = useMeQuery();
  const greeting = useMemo(() => getGreeting(t), [t]);

  return (
    <section className="relative overflow-hidden rounded-2xl bg-card border border-border/40 p-6 sm:p-8 shadow-sm">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="relative">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
          {greeting}, {me?.fullName?.split(" ").pop() ?? ""}
        </h1>
        <p className="mt-1.5 text-sm font-medium text-muted-foreground">
          {t("home.subtitle")}
        </p>
      </div>
    </section>
  );
}
