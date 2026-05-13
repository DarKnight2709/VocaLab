import { useEffect, useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
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
import FieldSelectionDialog from "./FieldSelectionDialog.tsx";
import {
  useCreateCardTypeMutation,
  useUpdateCardTypeMutation,
} from "../api/vocabularyService";
import { useTranslation } from "@/shared/hooks/useTranslation";

interface CreateCardTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  initialData?: {
    id: string;
    name: string;
    description?: string | null;
    fields: Field[];
  } | null;
}

interface Field {
  id?: string;
  key: string;
  label: string;
  fieldType: "TEXT" | "TEXTAREA" | "IMAGE";
  side: "FRONT" | "BACK";
  order: number;
  isRequired?: boolean;
}

export default function CreateCardTypeDialog({
  open,
  onOpenChange,
  mode = "create",
  initialData = null,
}: CreateCardTypeDialogProps) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<Field[]>([]);
  const [fieldSelectionOpen, setFieldSelectionOpen] = useState(false);

  const createMutation = useCreateCardTypeMutation();
  const updateMutation = useUpdateCardTypeMutation();

  const isEditMode = mode === "edit" && !!initialData?.id;
  const isPending = useMemo(
    () => createMutation.isPending || updateMutation.isPending,
    [createMutation.isPending, updateMutation.isPending],
  );

  const resetForm = () => {
    setName("");
    setDescription("");
    setFields([]);
    setFieldSelectionOpen(false);
  };

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  };

  useEffect(() => {
    if (!open) return;

    if (isEditMode && initialData) {
      setName(initialData.name ?? "");
      setDescription(initialData.description ?? "");
      setFields(
        (initialData.fields ?? [])
          .map((field, index) => ({
            ...field,
            side: String(field.side).toUpperCase() as "FRONT" | "BACK",
            order: field.order ?? index,
          }))
          .sort((a, b) => a.order - b.order),
      );
      return;
    }

    resetForm();
  }, [open, isEditMode, initialData]);

  const handleRemoveField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!name.trim() || fields.length === 0) {
      return;
    }

    try {
      if (isEditMode && initialData?.id) {
        await updateMutation.mutateAsync({
          id: initialData.id,
          body: {
            name,
            description: description || undefined,
            fields,
          },
        });
      } else {
        await createMutation.mutateAsync({
          name,
          description: description || undefined,
          fields,
        });
      }

      resetForm();
      onOpenChange(false);
    } catch {
      // Error is handled by mutation
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? t("vocabulary.cardTypesObj.editTitle") : t("vocabulary.cardTypesObj.createTitle")}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t("vocabulary.cardTypesObj.nameLabel")}</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("vocabulary.cardTypesObj.namePlaceholder")}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>{t("vocabulary.cardTypesObj.descLabel")}</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("vocabulary.cardTypesObj.descPlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{t("vocabulary.cardTypesObj.selectCreateFields", { count: fields.length })}</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="gap-1"
                  onClick={() => setFieldSelectionOpen(true)}
                >
                  <Plus className="h-3 w-3" /> {t("vocabulary.cardTypesObj.selectFields")}
                </Button>
              </div>

              {fields.length > 0 && (
                <div className="space-y-2">
                  <Label>{t("vocabulary.cardTypesObj.selectedFields")}</Label>
                <div className="border rounded-lg p-3 space-y-2 bg-card">
                  {fields.map((field, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-2 p-2 rounded border bg-background"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">{field.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {t(`vocabulary.fieldsObj.types.${field.fieldType.toLowerCase()}`)} • {field.side === "FRONT" ? t("vocabulary.fieldsObj.front") : t("vocabulary.fieldsObj.back")}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleRemoveField(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleDialogOpenChange(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!name.trim() || fields.length === 0 || isPending}
            >
              {isEditMode ? t("vocabulary.cardTypesObj.save") : t("vocabulary.cardTypesObj.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <FieldSelectionDialog
        open={fieldSelectionOpen}
        onOpenChange={setFieldSelectionOpen}
        initialFields={fields}
        onSelectFields={(newFields: Field[]) => {
          setFields(newFields.map((field, index) => ({ ...field, order: index })));
        }}
      />
    </>
  );
}
