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
  const updateMutation = useUpdateCardMutation(collectionId);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open && card && card.cardType?.fields) {
      const initialValues: Record<string, string> = {};
      
      // Khởi tạo toàn bộ field từ CardType
      card.cardType.fields.forEach(field => {
        initialValues[field.id] = "";
      });

      // Ghi đè bằng giá trị thực tế nếu đã có
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa thẻ</DialogTitle>
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
                placeholder={`Nhập ${field.label.toLowerCase()}`}
              />
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Đang lưu..." : "Cập nhật"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
