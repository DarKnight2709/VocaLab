import { useState } from "react";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { useBlogsQuery } from "@/features/blog/api/blogService";
import Breadcrumb from "@/shared/components/Breadcrumb";
import BlogCard, { BlogListItem, SkeletonCard, SkeletonListItem } from "../components/BlogCard";
import BlogListHeader from "../components/BlogListHeader";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { useTranslation } from "@/shared/hooks/useTranslation";

export default function BlogPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
    return (localStorage.getItem("vocalab_blog_view_mode") as "grid" | "list") || "grid";
  });

  const handleSetViewMode = (mode: "grid" | "list") => {
    setViewMode(mode);
    localStorage.setItem("vocalab_blog_view_mode", mode);
  };

  const isAuth = useAuthStore((state) => state.isAuth);

  const { data: blogData, isLoading } = useBlogsQuery(page, 12, debouncedSearch);

  const handleSearch = (val: string) => {
    setSearch(val);
    clearTimeout((handleSearch as any)._t);
    (handleSearch as any)._t = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 400);
  };

  const blogs = blogData?.data?.posts ?? [];

  return (
    <div className="h-full overflow-y-scroll p-6 md:p-8">
      <div className="w-full max-w-[1600px] mx-auto space-y-6">
        <Breadcrumb items={[{ label: t("common.blog") }]} />

        <BlogListHeader
          search={search}
          onSearch={handleSearch}
          isAuth={isAuth}
          viewMode={viewMode}
          onViewModeChange={handleSetViewMode}
        />

        {/* Content */}
        {isLoading ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto w-full flex flex-col gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonListItem key={i} />
              ))}
            </div>
          )
        ) : blogs.length === 0 ? (
          <div className="rounded-3xl bg-card border border-border/80 p-12 text-center flex flex-col items-center justify-center shadow-xs">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
              <FileText className="h-8 w-8" />
            </div>
            <p className="text-lg font-bold text-foreground">
              {debouncedSearch
                ? t("blog.noSearchResults").replace("{query}", debouncedSearch)
                : t("blog.noPosts")}
            </p>
            <p className="mt-1 text-sm text-muted-foreground max-w-md">
              {debouncedSearch ? t("blog.noSearchResultsHint") : t("blog.noPostsHint")}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto w-full flex flex-col gap-4">
            {blogs.map((blog) => (
              <BlogListItem key={blog.id} blog={blog} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {blogData && blogData.data.meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/80 bg-card text-foreground transition hover:bg-muted disabled:opacity-30 shadow-xs cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="px-4 py-2 rounded-2xl bg-card border border-border/80 text-xs font-bold text-foreground shadow-xs">
              {t("blog.page")} {page} / {blogData.data.meta.totalPages}
            </span>
            <button
              onClick={() =>
                setPage((p) => Math.min(blogData.data.meta.totalPages, p + 1))
              }
              disabled={page === blogData.data.meta.totalPages}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/80 bg-card text-foreground transition hover:bg-muted disabled:opacity-30 shadow-xs cursor-pointer"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
