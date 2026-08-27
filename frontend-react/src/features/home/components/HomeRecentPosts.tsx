import { Link, useNavigate } from "react-router";
import { ArrowRight, PenSquare, Plus, BookOpen } from "lucide-react";
import { useBlogsQuery } from "@/features/blog/api/blogService";
import { AuthorAvatar, formatDate } from "@/features/blog/components/BlogCard";
import ROUTES from "@/shared/lib/routes";
import { useTranslation } from "@/shared/hooks/useTranslation";
import HomeSkeletonBox from "./HomeSkeletonBox";

export default function HomeRecentPosts() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: blogData, isLoading } = useBlogsQuery(1, 3);

  const blogs = blogData?.data?.posts?.slice(0, 3) ?? [];

  return (
    <section className="pb-8">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PenSquare className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
            {t("home.recentPosts")}
          </h2>
        </div>
        <Link
          to={ROUTES.BLOG.url}
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
        >
          {t("home.viewAll")}
          <ArrowRight size={12} className="opacity-80" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <HomeSkeletonBox key={i} className="h-24 rounded-3xl" />
          ))}
        </div>
      ) : blogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl bg-card border border-border/80 py-10 px-6 text-center shadow-xs">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary mb-3">
            <BookOpen size={28} />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            {t("home.noPosts")}
          </p>
          <Link
            to={ROUTES.BLOG_CREATE.url}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary/90 px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs transition-all"
          >
            <Plus size={15} />
            {t("home.writePost")}
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                className="group/blog flex flex-col justify-between rounded-3xl bg-card border border-border/80 p-5 transition-all duration-200 hover:shadow-md hover:border-primary/50 hover:-translate-y-0.5 cursor-pointer"
              >
                <div className="space-y-2.5">
                  {blog.coverImage && (
                    <div className="w-full h-36 rounded-2xl overflow-hidden mb-3">
                      <img
                        src={blog.coverImage}
                        alt=""
                        className="w-full h-full object-cover transition-transform duration-300 group-hover/blog:scale-105"
                      />
                    </div>
                  )}
                  <h3 className="line-clamp-2 text-sm font-bold leading-snug group-hover/blog:text-primary transition-colors">
                    {blog.title}
                  </h3>
                  {blog.excerpt && (
                    <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                      {blog.excerpt}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between pt-3 border-t border-border/40 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2 min-w-0">
                    <AuthorAvatar author={blog.author} size="sm" />
                    <span className="font-semibold truncate text-foreground/80">{blog.author.fullName}</span>
                  </div>
                  <span className="shrink-0 text-[11px] font-medium">{formatDate(blog.createdAt)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
