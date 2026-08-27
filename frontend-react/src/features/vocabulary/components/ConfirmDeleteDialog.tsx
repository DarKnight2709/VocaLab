import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "@/shared/hooks/useTranslation";

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
  title?: string;
  description?: string;
}

export default function ConfirmDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
  title,
  description,
}: ConfirmDeleteDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle className="text-lg font-bold">{title || t("vocabulary.confirmDeleteObj.title")}</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            {description || t("vocabulary.confirmDeleteObj.desc")}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-2 gap-2">
          <Button
            variant="outline"
            className="rounded-xl font-semibold"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {t("common.cancel")}
          </Button>
          <Button
            variant="destructive"
            className="rounded-xl font-semibold shadow-xs"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? t("vocabulary.confirmDeleteObj.deleting") : (title ? title : t("vocabulary.confirmDeleteObj.confirm"))}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
