import { Link } from "react-router";
import { ArrowRight, Layers, Plus, GitFork } from "lucide-react";
import { useCollectionsQuery } from "@/features/vocabulary/api/vocabularyService";
import ROUTES from "@/shared/lib/routes";
import { useTranslation } from "@/shared/hooks/useTranslation";
import HomeSkeletonBox from "./HomeSkeletonBox";

export default function HomeCollections() {
  const { t } = useTranslation();
  const { data: collectionsData, isLoading } = useCollectionsQuery(true);

  const collections = collectionsData?.collections?.slice(0, 4) ?? [];

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">
          {t("home.myCollections")}
        </h2>
        <Link
          to={ROUTES.VOCABULARY.url}
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {t("home.viewAll")}
          <ArrowRight size={12} />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <HomeSkeletonBox key={i} className="h-28" />
          ))}
        </div>
      ) : collections.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-card/50 py-10 text-center">
          <Layers size={32} className="mb-2 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            {t("home.noCollections")}
          </p>
          <Link
            to={ROUTES.VOCABULARY.url}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus size={14} />
            {t("home.createCollection")}
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {collections.map((col) => (
            <Link
              key={col.id}
              to={`/vocabulary/${col.id}`}
              className="group/col flex flex-col rounded-2xl bg-card p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex items-start gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/15 to-teal-500/10">
                  <Layers size={16} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold leading-tight">
                    {col.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {t("home.cards", { count: col._count?.cards ?? 0 })}
                  </p>
                </div>
              </div>
              {col.originId && col.origin && (
                <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
                  <GitFork size={10} />
                  <span className="truncate">{col.origin.name}</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
