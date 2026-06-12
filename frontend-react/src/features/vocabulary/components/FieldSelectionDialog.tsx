import { useEffect, useState } from "react";
import { Pencil, Plus, X } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useTranslation } from "@/shared/hooks/useTranslation";

interface Field {
  id?: string;
  key: string;
  label: string;
  fieldType: "TEXT" | "TEXTAREA" | "IMAGE";
  side: "FRONT" | "BACK";
  order: number;
  fontSize?: number | null;
  color?: string | null;
  isRequired?: boolean;
}

interface FieldSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialFields: Field[];
  onSelectFields: (fields: Field[]) => void;
}

export default function FieldSelectionDialog({
  open,
  onOpenChange,
  initialFields,
  onSelectFields,
}: FieldSelectionDialogProps) {
  const { t } = useTranslation();

  const PREDEFINED_FIELDS: Field[] = [
    {
      key: "front",
      label: t("vocabulary.fieldsObj.front"),
      fieldType: "TEXT",
      side: "FRONT",
      order: 0,
    },
    {
      key: "back",
      label: t("vocabulary.fieldsObj.back"),
      fieldType: "TEXT",
      side: "BACK",
      order: 1,
    },
  ];

  const [defaultFields, setDefaultFields] = useState<Field[]>(PREDEFINED_FIELDS);
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set());
  const [customFieldName, setCustomFieldName] = useState("");
  const [customFieldType, setCustomFieldType] = useState<
    "TEXT" | "TEXTAREA" | "IMAGE"
  >("TEXT");
  const [customFieldSide, setCustomFieldSide] = useState<"FRONT" | "BACK">(
    "FRONT"
  );
  const [customFields, setCustomFields] = useState<Field[]>([]);
  const [customFieldColor, setCustomFieldColor] = useState("");
  const [customFieldFontSize, setCustomFieldFontSize] = useState<number>(16);
  const [editingField, setEditingField] = useState<{
    key: string;
    source: "default" | "custom";
  } | null>(null);

  const allFields = [...defaultFields, ...customFields];

  const createUniqueKey = (rawName: string, excludeKey?: string) => {
    const base = rawName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "") || "field";

    const used = new Set(
      allFields.filter((f) => f.key !== excludeKey).map((f) => f.key)
    );

    let key = base;
    let i = 1;
    while (used.has(key)) {
      key = `${base}_${i}`;
      i += 1;
    }

    return key;
  };

  const hydrateFromInitialFields = (fields: Field[]) => {
    const byKey = new Map(fields.map((field) => [field.key, field]));

    const nextDefaultFields = PREDEFINED_FIELDS.map((baseField) => {
      const existing = byKey.get(baseField.key);
      if (!existing) {
        return baseField;
      }

      return {
        ...baseField,
        id: existing.id, // Giữ ID nếu có
        label: existing.label,
        fieldType: existing.fieldType,
        side: existing.side,
        color: existing.color,
        fontSize: existing.fontSize,
      };
    });

    const nextCustomFields = fields
      .filter((field) => field.key !== "front" && field.key !== "back")
      .map((field, index) => ({ ...field, order: index }));

    setDefaultFields(nextDefaultFields);
    setCustomFields(nextCustomFields);
    setSelectedFields(new Set(fields.map((field) => field.key)));
    setCustomFieldName("");
    setCustomFieldType("TEXT");
    setCustomFieldSide("FRONT");
    setEditingField(null);
  };

  useEffect(() => {
    if (open) {
      hydrateFromInitialFields(initialFields);
    }
  }, [open, initialFields]);

  const toggleField = (key: string) => {
    const newSelected = new Set(selectedFields);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedFields(newSelected);
  };

  const handleAddCustomField = () => {
    if (!customFieldName.trim()) return;

    const nextKey = createUniqueKey(
      customFieldName,
      editingField?.source === "custom" ? editingField.key : undefined
    );

    const newField: Field = {
      key: nextKey,
      label: customFieldName,
      fieldType: customFieldType,
      side: customFieldSide,
      color: customFieldColor || undefined,
      fontSize: customFieldFontSize || 16,
      order: 0,
      isRequired: false,
    };

    if (editingField?.source === "default") {
      setDefaultFields(
        defaultFields.map((field) =>
          field.key === editingField.key
            ? {
                ...field,
                label: customFieldName,
                fieldType: customFieldType,
                side: customFieldSide,
                color: customFieldColor || undefined,
                fontSize: customFieldFontSize || 16,
              }
            : field
        )
      );
    } else if (editingField?.source === "custom") {
      setCustomFields(
        customFields.map((field) =>
          field.key === editingField.key 
            ? { 
                ...field, 
                ...newField,
                color: customFieldColor || undefined,
                fontSize: customFieldFontSize || 16,
              } 
            : field
        )
      );

      if (editingField.key !== newField.key) {
        const newSelected = new Set(selectedFields);
        if (newSelected.has(editingField.key)) {
          newSelected.delete(editingField.key);
          newSelected.add(newField.key);
        }
        setSelectedFields(newSelected);
      }
    } else {
      setCustomFields([...customFields, newField]);
      const newSelected = new Set(selectedFields);
      newSelected.add(newField.key);
      setSelectedFields(newSelected);
    }

    setEditingField(null);
    setCustomFieldName("");
    setCustomFieldType("TEXT");
    setCustomFieldSide("FRONT");
  };

  const handleRemoveCustomField = (index: number) => {
    const field = customFields[index];
    if (!field) return;

    setCustomFields(customFields.filter((_, i) => i !== index));

    const newSelected = new Set(selectedFields);
    newSelected.delete(field.key);
    setSelectedFields(newSelected);

    if (editingField?.source === "custom" && editingField.key === field.key) {
      setEditingField(null);
      setCustomFieldName("");
      setCustomFieldType("TEXT");
      setCustomFieldSide("FRONT");
    }
  };

  const handleEditField = (field: Field, source: "default" | "custom") => {
    setEditingField({ key: field.key, source });
    setCustomFieldName(field.label);
    setCustomFieldType(field.fieldType);
    setCustomFieldSide(field.side);
    setCustomFieldColor(field.color || "");
    setCustomFieldFontSize(field.fontSize || 16);
  };

  const handleConfirm = () => {
    const fieldsToAdd = allFields
      .filter((field) => selectedFields.has(field.key))
      .map((field, index) => ({ ...field, order: index }));

    onSelectFields(fieldsToAdd);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("vocabulary.fieldsObj.selectionTitle")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Predefined Fields */}
          <div className="space-y-3">
            <Label className="font-semibold">{t("vocabulary.fieldsObj.fieldsLabel")}</Label>
            <div className="space-y-2">
              {allFields.map((field) => {
                const customIndex = customFields.findIndex((f) => f.key === field.key);
                const isCustom = customIndex >= 0;

                return (
                <div
                  key={field.key}
                  className="flex items-center gap-3 p-2 rounded hover:bg-muted"
                >
                  <input
                    type="checkbox"
                    checked={selectedFields.has(field.key)}
                    onChange={() => toggleField(field.key)}
                    className="h-4 w-4 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{field.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {t(`vocabulary.fieldsObj.types.${field.fieldType.toLowerCase()}`)} • {field.side === "FRONT" ? t("vocabulary.fieldsObj.front") : t("vocabulary.fieldsObj.back")}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleEditField(field, isCustom ? "custom" : "default")}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>

                    {isCustom && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleRemoveCustomField(customIndex)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          </div>

          {/* Create Custom Field */}
          <div className="space-y-3 border-t pt-4">
            <Label className="font-semibold">{t("vocabulary.fieldsObj.createCustom")}</Label>
            <div className="space-y-3">
              <div>
                <Label htmlFor="field-name" className="text-xs">
                  {t("vocabulary.fieldsObj.fieldName")}
                </Label>
                <Input
                  id="field-name"
                  value={customFieldName}
                  onChange={(e) => setCustomFieldName(e.target.value)}
                  placeholder={t("vocabulary.fieldsObj.fieldNamePlaceholder")}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="field-type" className="text-xs">
                    {t("vocabulary.fieldsObj.fieldType")}
                  </Label>
                  <Select
                    value={customFieldType}
                    onValueChange={(value: any) => setCustomFieldType(value)}
                  >
                    <SelectTrigger id="field-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TEXT">{t("vocabulary.fieldsObj.types.text")}</SelectItem>
                      <SelectItem value="TEXTAREA">{t("vocabulary.fieldsObj.types.textarea")}</SelectItem>
                      <SelectItem value="IMAGE">{t("vocabulary.fieldsObj.types.image")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="field-side" className="text-xs">
                    {t("vocabulary.fieldsObj.side")}
                  </Label>
                  <Select
                    value={customFieldSide}
                    onValueChange={(value: any) => setCustomFieldSide(value)}
                  >
                    <SelectTrigger id="field-side">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FRONT">{t("vocabulary.fieldsObj.front")}</SelectItem>
                      <SelectItem value="BACK">{t("vocabulary.fieldsObj.back")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="field-font-size" className="text-xs">
                    {t("vocabulary.fieldsObj.fontSize")}
                  </Label>
                  <Input
                    id="field-font-size"
                    type="number"
                    min="12"
                    max="64"
                    value={customFieldFontSize}
                    onChange={(e) => setCustomFieldFontSize(Number(e.target.value))}
                  />
                </div>

                <div>
                  <Label className="text-xs mb-1.5 block">{t("vocabulary.fieldsObj.fontColor")}</Label>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {[
                      { name: "Default", value: "" },
                      { name: "Blue", value: "#3b82f6" },
                      { name: "Red", value: "#ef4444" },
                      { name: "Green", value: "#22c55e" },
                      { name: "Orange", value: "#f97316" },
                      { name: "Purple", value: "#a855f7" },
                      { name: "Gray", value: "#6b7280" },
                    ].map((color) => (
                      <button
                        key={color.name}
                        type="button"
                        className={`h-5 w-5 rounded-full border ${
                          customFieldColor === color.value
                            ? "ring-2 ring-primary ring-offset-1"
                            : ""
                        }`}
                        style={{ backgroundColor: color.value || "white" }}
                        onClick={() => setCustomFieldColor(color.value)}
                        title={color.name}
                      />
                    ))}
                  </div>
                  <Input
                    value={customFieldColor}
                    onChange={(e) => setCustomFieldColor(e.target.value)}
                    placeholder={t("vocabulary.fieldsObj.hexCode")}
                    className="h-7 text-[10px] px-2"
                  />
                </div>
              </div>


              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                onClick={handleAddCustomField}
                disabled={!customFieldName.trim()}
              >
                <Plus className="h-4 w-4" />
                {editingField ? t("vocabulary.fieldsObj.updateField") : t("vocabulary.fieldsObj.addField")}
              </Button>

              {editingField && (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setEditingField(null);
                    setCustomFieldName("");
                    setCustomFieldType("TEXT");
                    setCustomFieldSide("FRONT");
                  }}
                >
                  {t("vocabulary.fieldsObj.cancelEditing")}
                </Button>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedFields.size === 0}
          >
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
