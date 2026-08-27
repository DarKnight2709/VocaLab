import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MessageCircle, Send, ArrowBigUp, ArrowBigDown } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import LinkExt from "@tiptap/extension-link";
import { CustomImage } from "../components/CustomImage";
import {
  useBlogDetailQuery,
  useVoteBlogMutation,
  useAddCommentMutation,
  useDeleteCommentMutation,
  useDeleteBlogMutation,
  useEditCommentMutation,
  useReplyCommentMutation,
  useVoteCommentMutation,
} from "@/features/blog/api/blogService";
import ROUTES from "@/shared/lib/routes";
import Breadcrumb from "@/shared/components/Breadcrumb";
import { CommentItem } from "../components/CommentItem";
import { VoteType } from "@/shared/enums/VoteType.enum";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { useOptionalAuth } from "@/features/auth/hooks/useOptionalAuth";
import { useTranslation } from "@/shared/hooks/useTranslation";


function ReadOnlyEditor({ content }: { content: string }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      CustomImage,
      LinkExt.configure({ openOnClick: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content,
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "max-w-none py-1 " +
          "[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:leading-tight [&_h1]:my-3 " +
          "[&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:leading-snug [&_h2]:my-3 " +
          "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 " +
          "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2 " +
          "[&_li]:my-1",
      },
    },
  });

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    if (editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <EditorContent
      editor={editor}
      className="prose prose-sm dark:prose-invert max-w-none"
    />
  );
}

