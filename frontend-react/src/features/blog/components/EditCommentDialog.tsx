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
  getEditCommentSectionSchema,
  type BlogComment,
  type EditCommentSectionBodyType,
} from "@/shared/validations/BlogSchema";
import { useTranslation } from "@/shared/hooks/useTranslation";

export function EditCommentDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (commentId: string, content: string | undefined) => void | Promise<void>;
  comment: BlogComment;
}) {
  const { open, onOpenChange, onEdit, comment } = props;
  const { t } = useTranslation();

  const [saving, setSaving] = useState(false);

  const form = useForm<EditCommentSectionBodyType>({
    resolver: zodResolver(getEditCommentSectionSchema()),
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
          <DialogTitle>{t("blog.editComment")}</DialogTitle>
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
              {t("blog.cancel")}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? t("blog.saving") : t("blog.saveChanges")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
