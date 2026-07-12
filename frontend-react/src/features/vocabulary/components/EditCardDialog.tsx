import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  useUpdateCardMutation,
  type CardItem,
} from "../api/vocabularyService";
import { useTranslation } from "@/shared/hooks/useTranslation";

interface EditCardDialogProps {
  card: CardItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collectionId: string;
}

export default function EditCardDialog({
  card,
  open,
  onOpenChange,
  collectionId,
}: EditCardDialogProps) {
  const { t } = useTranslation();
  const updateMutation = useUpdateCardMutation(collectionId);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open && card && card.cardType?.fields) {
      const initialValues: Record<string, string> = {};
      
      // Initialize all fields from the card type
      card.cardType.fields.forEach(field => {
        initialValues[field.id] = "";
      });

      // Override with stored values when available
      if (card.values) {
        card.values.forEach((v) => {
          initialValues[v.fieldId] = v.value;
        });
      }
      
      setFieldValues(initialValues);
    }
  }, [open, card?.id, card?.cardType?.fields]);

  const handleUpdate = async () => {
    if (!card) return;

    const values = Object.entries(fieldValues).map(([fieldId, value]) => ({
      fieldId,
      value,
    }));

    await updateMutation.mutateAsync({
      cardId: card.id,
      body: { values },
    });

    onOpenChange(false);
  };

  if (!card) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("vocabulary.cardManagement.editTitle")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {card.cardType?.fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label>{field.label}</Label>
              <Input
                value={fieldValues[field.id] || ""}
                onChange={(e) =>
                  setFieldValues((prev) => ({
                    ...prev,
                    [field.id]: e.target.value,
                  }))
                }
                placeholder={t("vocabulary.cardManagement.enterValue", { label: field.label.toLowerCase() })}
              />
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? t("vocabulary.cardManagement.saving") : t("vocabulary.cardManagement.update")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
