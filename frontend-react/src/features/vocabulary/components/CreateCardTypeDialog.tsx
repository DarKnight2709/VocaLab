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
  label: string;
  side: "FRONT" | "BACK";
  order: number;
  fontSize?: number | null;
  color?: string | null;
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
        <DialogContent className="max-w-lg max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? t("vocabulary.cardTypesObj.editTitle") : t("vocabulary.cardTypesObj.createTitle")}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t("vocabulary.cardTypesObj.nameLabel")} *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("vocabulary.cardTypesObj.namePlaceholder")}
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label>{t("vocabulary.cardTypesObj.descLabel")}</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("vocabulary.cardTypesObj.descPlaceholder")}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <Label>{t("vocabulary.cardTypesObj.selectCreateFields", { count: fields.length })}</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="gap-1.5 rounded-xl font-semibold text-xs"
                  onClick={() => setFieldSelectionOpen(true)}
                >
                  <Plus className="h-3.5 w-3.5 text-primary" /> {t("vocabulary.cardTypesObj.selectFields")}
                </Button>
              </div>

              {fields.length > 0 && (
                <div className="space-y-2">
                  <div className="rounded-2xl p-3 space-y-2 bg-muted/40 border border-border/70">
                    {fields.map((field, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border/60 bg-card shadow-2xs"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm text-foreground truncate">{field.label}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                              field.side === "FRONT" 
                                ? "bg-primary/10 text-primary" 
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            }`}>
                              {field.side === "FRONT" ? t("vocabulary.fieldsObj.front") : t("vocabulary.fieldsObj.back")}
                            </span>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          onClick={() => handleRemoveField(index)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl font-semibold"
              onClick={() => handleDialogOpenChange(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              className="rounded-xl font-semibold shadow-xs"
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