export default function BlogDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const [commentText, setCommentText] = useState("");

  const currentUserId = useAuthStore((state) => state.userId ?? undefined);
  const { isAuth } = useOptionalAuth();

  const { data: blogData, isLoading } = useBlogDetailQuery(id);
  const blog = blogData?.data;

  const voteBlog = useVoteBlogMutation(id);
  const addComment = useAddCommentMutation(id);
  const deleteComment = useDeleteCommentMutation(id);
  const editComment = useEditCommentMutation(id);
  const replyComment = useReplyCommentMutation(id);
  const voteComment = useVoteCommentMutation(id);
  const deleteBlog = useDeleteBlogMutation();
  const dateLocale = language === "vi" ? "vi-VN" : "en-US";

  const handleSubmitComment = () => {
    const text = commentText.trim();
    if (!text) return;
    addComment.mutate(text, { onSuccess: () => setCommentText("") });
  };

  const handleDeleteBlog = () => {
    if (!confirm(t("blog.deleteConfirm"))) return;
    deleteBlog.mutate(id, { onSuccess: () => navigate(ROUTES.BLOG.url) });
  };

  if (isLoading) {
    return (
      <div className="h-full overflow-y-scroll p-6 md:p-8">
        <div className="w-full max-w-[1600px] mx-auto">
          <div className="space-y-4">
            <div className="h-8 w-2/3 animate-pulse rounded-xl bg-muted" />
            <div className="h-64 animate-pulse rounded-2xl bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="h-full overflow-y-scroll p-6 md:p-8">
        <div className="w-full max-w-[1600px] mx-auto text-center text-muted-foreground">
          {t("blog.postNotFound")}
        </div>
      </div>
    );
  }

  const date = new Date(blog.createdAt).toLocaleDateString(dateLocale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const isEdited =
    blog.updatedAt &&
    new Date(blog.updatedAt).getTime() - new Date(blog.createdAt).getTime() >
      1000;
  const editDate = blog.updatedAt
    ? new Date(blog.updatedAt).toLocaleDateString(dateLocale, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
  const isOwner = currentUserId === blog.author.id;

  return (
    <div className="h-full overflow-y-scroll p-6 md:p-8">
      <div className="w-full max-w-4xl mx-auto space-y-6 pb-16">
        <Breadcrumb
          items={[
            { label: t("common.blog"), href: ROUTES.BLOG.url },
            { label: blog.title },
          ]}
        />

        {/* Title */}
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
          {blog.title}
        </h1>

        {/* Meta and Author Action Bar */}
        <div className="rounded-3xl bg-card border border-border/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to={ROUTES.PROFILE.url.replace(":username", blog.author.username)}
              className="h-10 w-10 overflow-hidden rounded-2xl bg-muted transition-opacity hover:opacity-80 shrink-0 border border-border/60 shadow-xs"
              aria-label={`${t("common.viewProfile")} ${blog.author.fullName}`}
            >
              {blog.author.avatar ? (
                <img
                  src={blog.author.avatar}
                  alt={blog.author.fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-bold uppercase">
                  {blog.author.fullName[0]}
                </div>
              )}
            </Link>
            <div>
              <p className="text-sm font-bold text-foreground">{blog.author.fullName}</p>
              <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                <span>{date}</span>
                {isEdited && (
                  <span
                    className="italic text-muted-foreground/80"
                    title={`${t("blog.lastEdited")}: ${editDate}`}
                  >
                    • ({t("blog.edited")})
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isOwner && (
              <div className="flex items-center gap-2">
                <Link
                  to={ROUTES.BLOG_EDIT.url.replace(":id", id)}
                  className="rounded-xl border border-border/80 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-xs"
                >
                  {t("blog.edit")}
                </Link>
                <button
                  onClick={handleDeleteBlog}
                  className="rounded-xl border border-destructive/30 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                >
                  {t("blog.delete")}
                </button>
              </div>
            )}
            
            <div className="flex items-center rounded-2xl border border-border/80 bg-muted/30 p-0.5 shadow-xs">
              <button
                onClick={() => {
                  if (!isAuth) {
                    navigate(ROUTES.LOGIN.url);
                    return;
                  }
                  voteBlog.mutate(VoteType.UPVOTE);
                }}
                className={`flex items-center p-1.5 transition-colors rounded-xl ${
                  blog.userVote === VoteType.UPVOTE
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold"
                    : "hover:bg-muted text-muted-foreground"
                }`}
                title="Upvote"
              >
                <ArrowBigUp
                  size={18}
                  className={blog.userVote === VoteType.UPVOTE ? "fill-current" : ""}
                />
              </button>
              <span className="min-w-6 text-center text-xs font-bold text-foreground px-1">
                {blog.voteScore ?? 0}
              </span>
              <button
                onClick={() => {
                  if (!isAuth) {
                    navigate(ROUTES.LOGIN.url);
                    return;
                  }
                  voteBlog.mutate(VoteType.DOWNVOTE);
                }}
                className={`flex items-center p-1.5 transition-colors rounded-xl ${
                  blog.userVote === VoteType.DOWNVOTE
                    ? "bg-red-500/15 text-red-600 dark:text-red-400 font-bold"
                    : "hover:bg-muted text-muted-foreground"
                }`}
                title="Downvote"
              >
                <ArrowBigDown
                  size={18}
                  className={blog.userVote === VoteType.DOWNVOTE ? "fill-current" : ""}
                />
              </button>
            </div>

            <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground px-3 py-2 rounded-2xl bg-muted/30 border border-border/80 shadow-xs">
              <MessageCircle size={14} />
              <span className="text-foreground">{blog._count?.comments ?? 0}</span>
            </span>
          </div>
        </div>

        {/* Article Content */}
        <div className="rounded-3xl bg-card border border-border/80 p-6 sm:p-10 shadow-xs">
          <ReadOnlyEditor content={blog.content} />
        </div>

        {/* Comments Section */}
        <div className="rounded-3xl bg-card border border-border/80 p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            {t("blog.comments")} ({blog._count?.comments ?? 0})
          </h2>

          <div className="flex gap-2 rounded-2xl bg-muted/40 border border-border/60 p-2 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onFocus={() => {
                if (!isAuth) {
                  navigate(ROUTES.LOGIN.url);
                }
              }}
              onKeyDown={(e) => {
                if (!isAuth) {
                  navigate(ROUTES.LOGIN.url);
                  return;
                }
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitComment();
                }
              }}
              placeholder={t("blog.writeComment")}
              rows={2}
              className="flex-1 resize-none bg-transparent border-0 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <button
              onClick={() => {
                if (!isAuth) {
                  navigate(ROUTES.LOGIN.url);
                  return;
                }
                handleSubmitComment();
              }}
              disabled={(!isAuth ? false : !commentText.trim()) || addComment.isPending}
              className="flex h-10 w-10 shrink-0 items-center justify-center self-end rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 shadow-xs transition-all cursor-pointer"
              title={t("common.send", { defaultValue: "Send" })}
            >
              <Send size={16} />
            </button>
          </div>

          <div className="space-y-4 pt-2">
            {blog.comments?.map((c: any) => (
              <CommentItem
                key={c.id}
                comment={c}
                currentUserId={currentUserId}
                onDelete={(cid) => deleteComment.mutate(cid)}
                onEdit={(commentId: string, content: string | undefined) => {
                  void editComment.mutateAsync({ commentId, content });
                }}
                onReply={(commentId: string, reply: string | undefined) => {
                  void replyComment.mutateAsync({ commentId, reply });
                }}
                onVote={(commentId: string, type: VoteType) => {
                  voteComment.mutate({ commentId, type });
                }}
                level={0}
              />
            ))}
            {!blog.comments?.length && (
              <p className="text-sm font-medium text-muted-foreground text-center py-6">
                {t("blog.noComments")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
