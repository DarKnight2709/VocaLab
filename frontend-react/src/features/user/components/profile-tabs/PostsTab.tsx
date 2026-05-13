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
import { useTranslation } from "@/shared/hooks/useTranslation";

interface PostsTabProps {
  userId: string;
  search: string;
  visibility?: PostVisibility;
}

function VoteDisplay({ post }: { post: any }) {
  return (
    <div className="flex items-center gap-0.5 text-[12px] font-semibold">
      <ArrowBigUp
        size={16}
        className={
          post.userVote === "UPVOTE"
            ? "fill-current text-green-500"
            : "text-muted-foreground/60"
        }
      />
      <span className="tabular-nums">{post.voteScore ?? 0}</span>
      <ArrowBigDown
        size={16}
        className={
          post.userVote === "DOWNVOTE"
            ? "fill-current text-red-500"
            : "text-muted-foreground/60"
        }
      />
    </div>
  );
}

function PostCard({ post }: { post: any }) {
  const { t } = useTranslation();
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
      className="group flex flex-col overflow-hidden rounded-4xl border border-white/10 bg-white/50 transition-all duration-300 hover:bg-white dark:bg-white/2 dark:hover:bg-white/5 backdrop-blur-xl shadow-sm hover:shadow-2xl hover:-translate-y-1.5 cursor-pointer"
    >
      <div className="relative h-48 shrink-0 overflow-hidden">
        {post.coverImage ? (
          <>
            <img
              src={post.coverImage}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-muted/50 to-muted/20 transition-colors group-hover:from-primary/10 group-hover:to-primary/5">
            <FileText className="h-12 w-12 text-muted-foreground/20 transition-transform duration-300 group-hover:scale-110" />
          </div>
        )}
        <div className="absolute top-4 left-4">
           {!post.isPublic && (
             <div className="rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
               {t("blog.private")}
             </div>
           )}
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-4 p-5">
        <div className="space-y-2">
          <h3 className="line-clamp-2 text-[15px] font-bold leading-snug group-hover:text-primary transition-colors duration-200">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="line-clamp-2 text-[12px] text-muted-foreground/80 leading-relaxed">
              {post.excerpt}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-white/10 pt-4">
          <div className="flex items-center gap-1.5 min-w-0">
            <p className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              <Calendar className="h-2.5 w-2.5" />
              {formatDate(post.createdAt.toISOString())}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-muted-foreground">
            <VoteDisplay post={post} />
            <div className="h-3 w-px bg-white/10" />
            <span className="flex items-center gap-1 text-[11px] font-semibold">
              <MessageCircle size={14} className="text-primary/70" />
              {post._count?.comments ?? 0}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function PostsTab({ userId, search, visibility = PostVisibility.ALL }: PostsTabProps) {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useUserPostsQuery(userId, page, 12, search, visibility);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex h-80 animate-pulse flex-col overflow-hidden rounded-4xl border border-white/10 bg-white/5">
            <div className="h-48 bg-muted" />
            <div className="flex flex-1 flex-col gap-4 p-5">
              <div className="h-5 w-3/4 rounded bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted" />
              <div className="mt-auto h-4 w-full rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const posts = data?.posts ?? [];

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="relative mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-muted/30">
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/5 group-hover:bg-primary/10" />
          <FileText className="h-12 w-12 text-muted-foreground/40" />
        </div>
        <h3 className="text-xl font-bold tracking-tight">
          {search ? t("profile.noResults").replace("{query}", search) : t("profile.noPosts")}
        </h3>
        <p className="mt-2 max-w-xs text-center text-sm text-muted-foreground leading-relaxed">
          {search ? t("profile.noResultsHint") : t("profile.noPostsHint")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
            <PostCard key={post.id} post={post} />
        ))}
      </div>

      {data!.meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border bg-card/50 backdrop-blur shadow-sm transition-all hover:bg-muted disabled:opacity-30 disabled:pointer-events-none active:scale-90"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="px-4 py-1.5 rounded-full bg-muted/30 border border-white/5 text-xs font-semibold tabular-nums">
            Page {page} <span className="mx-1 text-muted-foreground">/</span> {data!.meta.totalPages}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(data!.meta.totalPages, p + 1))}
            disabled={page === data!.meta.totalPages}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border bg-card/50 backdrop-blur shadow-sm transition-all hover:bg-muted disabled:opacity-30 disabled:pointer-events-none active:scale-90"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
