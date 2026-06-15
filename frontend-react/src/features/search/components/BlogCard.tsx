import { useTranslation } from "react-i18next";
import type { BlogResult } from "../api/searchService";
import { Link } from "react-router";
import ROUTES from "@/shared/lib/routes";
import { formatTimeAgo } from "@/shared/lib/utils";

export function BlogCard({ blog }: { blog: BlogResult }) {
  const { t } = useTranslation();
  const voteCount = blog.voteScore ?? 0;
  const commentCount = blog._count?.comments ?? 0;

  return (
    <Link
      to={ROUTES.BLOG_DETAIL.url.replace(":id", blog.id)}
      className="flex items-center gap-4 rounded-xl bg-muted/40 p-3 transition-colors hover:bg-muted/60"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
          <div className="h-5 w-5 shrink-0 overflow-hidden rounded-full bg-muted ring-1 ring-border">
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
          <span className="truncate font-medium text-foreground">
            {blog.author.fullName}
          </span>
          <span aria-hidden>·</span>
          <span className="shrink-0">{formatTimeAgo(blog.createdAt, t)}</span>
        </div>

        <h4 className="line-clamp-2 text-base font-semibold leading-snug text-foreground">
          {blog.title}
        </h4>

        {blog.excerpt && (
          <p className="line-clamp-1 text-sm text-muted-foreground">
            {blog.excerpt}
          </p>
        )}

        <p className="text-xs text-muted-foreground">
          {t("search.votes", { count: voteCount })}
          <span aria-hidden> · </span>
          {t("search.commentsCount", { count: commentCount })}
        </p>
      </div>

      {blog.coverImage && (
        <img
          src={blog.coverImage}
          alt=""
          className="h-[72px] w-[72px] shrink-0 rounded-lg object-cover"
        />
      )}
    </Link>
  );
}