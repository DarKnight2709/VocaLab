import { Link, useNavigate } from "react-router";
import { ArrowRight, PenSquare, Plus } from "lucide-react";
import { useBlogsQuery } from "@/features/blog/api/blogService";
import { AuthorAvatar, formatDate } from "@/features/blog/components/BlogCard";
import ROUTES from "@/shared/lib/routes";
import { useTranslation } from "@/shared/hooks/useTranslation";
import HomeSkeletonBox from "./HomeSkeletonBox";

export default function HomeRecentPosts() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: blogData, isLoading } = useBlogsQuery(1, 3);

  const blogs = blogData?.data?.blogs?.slice(0, 3) ?? [];

  return (
    <section className="pb-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">
          {t("home.recentPosts")}
        </h2>
        <Link
          to={ROUTES.BLOG.url}
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {t("home.viewAll")}
          <ArrowRight size={12} />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <HomeSkeletonBox key={i} className="h-20" />
          ))}
        </div>
      ) : blogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-card/50 py-10 text-center">
          <PenSquare size={32} className="mb-2 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            {t("home.noPosts")}
          </p>
          <Link
            to={ROUTES.BLOG_CREATE.url}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus size={14} />
            {t("home.writePost")}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {blogs.map((blog) => {
            const detailUrl = ROUTES.BLOG_DETAIL.url.replace(":id", blog.id);
            return (
              <div
                key={blog.id}
                role="link"
                tabIndex={0}
                onClick={() => navigate(detailUrl)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(detailUrl);
                  }
                }}
                className="group/blog flex items-start gap-4 rounded-2xl bg-card p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-1 text-sm font-semibold leading-tight group-hover/blog:text-primary transition-colors">
                  {blog.title}
                </h3>
                {blog.excerpt && (
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                    {blog.excerpt}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <AuthorAvatar author={blog.author} size="sm" />
                  <span className="font-medium">{blog.author.fullName}</span>
                  <span>·</span>
                  <span>{formatDate(blog.createdAt)}</span>
                </div>
              </div>
              {blog.coverImage && (
                <img
                  src={blog.coverImage}
                  alt=""
                  className="h-16 w-24 shrink-0 rounded-lg object-cover"
                />
              )}
            </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
