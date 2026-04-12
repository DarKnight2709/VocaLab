import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Heart, MessageCircle, Trash2, Send } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import LinkExt from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import {
  useBlogDetailQuery,
  useToggleLikeMutation,
  useAddCommentMutation,
  useDeleteCommentMutation,
  useDeleteBlogMutation,
  type BlogComment,
} from "@/features/blog/api/blogService";
import { useAppSelector } from "@/shared/stores/redux/hooks";
import ROUTES from "@/shared/lib/routes";
import Breadcrumb from "@/shared/components/Breadcrumb";

function ReadOnlyEditor({ content }: { content: string }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image,
      LinkExt.configure({ openOnClick: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content,
    editable: false,
    immediatelyRender: false,
  });

  return (
    <EditorContent
      editor={editor}
      className="prose prose-sm dark:prose-invert max-w-none"
    />
  );
}

function CommentItem({
  comment,
  currentUserId,
  onDelete,
}: {
  comment: BlogComment;
  currentUserId?: string;
  onDelete: (id: string) => void;
}) {
  const date = new Date(comment.createdAt).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex gap-3">
      <div className="mt-0.5 h-8 w-8 shrink-0 overflow-hidden rounded-full bg-muted">
        {comment.author.avatar ? (
          <img
            src={comment.author.avatar}
            alt={comment.author.fullName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs font-bold uppercase">
            {comment.author.fullName[0]}
          </div>
        )}
      </div>
      <div className="flex-1 rounded-xl bg-muted/50 px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-sm font-semibold">
              {comment.author.fullName}
            </span>
            <span className="ml-2 text-xs text-muted-foreground">{date}</span>
          </div>
          {currentUserId === comment.author.id && (
            <button
              onClick={() => onDelete(comment.id)}
              className="text-muted-foreground transition-colors hover:text-destructive"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
        <p className="mt-1 text-sm">{comment.content}</p>
      </div>
    </div>
  );
}

export default function BlogDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState("");

  const currentUserId = useAppSelector((s) => s.auth.userId ?? undefined);
  const isAuth = useAppSelector((s) => s.auth.isAuth);

  const { data, isLoading } = useBlogDetailQuery(id);
  const blog = data?.blog;

  const toggleLike = useToggleLikeMutation(id);
  const addComment = useAddCommentMutation(id);
  const deleteComment = useDeleteCommentMutation(id);
  const deleteBlog = useDeleteBlogMutation();

  const handleSubmitComment = () => {
    const text = commentText.trim();
    if (!text) return;
    addComment.mutate(text, { onSuccess: () => setCommentText("") });
  };

  const handleDeleteBlog = () => {
    if (!confirm("Bạn có chắc muốn xóa bài viết này?")) return;
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
        Bài viết không tồn tại hoặc đã bị xóa.
      </div>
    );
  }

  const date = new Date(blog.createdAt).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const isOwner = currentUserId === blog.author.id;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <Breadcrumb 
        items={[
          { label: "Blog", href: ROUTES.BLOG.url },
          { label: blog.title }
        ]} 
      />

      {/* Cover */}
      {blog.coverImage && (
        <img
          src={blog.coverImage}
          alt={blog.title}
          className="mb-8 h-64 w-full rounded-2xl object-cover sm:h-80"
        />
      )}

      {/* Title */}
      <h1 className="mb-4 text-3xl font-bold leading-snug">{blog.title}</h1>

      {/* Meta */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 overflow-hidden rounded-full bg-muted">
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
          </div>
          <div>
            <p className="text-sm font-medium">{blog.author.fullName}</p>
            <p className="text-xs text-muted-foreground">{date}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isOwner && (
            <>
              <Link
                to={`${ROUTES.BLOG_CREATE.url}?edit=${id}`}
                className="rounded-lg border px-3 py-1.5 text-xs hover:bg-muted"
              >
                Chỉnh sửa
              </Link>
              <button
                onClick={handleDeleteBlog}
                className="rounded-lg border border-destructive/30 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10"
              >
                Xóa
              </button>
            </>
          )}
          <button
            onClick={() => isAuth && toggleLike.mutate()}
            disabled={!isAuth}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors ${
              blog.isLiked
                ? "border-pink-300 bg-pink-50 text-pink-600 dark:bg-pink-950"
                : "hover:bg-muted"
            }`}
          >
            <Heart size={14} className={blog.isLiked ? "fill-current" : ""} />
            {blog._count?.likes ?? 0}
          </button>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MessageCircle size={14} />
            {blog.comments?.length ?? blog._count?.comments ?? 0}
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
          Bình luận ({blog.comments?.length ?? 0})
        </h2>

        {isAuth && (
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
              placeholder="Viết bình luận..."
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
        )}

        <div className="space-y-4">
          {blog.comments?.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              currentUserId={currentUserId}
              onDelete={(cid) => deleteComment.mutate(cid)}
            />
          ))}
          {!blog.comments?.length && (
            <p className="text-sm text-muted-foreground">
              Chưa có bình luận nào. Hãy là người đầu tiên!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
