import { LayoutGrid, List, PenSquare, Search } from "lucide-react";
import { Link } from "react-router-dom";
import ROUTES from "@/shared/lib/routes";
import { useTranslation } from "@/shared/hooks/useTranslation";

interface BlogListHeaderProps {
  search: string;
  onSearch: (value: string) => void;
  isAuth: boolean;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

export default function BlogListHeader({
  search,
  onSearch,
  isAuth,
  viewMode,
  onViewModeChange,
}: BlogListHeaderProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("blog.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("blog.description")}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 sm:w-72">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={t("blog.searchPlaceholder")}
            className="w-full h-11 rounded-2xl border border-border/80 bg-card py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 shadow-xs transition-all"
          />
        </div>

        {/* Write button */}
        {isAuth && (
          <Link
            to={ROUTES.BLOG_CREATE.url}
            className="flex shrink-0 items-center gap-2 rounded-2xl bg-primary px-5 h-11 text-sm font-bold text-primary-foreground shadow-xs hover:bg-primary/90 hover:shadow-md active:scale-98 transition-all"
          >
            <PenSquare size={16} />
            {t("blog.writePost")}
          </Link>
        )}

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-2xl border border-border/80 shrink-0 h-11 shadow-xs">
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            className={`p-2 rounded-xl transition-all ${
              viewMode === "grid"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Grid View"
            aria-label="Grid View"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            className={`p-2 rounded-xl transition-all ${
              viewMode === "list"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="List View"
            aria-label="List View"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
