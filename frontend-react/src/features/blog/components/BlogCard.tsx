import { ArrowBigDown, ArrowBigUp, FileText, MessageCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ROUTES from "@/shared/lib/routes";
import type { BlogItem } from "@/shared/validations/BlogSchema";

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ─── Author Avatar ────────────────────────────────────────────────────────────

export function AuthorAvatar({
  author,
  size = "sm",
}: {
  author: BlogItem["author"];
  size?: "sm" | "md";
}) {
  const profileUrl = ROUTES.PROFILE.url.replace(":username", author.username);
  const dim = size === "md" ? "h-8 w-8 text-xs" : "h-6 w-6 text-[10px]";

  return (
    <Link
      to={profileUrl}
      onClick={(e) => e.stopPropagation()}
      className={`${dim} overflow-hidden rounded-full bg-muted ring-1 ring-border transition-opacity hover:opacity-80 shrink-0`}
      aria-label={`Xem trang cá nhân của ${author.fullName}`}
    >
      {author.avatar ? (
        <img
          src={author.avatar}
          alt={author.fullName}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-bold uppercase text-muted-foreground">
          {author.fullName[0]}
        </div>
      )}
    </Link>
  );
}

// ─── Vote Display ─────────────────────────────────────────────────────────────

export function VoteDisplay({ blog }: { blog: BlogItem }) {
  return (
    <div className="flex items-center gap-0.5 text-[12px] font-medium">
      <ArrowBigUp
        size={16}
        className={
          blog.userVote === "UPVOTE"
            ? "fill-current text-green-500"
            : "text-muted-foreground"
        }
      />
      <span className="tabular-nums">{blog.voteScore ?? 0}</span>
      <ArrowBigDown
        size={16}
        className={
          blog.userVote === "DOWNVOTE"
            ? "fill-current text-red-500"
            : "text-muted-foreground"
        }
      />
    </div>
  );
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────

export function SkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border bg-card animate-pulse">
      <div className="h-44 bg-muted" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-2">
          <div className="h-4 w-3/4 rounded bg-muted" />
          <div className="h-3 w-full rounded bg-muted" />
          <div className="h-3 w-5/6 rounded bg-muted" />
        </div>
        <div className="flex items-center justify-between border-t pt-3">
          <div className="flex items-center gap-1.5">
            <div className="h-6 w-6 rounded-full bg-muted" />
            <div className="h-3 w-20 rounded bg-muted" />
          </div>
          <div className="h-3 w-12 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

// ─── Blog Card ────────────────────────────────────────────────────────────────

export default function BlogCard({ blog }: { blog: BlogItem }) {
  const navigate = useNavigate();
  const detailUrl = ROUTES.BLOG_DETAIL.url.replace(":id", blog.id);

  return (
    <div
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
      {/* Cover */}
      <div className="relative h-44 shrink-0 overflow-hidden">
        {blog.coverImage ? (
          <>
            <img
              src={blog.coverImage}
              alt={blog.title}
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

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between gap-3 p-4">
        <div className="space-y-1.5">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-primary transition-colors">
            {blog.title}
          </h3>
          {blog.excerpt && (
            <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
              {blog.excerpt}
            </p>
          )}
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between gap-2 border-t pt-3">
          <div className="flex items-center gap-1.5 min-w-0">
            <AuthorAvatar author={blog.author} />
            <div className="min-w-0">
              <p className="truncate text-[11px] font-medium">
                {blog.author.fullName}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {formatDate(blog.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 text-muted-foreground">
            <VoteDisplay blog={blog} />
            <span className="flex items-center gap-0.5 text-[11px]">
              <MessageCircle size={12} />
              {blog._count?.comments ?? 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
