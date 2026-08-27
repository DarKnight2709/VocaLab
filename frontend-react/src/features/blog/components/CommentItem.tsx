import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { BlogComment } from "@/shared/validations/BlogSchema";
import { VoteType } from "@/shared/enums/VoteType.enum";
import { Pencil, Trash2, ArrowBigUp, ArrowBigDown, Reply } from "lucide-react";
import { ReplyCommentDialog } from "./ReplyCommentDialog";
import { EditCommentDialog } from "./EditCommentDialog";
import ROUTES from "@/shared/lib/routes";
import { useTranslation } from "@/shared/hooks/useTranslation";


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
  const { t, language } = useTranslation();
  const navigate = useNavigate();

  const [editSectionOpen, setEditSectionOpen] = useState(false);
  const [replySectionOpen, setReplySectionOpen] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const isOwner = currentUserId === comment.author.id;
  const hasReplies = (comment.replies?.length ?? 0) > 0;
  const isUpvoted = comment.userVote === VoteType.UPVOTE;
  const isDownvoted = comment.userVote === VoteType.DOWNVOTE;

  const date = new Date(comment.createdAt).toLocaleDateString(language === "vi" ? "vi-VN" : "en-US", {

    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <>
      <div
        className="mt-4 flex gap-3"
        style={{ marginLeft: Math.min(level * 20, 80) }}
      >
        <Link
          to={ROUTES.PROFILE.url.replace(
            ":username",
            comment.author.username,
          )}
          className="mt-0.5 h-9 w-9 shrink-0 overflow-hidden rounded-2xl bg-muted ring-2 ring-background border border-border/60 transition-opacity hover:opacity-80 shadow-xs"
          aria-label={t("chat.viewProfile").replace("{name}", comment.author.fullName)}
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

        <div className="flex-1 rounded-2xl bg-muted/30 border border-border/60 px-4 py-3 shadow-xs">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-sm font-bold text-foreground">
                {comment.author.fullName}
              </span>
              <span className="ml-2 text-xs text-muted-foreground">{date}</span>
              {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                <span className="ml-2 text-xs text-muted-foreground italic">
                  ({t("blog.edited")})
                </span>
              )}
            </div>

            {!comment.deletedAt && isOwner && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setEditSectionOpen(true)}
                  className="p-1 rounded-lg text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
                  aria-label={t("blog.editComment")}
                >
                  <Pencil size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(comment.id)}
                  className="p-1 rounded-lg text-muted-foreground transition-colors hover:text-destructive hover:bg-destructive/10"
                  aria-label={t("blog.deleteComment")}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )}
          </div>

          {comment.deletedAt ? (
            <p className="mt-1 text-sm italic text-muted-foreground">
              {t("blog.commentDeleted")}
            </p>
          ) : (
            <p className="mt-1.5 text-sm text-foreground leading-relaxed">{comment.content}</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {!comment.deletedAt && (
              <>
                <div className="flex items-center rounded-xl border border-border/60 bg-muted/40 p-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (!currentUserId) {
                        navigate(ROUTES.LOGIN.url);
                        return;
                      }
                      onVote(comment.id, VoteType.UPVOTE);
                    }}
                    className={`flex items-center rounded-lg p-1 transition-colors ${
                      isUpvoted
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold"
                        : "hover:bg-muted text-muted-foreground"
                    }`}
                    aria-label={t("blog.upvote")}
                  >
                    <ArrowBigUp
                      size={15}
                      className={isUpvoted ? "fill-current" : ""}
                    />
                  </button>
                  <span className="min-w-5 px-1 text-center text-xs font-bold text-foreground">
                    {comment.voteScore ?? 0}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (!currentUserId) {
                        navigate(ROUTES.LOGIN.url);
                        return;
                      }
                      onVote(comment.id, VoteType.DOWNVOTE);
                    }}
                    className={`flex items-center rounded-lg p-1 transition-colors ${
                      isDownvoted
                        ? "bg-red-500/15 text-red-600 dark:text-red-400 font-bold"
                        : "hover:bg-muted text-muted-foreground"
                    }`}
                    aria-label={t("blog.downvote")}
                  >
                    <ArrowBigDown
                      size={15}
                      className={isDownvoted ? "fill-current" : ""}
                    />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!currentUserId) {
                      navigate(ROUTES.LOGIN.url);
                      return;
                    }
                    setReplySectionOpen(true);
                  }}
                  className="flex items-center gap-1 rounded-xl px-2.5 py-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground font-medium border border-transparent hover:border-border/60"
                  aria-label={t("blog.reply")}
                  title={t("blog.reply")}
                >
                  <Reply size={14} />
                  <span>{t("blog.reply")}</span>
                </button>
              </>
            )}

            {hasReplies && (
              <button
                type="button"
                onClick={() => setShowReplies((current) => !current)}
                className="font-semibold text-primary hover:underline"
              >
                {showReplies
                  ? t("blog.hideReplies")
                  : t("blog.viewReplies", { count: comment.replies.length })}
              </button>
            )}
          </div>

          {showReplies && hasReplies && (
            <div className="mt-3 border-l-2 border-primary/20 pl-3">
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
