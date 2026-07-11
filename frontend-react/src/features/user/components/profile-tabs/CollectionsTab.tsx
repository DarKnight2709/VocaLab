import { ChevronLeft, ChevronRight } from "lucide-react";
import { useUserCollectionsQuery } from "../../api/userService";
import { useState } from "react";
import { useTranslation } from "@/shared/hooks/useTranslation";
import { CollectionCard } from "@/features/search/components/CollectionCard";
import type { SearchCollectionResult as CollectionResult } from "@/shared/validations/SearchSchema";
import type { PostVisibility } from "@/shared/enums/PostVisibility.enum";

interface CollectionsTabProps {
  userId: string;
  search: string;
  visibility?: PostVisibility;
}

export default function CollectionsTab({ userId, search, visibility }: CollectionsTabProps) {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useUserCollectionsQuery(
    userId,
    page,
    12,
    search,
    visibility,
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const collections = data?.collections || [];
  const meta = data?.meta;

  if (collections.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-muted-foreground">{t("common.noData")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection: CollectionResult) => (
          <CollectionCard key={collection.id} collection={collection} />
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
