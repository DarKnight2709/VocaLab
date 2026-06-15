import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import type { CollectionResult } from "../api/searchService";
import { Layers } from "lucide-react";

export function CollectionCard({ collection }: { collection: CollectionResult }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div
      key={collection.id}
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/vocabulary/${collection.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(`/vocabulary/${collection.id}`);
        }
      }}
      className="text-left w-full p-4 rounded-2xl border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-semibold truncate">{collection.name}</div>
          <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {collection.description}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
        <Layers className="h-4 w-4" />
        <span>
          {collection._count?.cards ?? 0} {t("vocabulary.cards")}
        </span>
      </div>
    </div>
  );
}
