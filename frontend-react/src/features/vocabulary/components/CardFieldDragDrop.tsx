import { useState, useEffect, useRef } from "react";
import { GripVertical, Trash2, Save, Pencil } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { toast } from "sonner";
import FieldSelectionDialog from "./FieldSelectionDialog";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";
import { useTranslation } from "@/shared/hooks/useTranslation";
import { CardSide } from "@/shared/enums/CardSide.enum";
import { type CardField } from "@/shared/validations/VocabularySchema";


interface CardTypeWithFields {
  id: string;
  name: string;
  description?: string | null;
  fields?: CardField[];
}

interface CardFieldDragDropProps {
  cardType: CardTypeWithFields;
  onSave: (fields: any[]) => Promise<void>;
  isSaving?: boolean;
}

export default function CardFieldDragDrop({
  cardType,
  onSave,
  isSaving = false,
}: CardFieldDragDropProps) {
  const { t } = useTranslation();
  const [fields, setFields] = useState<CardField[]>(cardType.fields || []);
  const [hasChanges, setHasChanges] = useState(false);
  const [fieldDialogOpen, setFieldDialogOpen] = useState(false);
  const [removingFieldId, setRemovingFieldId] = useState<string | null>(null);
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);

  // Store drop target in a ref so it's always current at drop time
  // without causing re-renders on every dragover
  const dropTargetRef = useRef<{
    side: CardSide;
    insertBeforeId: string | null;
  } | null>(null);

  // Separate state just for visual highlight — updated less aggressively
  const [highlightedGap, setHighlightedGap] = useState<{
    side: CardSide;
    insertBeforeId: string | null;
  } | null>(null);

  const draggedFieldIdRef = useRef<string | null>(null);

  const normalizeSide = (side?: CardSide | string): CardSide => {
    if (side === CardSide.BACK || side === "back") return CardSide.BACK;
    return CardSide.FRONT;
  };

  useEffect(() => {
    setFields(cardType.fields || []);
    setHasChanges(false);
  }, [cardType]);

  const frontFields = fields
    .filter((f) => normalizeSide(f.side) === "FRONT")
    .sort((a, b) => a.order - b.order);

  const backFields = fields
    .filter((f) => normalizeSide(f.side) === "BACK")
    .sort((a, b) => a.order - b.order);

  const handleDragStart = (e: React.DragEvent, field: CardField) => {
    draggedFieldIdRef.current = field.id;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", field.id);
  };

  const handleDragEnd = () => {
    draggedFieldIdRef.current = null;
    dropTargetRef.current = null;
    setHighlightedGap(null);
  };

  // Each gap calls this on dragover — most reliable way to track position
  const handleGapDragOver = (
    e: React.DragEvent,
    side: CardSide,
    insertBeforeId: string | null
  ) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";

    const current = dropTargetRef.current;
    if (
      current?.side !== side ||
      current?.insertBeforeId !== insertBeforeId
    ) {
      dropTargetRef.current = { side, insertBeforeId };
      setHighlightedGap({ side, insertBeforeId });
    }
  };

  // Zone dragover — only fires when NOT over a gap child (since gaps stopPropagation)
  // Used as fallback to set append-to-end
  const handleZoneDragOver = (
    e: React.DragEvent,
    side: CardSide
  ) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    // Don't override if a gap already claimed this event via stopPropagation
    // This fires only when hovering the zone background itself
    if (dropTargetRef.current?.side !== side) {
      dropTargetRef.current = { side, insertBeforeId: null };
      setHighlightedGap({ side, insertBeforeId: null });
    }
  };

  const handleDrop = (e: React.DragEvent, side: CardSide) => {
    e.preventDefault();

    const draggedId =
      draggedFieldIdRef.current || e.dataTransfer.getData("text/plain");
    if (!draggedId) return;

    const target = dropTargetRef.current;
    const insertBeforeId =
      target?.side === side ? target.insertBeforeId : null;

    setFields((prevFields) => {
      const draggedField = prevFields.find((f) => f.id === draggedId);
      if (!draggedField) return prevFields;

      const withoutDragged = prevFields.filter((f) => f.id !== draggedId);

      const targetSideFields = withoutDragged
        .filter((f) => normalizeSide(f.side) === side)
        .sort((a, b) => a.order - b.order);

      const otherSideFields = withoutDragged.filter(
        (f) => normalizeSide(f.side) !== side
      );

      let insertIndex =
        insertBeforeId === null
          ? targetSideFields.length
          : targetSideFields.findIndex((f) => f.id === insertBeforeId);

      if (insertIndex === -1) insertIndex = targetSideFields.length;

      const newSideFields = [
        ...targetSideFields.slice(0, insertIndex),
        { ...draggedField, side },
        ...targetSideFields.slice(insertIndex),
      ].map((f, idx) => ({ ...f, order: idx }));

      return [...otherSideFields, ...newSideFields];
    });

    draggedFieldIdRef.current = null;
    dropTargetRef.current = null;
    setHighlightedGap(null);
    setHasChanges(true);
  };

  const handleRemoveField = (fieldId: string) => {
    setRemovingFieldId(fieldId);
    setRemoveConfirmOpen(true);
  };

  const confirmRemoveField = () => {
    if (!removingFieldId) return;
    setFields((prev) => prev.filter((f) => f.id !== removingFieldId));
    setHasChanges(true);
    setRemoveConfirmOpen(false);
    setRemovingFieldId(null);
  };

  const handleUpdateFields = (newFields: any[]) => {
    setFields(newFields.map(f => ({
      ...f,
      id: f.id || `temp_${Math.random().toString(36).slice(2, 7)}`
    })));
    setHasChanges(true);
    setFieldDialogOpen(false);
  };

  const handleSave = async () => {
    try {
      // GIỮ LẠI ID để Backend biết trường nào cũ, trường nào mới
      // Chỉ những trường có id bắt đầu bằng 'temp_' mới là trường mới chưa có trong DB
      await onSave(fields);
      setHasChanges(false);
    } catch {
      toast.error(t("vocabulary.updateFailed"));
    }
  };

  const isGapActive = (side: CardSide, insertBeforeId: string | null) =>
    highlightedGap?.side === side &&
    highlightedGap?.insertBeforeId === insertBeforeId;

  const DropGap = ({
    side,
    insertBeforeId,
  }: {
    side: CardSide;
    insertBeforeId: string | null;
  }) => {
    const active = isGapActive(side, insertBeforeId);
    return (
      <div
        onDragOver={(e) => handleGapDragOver(e, side, insertBeforeId)}
        style={{ height: "14px", display: "flex", alignItems: "center" }}
      >
        <div
          style={{
            width: "100%",
            height: active ? "2px" : "1px",
            borderRadius: "9999px",
            background: active ? "hsl(var(--primary))" : "transparent",
            transition: "all 100ms",
          }}
        />
      </div>
    );
  };

  const FieldCard = ({ field }: { field: CardField }) => (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, field)}
      onDragEnd={handleDragEnd}
      className="flex items-center gap-3 p-3 rounded-lg bg-card shadow-sm hover:bg-muted/50 cursor-move transition-colors group"
    >
      <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <div 
          className="font-medium text-sm truncate"
          style={{ 
            color: field.color || 'inherit',
            fontSize: field.fontSize ? `${Math.max(field.fontSize * 0.7, 14)}px` : 'inherit'
          }}
        >
          {field.label}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={() => setFieldDialogOpen(true)}
        >
          <Pencil className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={() => handleRemoveField(field.id)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );

  const SideDropZone = ({
    side,
    fields,
  }: {
    side: CardSide;
    fields: CardField[];
  }) => (
    <div
      onDragOver={(e) => handleZoneDragOver(e, side)}
      onDrop={(e) => handleDrop(e, side)}
      className="flex-1 p-4 rounded-lg bg-card/50 shadow-sm flex flex-col"
      style={{ minHeight: "300px" }}
    >
      <div className="font-semibold text-sm mb-2">
        {side === "FRONT" ? t("vocabulary.dragDrop.frontSide") : t("vocabulary.dragDrop.backSide")}
      </div>

      <div className="flex-1 flex flex-col">
        {fields.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            {t("vocabulary.dragDrop.dragPlaceholder")}
          </div>
        ) : (
          <div className="flex flex-col">
            <DropGap side={side} insertBeforeId={fields[0].id} />
            {fields.map((field, idx) => (
              <div key={field.id}>
                <FieldCard field={field} />
                <DropGap
                  side={side}
                  insertBeforeId={fields[idx + 1]?.id ?? null}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <SideDropZone side="FRONT" fields={frontFields} />
        <SideDropZone side="BACK" fields={backFields} />
      </div>

      {hasChanges && (
        <div className="flex justify-end pt-2 border-t">
          <Button onClick={handleSave} disabled={isSaving} className="gap-2 shadow-lg">
            <Save className="h-4 w-4" />
            {isSaving ? t("vocabulary.cardManagement.saving") : t("vocabulary.dragDrop.saveChanges")}
          </Button>
        </div>
      )}

      <FieldSelectionDialog 
        open={fieldDialogOpen}
        onOpenChange={setFieldDialogOpen}
        onSelectFields={handleUpdateFields}
        initialFields={fields.map(f => ({
          ...f,
          side: normalizeSide(f.side)
        }))}
      />

      <ConfirmDeleteDialog
        open={removeConfirmOpen}
        onOpenChange={setRemoveConfirmOpen}
        onConfirm={confirmRemoveField}
        title={t("vocabulary.dragDrop.removeField")}
        description={t("vocabulary.dragDrop.removeFieldDesc")}
      />
    </div>
  );
}

