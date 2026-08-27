import { useTranslation } from "react-i18next";
import type { BlogItem as BlogResult } from "@/shared/validations/BlogSchema";
import { Link } from "react-router";
import { MessageCircle, ArrowBigUp } from "lucide-react";
import ROUTES from "@/shared/lib/routes";
import { formatTimeAgo } from "@/shared/lib/utils";

export function BlogCard({ blog }: { blog: BlogResult }) {
  const { t } = useTranslation();
  const voteCount = blog.voteScore ?? 0;
  const commentCount = blog._count?.comments ?? 0;

  // Clean excerpt
  const rawExcerpt = blog.excerpt || blog.content || "";
  const cleanExcerpt = rawExcerpt
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  return (
    <Link
      to={ROUTES.BLOG_DETAIL.url.replace(":id", blog.id)}
      className="group flex items-center justify-between gap-4 rounded-3xl bg-card border border-border/80 p-4 sm:p-5 shadow-xs transition-all duration-300 hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5"
    >
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
        {/* Author header */}
        <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
          <div className="h-6 w-6 shrink-0 overflow-hidden rounded-xl bg-muted ring-1 ring-border/60">
            {blog.author.avatar ? (
              <img
                src={blog.author.avatar}
                alt={blog.author.fullName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] font-bold uppercase text-muted-foreground">
                {blog.author.fullName[0]}
              </div>
            )}
          </div>
          <span className="truncate font-bold text-foreground">
            {blog.author.fullName}
          </span>
          <span className="text-muted-foreground/60">•</span>
          <span className="shrink-0 font-medium">{formatTimeAgo(blog.createdAt, t)}</span>
        </div>

        {/* Title */}
        <h4 className="line-clamp-2 text-sm sm:text-base font-extrabold leading-snug text-foreground group-hover:text-primary transition-colors">
          {blog.title}
        </h4>

        {/* Excerpt */}
        {cleanExcerpt && (
          <p className="line-clamp-1 text-xs text-muted-foreground leading-relaxed">
            {cleanExcerpt}
          </p>
        )}

        {/* Metrics */}
        <div className="flex items-center gap-2 pt-1">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xl bg-muted/60 text-[11px] font-semibold text-muted-foreground">
            <ArrowBigUp size={13} className="text-emerald-500" />
            <span className="text-foreground">{voteCount}</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xl bg-muted/60 text-[11px] font-semibold text-muted-foreground">
            <MessageCircle size={12} />
            <span className="text-foreground">{commentCount}</span>
          </span>
        </div>
      </div>

      {blog.coverImage && (
        <div className="h-20 w-20 sm:h-24 sm:w-28 shrink-0 overflow-hidden rounded-2xl bg-muted/40 border border-border/50">
          <img
            src={blog.coverImage}
            alt=""
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
    </Link>
  );
}

