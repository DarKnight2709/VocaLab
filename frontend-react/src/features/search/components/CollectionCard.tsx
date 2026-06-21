import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import type { SearchCollectionResult as CollectionResult } from "@/shared/validations/SearchSchema";
import { Layers } from "lucide-react";
import { formatTimeAgo } from "@/shared/lib/utils";

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
        <div className="min-w-0 w-full flex flex-col gap-2">
          {collection.user && (
            <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
              <div className="h-5 w-5 shrink-0 overflow-hidden rounded-full bg-muted ring-1 ring-border">
                {collection.user.avatar ? (
                  <img
                    src={collection.user.avatar}
                    alt={collection.user.fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] font-bold uppercase text-muted-foreground">
                    {collection.user.fullName[0]}
                  </div>
                )}
              </div>
              <span className="truncate font-medium text-foreground">
                {collection.user.fullName}
              </span>
              <span aria-hidden>·</span>
              <span className="shrink-0">
                {formatTimeAgo(collection.createdAt, t)}
              </span>
            </div>
          )}
          <div>
            <div className="font-semibold truncate text-foreground">{collection.name}</div>
            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {collection.description}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
        <Layers className="h-4 w-4" />
        <span>
          {collection._count?.cards ?? 0} {t("vocabulary.cards")}
        </span>
      </div>
    </div>
  );
}
