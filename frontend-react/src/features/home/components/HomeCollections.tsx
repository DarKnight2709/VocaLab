import { Link } from "react-router";
import { ArrowRight, Layers, Plus, GitFork, BookMarked } from "lucide-react";
import { useCollectionsQuery } from "@/features/vocabulary/api/vocabularyService";
import ROUTES from "@/shared/lib/routes";
import { useTranslation } from "@/shared/hooks/useTranslation";
import HomeSkeletonBox from "./HomeSkeletonBox";

export default function HomeCollections() {
  const { t } = useTranslation();
  const { data: collectionsData, isLoading } = useCollectionsQuery(true);

  const collections = collectionsData?.slice(0, 4) ?? [];

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookMarked className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
            {t("home.myCollections")}
          </h2>
        </div>
        <Link
          to={ROUTES.VOCABULARY.url}
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
        >
          {t("home.viewAll")}
          <ArrowRight size={12} className="opacity-80" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <HomeSkeletonBox key={i} className="h-32 rounded-3xl" />
          ))}
        </div>
      ) : collections.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl bg-card border border-border/80 py-10 px-6 text-center shadow-xs">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary mb-3">
            <Layers size={28} />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            {t("home.noCollections")}
          </p>
          <Link
            to={ROUTES.VOCABULARY.url}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary/90 px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs transition-all"
          >
            <Plus size={15} />
            {t("home.createCollection")}
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {collections.map((col) => (
            <Link
              key={col.id}
              to={`/vocabulary/${col.id}`}
              className="group/col relative flex flex-col justify-between rounded-3xl bg-card border border-border/80 p-5 transition-all duration-200 hover:shadow-md hover:border-primary/50 hover:-translate-y-0.5"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-xs">
                  <Layers size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-bold leading-tight group-hover/col:text-primary transition-colors">
                    {col.name}
                  </h3>
                  <div className="mt-1.5 inline-flex items-center px-2.5 py-0.5 rounded-full bg-muted/70 text-[11px] font-semibold text-muted-foreground">
                    {t("home.cards", { count: col._count?.cards ?? 0 })}
                  </div>
                </div>
              </div>

              {col.originId && col.origin && (
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground/80 pt-2 border-t border-border/40">
                  <GitFork size={11} className="text-primary/70" />
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
