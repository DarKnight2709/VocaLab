import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  getEditCommentSectionSchema as getReplyCommentSchema,
  type BlogComment,
  type EditCommentSectionBodyType as ReplyCommentFormValues,
} from "@/shared/validations/BlogSchema";
import { useTranslation } from "@/shared/hooks/useTranslation";

export function ReplyCommentDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReply: (commentId: string, content: string | undefined) => void | Promise<void>;
  comment: BlogComment;
}) {
  const { open, onOpenChange, onReply, comment } = props;
  const { t } = useTranslation();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReplyCommentFormValues>({
    resolver: zodResolver(getReplyCommentSchema()),
    defaultValues: {
      content: "",
    },
  });

  const formState = form.formState;

  useEffect(() => {
    if (!open) return;
    form.reset({
      content: "",
    });
  }, [open, form]);

  async function submitReply(id: string, content: string | undefined) {
    if (!onReply) return;
    setIsSubmitting(true);
    try {
      await onReply(id, content);
      onOpenChange(false);
    } catch (e) {
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleFormSubmit(values: ReplyCommentFormValues) {
    submitReply(comment.id, values.content);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("blog.replyComment")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleFormSubmit)}>
          <div className="space-y-2">
            <Input
              id="reply-comment-content"
              placeholder={t("blog.replyPlaceholder", { name: comment.author.fullName })}
              {...form.register("content")}
              autoComplete="content"
            />
            {formState.errors.content && (
              <p className="text-sm text-destructive">
                {formState.errors.content.message}
              </p>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("blog.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("blog.sending") : t("blog.sendReply")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
