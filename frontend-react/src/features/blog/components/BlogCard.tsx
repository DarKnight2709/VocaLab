import { ArrowBigDown, ArrowBigUp, ArrowRight, BookOpen, FileText, MessageCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ROUTES from "@/shared/lib/routes";
import type { BlogItem } from "@/shared/validations/BlogSchema";
import { useTranslation } from "@/shared/hooks/useTranslation";

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getCleanExcerpt(excerpt?: string | null, content?: string | null): string {
  const source = excerpt && excerpt.trim() ? excerpt : content;
  if (!source) return "";
  
  // Strip HTML tags
  let text = source.replace(/<[^>]*>/g, " ");
  
  // Decode common HTML entities
  text = text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'");

  // Normalize multi-spaces & trim
  text = text.replace(/\s+/g, " ").trim();
  
  if (!text) return "";
  return text.length > 160 ? text.slice(0, 160) + "..." : text;
}

export function getReadingTime(content?: string, t?: (key: string, options?: any) => string): string {
  const words = content ? content.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length : 0;
  const mins = Math.max(1, Math.ceil(words / 200));
  if (t) return t("blog.readingTime", { count: mins });
  return `${mins} min read`;
}

// ─── Author Avatar ────────────────────────────────────────────────────────────

export function AuthorAvatar({
  author,
  size = "sm",
}: {
  author: BlogItem["author"];
  size?: "sm" | "md";
}) {
  const { t } = useTranslation();
  const profileUrl = ROUTES.PROFILE.url.replace(":username", author.username);
  const dim = size === "md" ? "h-9 w-9 text-xs" : "h-7 w-7 text-[11px]";

  return (
    <Link
      to={profileUrl}
      onClick={(e) => e.stopPropagation()}
      className={`${dim} overflow-hidden rounded-xl bg-muted ring-2 ring-background border border-border/60 transition-opacity hover:opacity-80 shrink-0 shadow-xs`}
      aria-label={t("blog.viewAuthorProfile", { name: author.fullName, defaultValue: `View profile of ${author.fullName}` })}
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
    <div className="flex items-center gap-0.5 text-xs font-semibold px-2.5 py-1 rounded-xl bg-muted/40 border border-border/50 text-muted-foreground shadow-xs">
      <ArrowBigUp
        size={15}
        className={
          blog.userVote === "UPVOTE"
            ? "fill-current text-emerald-500"
            : "text-muted-foreground"
        }
      />
      <span className="tabular-nums text-foreground">{blog.voteScore ?? 0}</span>
      <ArrowBigDown
        size={15}
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
    <div className="flex flex-col overflow-hidden rounded-3xl bg-card border border-border/80 shadow-xs animate-pulse">
      <div className="h-48 bg-muted" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="space-y-2">
          <div className="h-5 w-3/4 rounded-xl bg-muted" />
          <div className="h-3.5 w-full rounded-lg bg-muted" />
          <div className="h-3.5 w-5/6 rounded-lg bg-muted" />
        </div>
        <div className="flex items-center justify-between border-t border-border/60 pt-3.5 mt-2">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-xl bg-muted" />
            <div className="h-3 w-20 rounded bg-muted" />
          </div>
          <div className="h-5 w-14 rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonListItem() {
  return (
    <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-5 p-5 rounded-3xl bg-card border border-border/80 shadow-xs animate-pulse">
      <div className="flex flex-1 flex-col justify-between gap-3 min-w-0">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-xl bg-muted" />
          <div className="h-3 w-24 rounded bg-muted" />
          <div className="h-3 w-16 rounded bg-muted" />
        </div>
        <div className="space-y-2 py-1">
          <div className="h-5 w-3/4 rounded-xl bg-muted" />
          <div className="h-3.5 w-full rounded-lg bg-muted" />
        </div>
        <div className="flex items-center gap-3 pt-1">
          <div className="h-6 w-16 rounded-xl bg-muted" />
          <div className="h-6 w-14 rounded-xl bg-muted" />
        </div>
      </div>
      <div className="h-40 sm:h-32 w-full sm:w-48 md:w-52 shrink-0 rounded-2xl bg-muted" />
    </div>
  );
}

// ─── Blog List Item (Row layout) ──────────────────────────────────────────────

export function BlogListItem({ blog }: { blog: BlogItem }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const detailUrl = ROUTES.BLOG_DETAIL.url.replace(":id", blog.id);
  const excerpt = getCleanExcerpt(blog.excerpt, blog.content);
  const readingTime = getReadingTime(blog.content, t);

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
      className="group flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-5 p-5 sm:p-6 rounded-3xl bg-card border border-border/80 shadow-xs transition-all duration-300 hover:shadow-xl hover:border-primary/40 hover:-translate-y-0.5 cursor-pointer"
    >
      {/* Text Content */}
      <div className="flex flex-1 flex-col justify-between gap-3 min-w-0">
        {/* Author info & Read time */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
          <AuthorAvatar author={blog.author} size="sm" />
          <span className="font-bold text-foreground hover:underline">
            {blog.author.fullName}
          </span>
          <span>•</span>
          <span>{formatDate(blog.createdAt)}</span>
          <span>•</span>
          <span className="flex items-center gap-1 text-muted-foreground/80">
            <BookOpen size={12} />
            {readingTime}
          </span>
        </div>

        {/* Title and Excerpt */}
        <div className="space-y-1.5">
          <h3 className="text-base sm:text-lg font-extrabold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug tracking-tight">
            {blog.title}
          </h3>
          {excerpt && (
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {excerpt}
            </p>
          )}
        </div>

        {/* Bottom Actions & Metrics */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2.5">
            <VoteDisplay blog={blog} />
            <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-xl bg-muted/40 border border-border/50 text-muted-foreground shadow-xs">
              <MessageCircle size={13} />
              <span className="text-foreground">{blog._count?.comments ?? 0}</span>
            </span>
          </div>

          <span className="flex items-center gap-1 text-xs font-bold text-primary opacity-0 sm:opacity-100 group-hover:translate-x-1 transition-all">
            <span>{t("blog.readMore", "Read more")}</span>
            <ArrowRight size={14} />
          </span>
        </div>
      </div>

      {/* Thumbnail */}
      <div className="relative h-44 sm:h-32 w-full sm:w-48 md:w-52 shrink-0 overflow-hidden rounded-2xl bg-muted/40 border border-border/50 shadow-xs">
        {blog.coverImage ? (
          <>
            <img
              src={blog.coverImage}
              alt={blog.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/10 via-primary/5 to-muted/30">
            <FileText className="h-10 w-10 text-primary/30" />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Blog Card (Grid layout) ──────────────────────────────────────────────────

export default function BlogCard({ blog }: { blog: BlogItem }) {
  const navigate = useNavigate();
  const detailUrl = ROUTES.BLOG_DETAIL.url.replace(":id", blog.id);
  const excerpt = getCleanExcerpt(blog.excerpt, blog.content);

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
      className="group flex flex-col overflow-hidden rounded-3xl bg-card border border-border/80 shadow-xs transition-all duration-300 hover:shadow-xl hover:border-primary/40 hover:-translate-y-1 cursor-pointer"
    >
      {/* Cover */}
      <div className="relative h-48 shrink-0 overflow-hidden bg-muted/40">
        {blog.coverImage ? (
          <>
            <img
              src={blog.coverImage}
              alt={blog.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/10 via-primary/5 to-muted/30">
            <FileText className="h-12 w-12 text-primary/30" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between gap-4 p-5">
        <div className="space-y-2">
          <h3 className="line-clamp-2 text-base font-bold leading-snug group-hover:text-primary transition-colors text-foreground tracking-tight">
            {blog.title}
          </h3>
          {excerpt && (
            <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
              {excerpt}
            </p>
          )}
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-3.5 mt-auto">
          <div className="flex items-center gap-2 min-w-0">
            <AuthorAvatar author={blog.author} />
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-foreground">
                {blog.author.fullName}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {formatDate(blog.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <VoteDisplay blog={blog} />
            <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-xl bg-muted/40 border border-border/50 text-muted-foreground shadow-xs">
              <MessageCircle size={13} />
              <span className="text-foreground">{blog._count?.comments ?? 0}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
