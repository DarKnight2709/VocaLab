import {
  ArrowBigDown,
  ArrowBigUp,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  MessageCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserPostsQuery } from "../../api/userService";
import { formatDate } from "@/features/blog/components/BlogCard";
import ROUTES from "@/shared/lib/routes";
import { useState } from "react";
import { PostVisibility } from "../../../../shared/enums/PostVisibility.enum";

interface PostsTabProps {
  userId: string;
  search: string;
  visibility?: PostVisibility;
}

function VoteDisplay({ post }: { post: any }) {
  return (
    <div className="flex items-center gap-0.5 text-[12px] font-medium">
      <ArrowBigUp
        size={15}
        className={
          post.userVote === "UPVOTE"
            ? "fill-current text-green-500"
            : "text-muted-foreground"
        }
      />
      <span className="tabular-nums">{post.voteScore ?? 0}</span>
      <ArrowBigDown
        size={15}
        className={
          post.userVote === "DOWNVOTE"
            ? "fill-current text-red-500"
            : "text-muted-foreground"
        }
      />
    </div>
  );
}

function PostCard({ post }: { post: any }) {
  const navigate = useNavigate();
  const detailUrl = ROUTES.BLOG_DETAIL.url.replace(":id", post.id);

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={() => navigate(detailUrl)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(detailUrl);
        }
      }}
      className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
    >
      <div className="relative h-44 shrink-0 overflow-hidden">
        {post.coverImage ? (
          <>
            <img
              src={post.coverImage}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted/50 to-muted/20">
            <FileText className="h-10 w-10 text-muted-foreground/25" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between gap-3 p-4">
        <div className="space-y-1.5">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
              {post.excerpt}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t pt-3">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="min-w-0">
              <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Calendar className="h-2.5 w-2.5" />
                {formatDate(post.createdAt.toISOString())}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 text-muted-foreground">
            <VoteDisplay post={post} />
            <span className="flex items-center gap-0.5 text-[11px]">
              <MessageCircle size={12} />
              {post._count?.comments ?? 0}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function PostsTab({ userId, search, visibility = PostVisibility.ALL }: PostsTabProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useUserPostsQuery(userId, page, 12, search, visibility);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex h-64 animate-pulse flex-col overflow-hidden rounded-2xl border bg-card">
            <div className="h-44 bg-muted" />
            <div className="flex flex-1 flex-col gap-2 p-4">
              <div className="h-4 w-3/4 rounded bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const posts = data?.posts ?? [];

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-muted/60">
          <FileText className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-semibold">
          {search ? `Không tìm thấy kết quả cho "${search}"` : "Chưa có bài viết nào"}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {search ? "Hãy thử từ khóa khác." : "Khi có bài viết mới, nội dung sẽ hiển thị ở đây."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
            <PostCard key={post.id} post={post} />
        ))}
      </div>

      {data!.meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex h-8 w-8 items-center justify-center rounded-lg border bg-background transition hover:bg-muted disabled:opacity-40"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-xs text-muted-foreground">
            Trang {page} / {data!.meta.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data!.meta.totalPages, p + 1))}
            disabled={page === data!.meta.totalPages}
            className="flex h-8 w-8 items-center justify-center rounded-lg border bg-background transition hover:bg-muted disabled:opacity-40"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
