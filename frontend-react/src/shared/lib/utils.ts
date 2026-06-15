import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { TFunction } from "i18next";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name?: string): string {
  if (!name) return "?";
  return (
    name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U"
  );
}


export function formatTimeAgo(dateStr: string, t: TFunction): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return t("search.timeAgo.justNow");
  if (minutes < 60) return t("search.timeAgo.minutes", { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("search.timeAgo.hours", { count: hours });
  const days = Math.floor(hours / 24);
  if (days < 30) return t("search.timeAgo.days", { count: days });
  const months = Math.floor(days / 30);
  if (months < 12) return t("search.timeAgo.months", { count: months });
  return t("search.timeAgo.years", { count: Math.floor(days / 365) });
}
