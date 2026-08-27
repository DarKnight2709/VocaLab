import { useState, useEffect, useRef } from "react";
import { GripVertical, Trash2, Save, Pencil, Layers, BookOpen } from "lucide-react";
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
  const dropTargetRef = useRef<{
    side: CardSide;
    insertBeforeId: string | null;
  } | null>(null);

  // Separate state just for visual highlight
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

  const handleZoneDragOver = (
    e: React.DragEvent,
    side: CardSide
  ) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
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
        className="h-3 flex items-center"
      >
        <div
          className={`w-full h-1 rounded-full transition-all duration-150 ${
            active ? "bg-primary shadow-xs scale-y-125" : "bg-transparent"
          }`}
        />
      </div>
    );
  };

  const FieldCard = ({ field }: { field: CardField }) => (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, field)}
      onDragEnd={handleDragEnd}
      className="flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-muted/40 hover:bg-muted/70 border border-border/70 shadow-2xs hover:shadow-xs hover:border-primary/40 cursor-grab active:cursor-grabbing transition-all duration-200 group"
    >
      <GripVertical className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span 
            className="font-bold text-sm truncate text-foreground"
            style={{ 
              color: field.color || 'inherit',
              fontSize: field.fontSize ? `${Math.max(field.fontSize * 0.7, 14)}px` : 'inherit'
            }}
          >
            {field.label}
          </span>
          {field.isRequired && (
            <span className="text-[10px] uppercase font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/30 px-1.5 py-0.5 rounded-md border border-rose-500/20">
              Required
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          onClick={() => setFieldDialogOpen(true)}
          title={t("vocabulary.edit")}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          onClick={() => handleRemoveField(field.id)}
          title={t("vocabulary.delete")}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const SideDropZone = ({
    side,
    fields: zoneFields,
  }: {
    side: CardSide;
    fields: CardField[];
  }) => {
    const isFront = side === "FRONT";
    return (
      <div
        onDragOver={(e) => handleZoneDragOver(e, side)}
        onDrop={(e) => handleDrop(e, side)}
        className="flex-1 p-5 sm:p-6 rounded-3xl bg-card border border-border/80 shadow-xs flex flex-col"
        style={{ minHeight: "320px" }}
      >
        {/* Zone Header */}
        <div className="flex items-center justify-between gap-3 pb-3 mb-2 border-b border-border/40">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border shrink-0 ${
              isFront 
                ? "bg-primary/10 text-primary border-primary/20" 
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
            }`}>
              {isFront ? <Layers className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
            </div>
            <h3 className="font-bold text-sm text-foreground">
              {isFront ? t("vocabulary.dragDrop.frontSide") : t("vocabulary.dragDrop.backSide")}
            </h3>
          </div>

          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
            isFront 
              ? "bg-primary/10 text-primary" 
              : "bg-amber-500/10 text-amber-700 dark:text-amber-300"
          }`}>
            {zoneFields.length} {t("vocabulary.fields", { defaultValue: "fields" })}
          </span>
        </div>

        {/* Zone Content */}
        <div className="flex-1 flex flex-col pt-1">
          {zoneFields.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-border/80 text-muted-foreground text-xs space-y-1">
              <span className="font-medium">{t("vocabulary.dragDrop.dragPlaceholder")}</span>
            </div>
          ) : (
            <div className="flex flex-col">
              <DropGap side={side} insertBeforeId={zoneFields[0].id} />
              {zoneFields.map((field, idx) => (
                <div key={field.id}>
                  <FieldCard field={field} />
                  <DropGap
                    side={side}
                    insertBeforeId={zoneFields[idx + 1]?.id ?? null}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {hasChanges && (
        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={isSaving} 
            className="gap-2 rounded-xl font-semibold shadow-xs"
          >
            <Save className="h-4 w-4" />
            {isSaving ? t("vocabulary.cardManagement.saving") : t("vocabulary.dragDrop.saveChanges")}
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <SideDropZone side="FRONT" fields={frontFields} />
        <SideDropZone side="BACK" fields={backFields} />
      </div>

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

