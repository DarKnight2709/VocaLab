import { ChevronLeft, ChevronRight } from "lucide-react";
import { useUserGroupsQuery } from "../../api/userService";
import { useState } from "react";
import { useTranslation } from "@/shared/hooks/useTranslation";
import { GroupCard } from "@/features/search/components/GroupCard";
import type { SearchGroupResult as GroupResult } from "@/shared/validations/SearchSchema";

interface GroupsTabProps {
  userId: string;
  search: string;
}

export default function GroupsTab({ userId, search }: GroupsTabProps) {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useUserGroupsQuery(
    userId,
    page,
    12,
    search,
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const groups = data?.groups || [];
  const meta = data?.meta;

  if (groups.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-muted-foreground">{t("common.noData")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group: GroupResult) => (
          <GroupCard key={group.id} group={group} />
        ))}
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50 transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex h-9 min-w-9 items-center justify-center rounded-xl bg-primary text-[13px] font-medium text-primary-foreground shadow-sm">
            {page}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
            disabled={page === meta.totalPages}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50 transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
