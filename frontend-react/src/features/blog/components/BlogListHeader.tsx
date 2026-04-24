import { PenSquare, Search } from "lucide-react";
import { Link } from "react-router-dom";
import ROUTES from "@/shared/lib/routes";

interface BlogListHeaderProps {
  search: string;
  onSearch: (value: string) => void;
  isAuth: boolean;
}

export default function BlogListHeader({
  search,
  onSearch,
  isAuth,
}: BlogListHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold">Blog</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Chia sẻ kinh nghiệm và học từ cộng đồng
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 sm:w-64">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Tìm kiếm bài viết..."
            className="w-full rounded-xl border bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
          />
        </div>

        {/* Write button */}
        {isAuth && (
          <Link
            to={ROUTES.BLOG_CREATE.url}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <PenSquare size={15} />
            Viết bài
          </Link>
        )}
      </div>
    </div>
  );
}
