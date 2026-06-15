import { Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { GroupResult } from "../api/searchService";

export function GroupCard({ group }: { group: GroupResult }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-3 rounded-xl bg-card p-4 transition-all hover:bg-accent/5">
      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-muted">
        {group.avatar ? (
          <img
            src={group.avatar}
            alt={group.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Users size={20} className="text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium truncate">{group.name}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {group._count && (
            <span>
              {group._count.members} {t("search.members")}
            </span>
          )}
          {group.description && (
            <span className="truncate">{group.description}</span>
          )}
        </div>
      </div>
    </div>
  );
}