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
  EditCommentSectionSchema as ReplyCommentSchema,
  type BlogComment,
  type EditCommentSectionBodyType as ReplyCommentFormValues,
} from "@/shared/validations/BlogSchema";

export function ReplyCommentDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReply: (commentId: string, content: string | undefined) => void | Promise<void>;
  comment: BlogComment;
}) {
  const { open, onOpenChange, onReply, comment } = props;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReplyCommentFormValues>({
    resolver: zodResolver(ReplyCommentSchema),
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
          <DialogTitle>Trả lời bình luận</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleFormSubmit)}>
          <div className="space-y-2">
            <Input
              id="reply-comment-content"
              placeholder={`Phản hồi ${comment.author.fullName}...`}
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
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang gửi..." : "Gửi phản hồi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
