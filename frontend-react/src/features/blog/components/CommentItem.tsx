import { useState } from "react";
import { Link } from "react-router-dom";
import type { BlogComment } from "@/shared/validations/BlogSchema";
import { VoteType } from "@/shared/enums/VoteType.enum";
import { Pencil, Trash2, ArrowBigUp, ArrowBigDown, Reply } from "lucide-react";
import { ReplyCommentDialog } from "./ReplyCommentDialog";
import { EditCommentDialog } from "./EditCommentDialog";
import ROUTES from "@/shared/lib/routes";

type CommentItemProps = {
  comment: BlogComment;
  currentUserId?: string;
  onEdit: (
    commentId: string,
    content: string | undefined,
  ) => void | Promise<void>;
  onReply: (
    commentId: string,
    reply: string | undefined,
  ) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  onVote: (commentId: string, type: VoteType) => void | Promise<void>;
  level?: number;
};

export function CommentItem({
  comment,
  currentUserId,
  onEdit,
  onReply,
  onDelete,
  onVote,
  level = 0,
}: CommentItemProps) {
  const [editSectionOpen, setEditSectionOpen] = useState(false);
  const [replySectionOpen, setReplySectionOpen] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const isOwner = currentUserId === comment.author.id;
  const hasReplies = (comment.replies?.length ?? 0) > 0;
  const isUpvoted = comment.userVote === VoteType.UPVOTE;
  const isDownvoted = comment.userVote === VoteType.DOWNVOTE;

  const date = new Date(comment.createdAt).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <>
      <div
        className="mt-4 flex gap-3"
        style={{ marginLeft: Math.min(level * 16, 80) }}
      >
        <Link
          to={ROUTES.PROFILE.url.replace(
            ":username",
            comment.author.username,
          )}
          className="mt-0.5 h-8 w-8 shrink-0 overflow-hidden rounded-full bg-muted transition-opacity hover:opacity-80"
          aria-label={`Xem trang cá nhân của ${comment.author.fullName}`}
        >
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
        </Link>

        <div className="flex-1 rounded-xl bg-muted/50 px-4 py-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-sm font-semibold">
                {comment.author.fullName}
              </span>
              <span className="ml-2 text-xs text-muted-foreground">{date}</span>
              {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                <span className="ml-2 text-xs text-muted-foreground italic">
                  (Đã chỉnh sửa)
                </span>
              )}
            </div>

            {!comment.deletedAt && isOwner && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditSectionOpen(true)}
                  className="text-muted-foreground transition-colors hover:text-green-500"
                  aria-label="Chỉnh sửa bình luận"
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(comment.id)}
                  className="text-muted-foreground transition-colors hover:text-destructive"
                  aria-label="Xóa bình luận"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>

          {comment.deletedAt ? (
            <p className="mt-1 text-sm italic text-gray-400">
              Bình luận này đã bị xóa
            </p>
          ) : (
            <p className="mt-1 text-sm">{comment.content}</p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {!comment.deletedAt && (
              <>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => onVote(comment.id, VoteType.UPVOTE)}
                    className={`flex items-center rounded-l-md p-1.5 transition-colors ${
                      isUpvoted
                        ? "bg-green-50 text-green-600 dark:bg-green-950"
                        : "hover:bg-muted text-muted-foreground"
                    }`}
                    aria-label="Upvote bình luận"
                  >
                    <ArrowBigUp
                      size={16}
                      className={isUpvoted ? "fill-current" : ""}
                    />
                  </button>
                  <span className="min-w-6 px-2 text-center text-xs font-semibold">
                    {comment.voteScore ?? 0}
                  </span>
                  <button
                    type="button"
                    onClick={() => onVote(comment.id, VoteType.DOWNVOTE)}
                    className={`flex items-center rounded-r-md p-1.5 transition-colors ${
                      isDownvoted
                        ? "bg-red-50 text-red-600 dark:bg-red-950"
                        : "hover:bg-muted text-muted-foreground"
                    }`}
                    aria-label="Downvote bình luận"
                  >
                    <ArrowBigDown
                      size={16}
                      className={isDownvoted ? "fill-current" : ""}
                    />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setReplySectionOpen(true)}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Phản hồi bình luận"
                  title="Phản hồi"
                >
                  <Reply size={16} />
                </button>
              </>
            )}

            {hasReplies && (
              <button
                type="button"
                onClick={() => setShowReplies((current) => !current)}
                className="hover:underline"
              >
                {showReplies
                  ? "Ẩn phản hồi"
                  : `Xem ${comment.replies.length} phản hồi`}
              </button>
            )}
          </div>

          {showReplies && hasReplies && (
            <div className="mt-2 border-l border-gray-200 pl-3">
              {comment.replies.map((child) => (
                <CommentItem
                  key={child.id}
                  comment={child}
                  currentUserId={currentUserId}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  onReply={onReply}
                  onVote={onVote}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <ReplyCommentDialog
        open={replySectionOpen}
        onOpenChange={setReplySectionOpen}
        onReply={onReply}
        comment={comment}
      />
      <EditCommentDialog
        open={editSectionOpen}
        onOpenChange={setEditSectionOpen}
        onEdit={onEdit}
        comment={comment}
      />
    </>
  );
}
