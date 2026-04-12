import { useState } from "react";
import { Link } from "react-router-dom";
import {
  PenSquare,
  Heart,
  MessageCircle,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useBlogsQuery, type BlogItem } from "@/features/blog/api/blogService";
import { useAppSelector } from "@/shared/stores/redux/hooks";
import ROUTES from "@/shared/lib/routes";
import Breadcrumb from "@/shared/components/Breadcrumb";

function BlogCard({ blog }: { blog: BlogItem }) {
  const date = new Date(blog.createdAt).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Link
      to={ROUTES.BLOG_DETAIL.url.replace(":id", blog.id)}
      className="group block rounded-2xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      {blog.coverImage && (
        <img
          src={blog.coverImage}
          alt={blog.title}
          className="mb-4 h-48 w-full rounded-xl object-cover"
        />
      )}
      <h2 className="line-clamp-2 text-lg font-semibold group-hover:text-primary">
        {blog.title}
      </h2>
      {blog.excerpt && (
        <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
          {blog.excerpt}
        </p>
      )}
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 overflow-hidden rounded-full bg-muted">
            {blog.author.avatar ? (
              <img
                src={blog.author.avatar}
                alt={blog.author.fullName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] font-bold uppercase">
                {blog.author.fullName[0]}
              </div>
            )}
          </div>
          <span>{blog.author.fullName}</span>
          <span>·</span>
          <span>{date}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Heart size={13} />
            {blog._count?.likes ?? 0}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle size={13} />
            {blog._count?.comments ?? 0}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function BlogPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const isAuth = useAppSelector((s: any) => s.auth.isAuth);

  const { data, isLoading } = useBlogsQuery(page, 12, debouncedSearch);

  const handleSearch = (val: string) => {
    setSearch(val);
    clearTimeout((handleSearch as any)._t);
    (handleSearch as any)._t = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 400);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <Breadcrumb items={[{ label: "Blog" }]} />
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Blog</h1>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Tìm kiếm bài viết..."
              className="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          {isAuth && (
            <Link
              to={ROUTES.BLOG_CREATE.url}
              className="flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <PenSquare size={15} />
              Viết bài
            </Link>
          )}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : data?.blogs.length === 0 ? (
        <div className="mt-20 text-center text-muted-foreground">
          {debouncedSearch
            ? `Không tìm thấy kết quả cho "${debouncedSearch}"`
            : "Chưa có bài viết nào."}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data?.blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.meta.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex h-9 w-9 items-center justify-center rounded-lg border bg-background disabled:opacity-40"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-muted-foreground">
            Trang {page} / {data.meta.totalPages}
          </span>
          <button
            onClick={() =>
              setPage((p) => Math.min(data.meta.totalPages, p + 1))
            }
            disabled={page === data.meta.totalPages}
            className="flex h-9 w-9 items-center justify-center rounded-lg border bg-background disabled:opacity-40"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
