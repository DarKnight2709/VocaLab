import { useState } from "react";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { useBlogsQuery } from "@/features/blog/api/blogService";
import { useAppSelector } from "@/shared/stores/redux/hooks";
import Breadcrumb from "@/shared/components/Breadcrumb";
import BlogCard, { SkeletonCard } from "../components/BlogCard";
import BlogListHeader from "../components/BlogListHeader";

export default function BlogPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const isAuth = useAppSelector((s: any) => s.auth.isAuth);

  const { data: blogData, isLoading } = useBlogsQuery(page, 12, debouncedSearch);

  const handleSearch = (val: string) => {
    setSearch(val);
    clearTimeout((handleSearch as any)._t);
    (handleSearch as any)._t = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 400);
  };

  const blogs = blogData?.data?.blogs ?? [];

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <Breadcrumb items={[{ label: "Blog" }]} />

        <BlogListHeader
          search={search}
          onSearch={handleSearch}
          isAuth={isAuth}
        />

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted/60">
              <FileText className="h-9 w-9 text-muted-foreground/50" />
            </div>
            <p className="text-base font-medium">
              {debouncedSearch
                ? `Không tìm thấy kết quả cho "${debouncedSearch}"`
                : "Chưa có bài viết nào"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {debouncedSearch
                ? "Hãy thử từ khóa khác."
                : "Hãy là người đầu tiên chia sẻ!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {blogData && blogData.data.meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-9 w-9 items-center justify-center rounded-xl border bg-background transition hover:bg-muted disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-muted-foreground">
              Trang {page} / {blogData.data.meta.totalPages}
            </span>
            <button
              onClick={() =>
                setPage((p) => Math.min(blogData.data.meta.totalPages, p + 1))
              }
              disabled={page === blogData.data.meta.totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-xl border bg-background transition hover:bg-muted disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
