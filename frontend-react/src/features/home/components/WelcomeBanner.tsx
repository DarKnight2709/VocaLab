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
    <section className="relative overflow-hidden rounded-2xl border bg-card p-6 sm:p-8">
      <div className="absolute inset-y-0 left-0 w-1 rounded-l-2xl bg-gradient-to-b from-emerald-500 to-teal-400" />
      <div className="pl-4">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {greeting}, {me?.fullName?.split(" ").pop() ?? ""} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("home.subtitle")}
        </p>
      </div>
    </section>
  );
}
