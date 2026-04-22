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
  EditCommentSectionSchema,
  type BlogComment,
  type EditCommentSectionBodyType,
} from "@/shared/validations/BlogSchema";

export function EditCommentDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (commentId: string, content: string | undefined) => void | Promise<void>;
  comment: BlogComment;
}) {
  const { open, onOpenChange, onEdit, comment } = props;

  const [saving, setSaving] = useState(false);

  const form = useForm<EditCommentSectionBodyType>({
    resolver: zodResolver(EditCommentSectionSchema),
    defaultValues: {
      content: comment?.content || "",
    },
  });

  const formState = form.formState;

  useEffect(() => {
    if (!open) return;
    form.reset({
      content: comment.content || "",
    });
  }, [open, form]);

  async function onSubmit(id: string, content: string | undefined) {
    if (!onEdit) return;
    setSaving(true);
    try {
      await onEdit(id, content);
      onOpenChange(false);
    } catch (e) {
    } finally {
      setSaving(false);
    }
  }

  function handleFormSubmit(values: EditCommentSectionBodyType) {
    onSubmit(comment.id, values.content);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa bình luận</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleFormSubmit)}>
          <div className="flex items-center gap-4">
            
          </div>
          <div className="space-y-2">
            <Input
              id="comment-content"
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
            <Button type="submit" disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
