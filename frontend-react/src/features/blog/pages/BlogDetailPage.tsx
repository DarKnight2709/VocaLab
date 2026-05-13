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

  const { data: blogData, isLoading } = useBlogDetailQuery(id);
  const blog = blogData?.data?.blog;

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
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <div className="space-y-4">
          <div className="h-8 w-2/3 animate-pulse rounded-xl bg-muted" />
          <div className="h-64 animate-pulse rounded-2xl bg-muted" />
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8 text-center text-muted-foreground">
        {t("blog.postNotFound")}
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
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <Breadcrumb
        items={[
          { label: t("common.blog"), href: ROUTES.BLOG.url },
          { label: blog.title },
        ]}
      />

      {/* Title */}
      <h1 className="mb-4 text-3xl font-bold leading-snug">{blog.title}</h1>

      {/* Meta */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <Link
            to={ROUTES.PROFILE.url.replace(
              ":username",
              blog.author.username,
            )}
            className="h-9 w-9 overflow-hidden rounded-full bg-muted transition-opacity hover:opacity-80"
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
            <p className="text-sm font-medium">{blog.author.fullName}</p>
            <p className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
              <span>{date}</span>
              {isEdited && (
                <span
                  className="italic"
                  title={`${t("blog.lastEdited")}: ${editDate}`}
                >
                  ({t("blog.edited")} {editDate})
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isOwner && (
            <>
              <Link
                to={ROUTES.BLOG_EDIT.url.replace(":id", id)}
                className="rounded-lg border px-3 py-1.5 text-xs hover:bg-muted"
              >
                {t("blog.edit")}
              </Link>
              <button
                onClick={handleDeleteBlog}
                className="rounded-lg border border-destructive/30 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10"
              >
                {t("blog.delete")}
              </button>
            </>
          )}
          <div className="flex items-center rounded-lg border bg-background">
            <button
              onClick={() => voteBlog.mutate(VoteType.UPVOTE)}
              className={`flex items-center p-1.5 transition-colors rounded-l-lg ${
                blog.userVote === VoteType.UPVOTE
                  ? "bg-green-50 text-green-600 dark:bg-green-950"
                  : "hover:bg-muted text-muted-foreground"
              }`}
            >
              <ArrowBigUp
                size={18}
                className={
                  blog.userVote === VoteType.UPVOTE ? "fill-current" : ""
                }
              />
            </button>
            <span className="min-w-6 text-center text-xs font-semibold">
              {blog.voteScore ?? 0}
            </span>
            <button
              onClick={() => voteBlog.mutate(VoteType.DOWNVOTE)}
              className={`flex items-center p-1.5 transition-colors rounded-r-lg ${
                blog.userVote === VoteType.DOWNVOTE
                  ? "bg-red-50 text-red-600 dark:bg-red-950"
                  : "hover:bg-muted text-muted-foreground"
              }`}
            >
              <ArrowBigDown
                size={18}
                className={
                  blog.userVote === VoteType.DOWNVOTE ? "fill-current" : ""
                }
              />
            </button>
          </div>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MessageCircle size={14} />
            {blog._count?.comments ?? 0}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="mb-10">
        <ReadOnlyEditor content={blog.content} />
      </div>

      {/* Comments */}
      <div className="border-t pt-8">
          <h2 className="mb-5 text-lg font-semibold">
          {t("blog.comments")} ({blog._count?.comments ?? 0})
        </h2>

        <div className="mb-6 flex gap-3">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmitComment();
              }
            }}
            placeholder={t("blog.writeComment")}
            rows={2}
            className="flex-1 resize-none rounded-xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            onClick={handleSubmitComment}
            disabled={!commentText.trim() || addComment.isPending}
            className="flex h-10 w-10 shrink-0 items-center justify-center self-end rounded-xl bg-primary text-primary-foreground disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>

        <div className="space-y-4">
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
            <p className="text-sm text-muted-foreground">
              {t("blog.noComments")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
