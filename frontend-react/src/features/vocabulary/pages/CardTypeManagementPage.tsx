import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Plus,
  Pencil,
  Trash2,
  LayoutTemplate,
  LayoutGrid,
  List,
} from "lucide-react";
import Breadcrumb from "@/shared/components/Breadcrumb";
import { Button } from "@/shared/components/ui/button";
import CreateCardTypeDialog from "../components/CreateCardTypeDialog.tsx";
import ConfirmDeleteDialog from "../components/ConfirmDeleteDialog";
import { useCardTypesQuery, useDeleteCardTypeMutation } from "../api/vocabularyService";
import { useTranslation } from "@/shared/hooks/useTranslation";

export default function CardTypeManagementPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
    return (localStorage.getItem("card_types_view_mode") as "grid" | "list") || "grid";
  });

  const handleSetViewMode = (mode: "grid" | "list") => {
    setViewMode(mode);
    localStorage.setItem("card_types_view_mode", mode);
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCardType, setEditingCardType] = useState<any | null>(null);

  const { data: cardTypesData } = useCardTypesQuery(true);
  const deleteCardTypeMutation = useDeleteCardTypeMutation();

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const cardTypes = [...(cardTypesData?.cardTypes || [])].sort((a, b) => a.name.localeCompare(b.name));

  const handleOpenEdit = (cardType: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingCardType({
      id: cardType.id,
      name: cardType.name,
      description: cardType.description,
      fields: [...(cardType.fields ?? [])]
        .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
        .map((field: any, index: number) => ({
          id: field.id,
          key: field.key,
          label: field.label,
          side: String(field.side).toUpperCase(),
          order: field.order ?? index,
          color: field.color,
          fontSize: field.fontSize,
          isRequired: field.isRequired,
        })),
    });
    setEditDialogOpen(true);
  };

  const handleOpenDelete = (cardTypeId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeletingId(cardTypeId);
    setDeleteConfirmOpen(true);
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[
        { label: t("vocabulary.title"), href: "/vocabulary" },
        { label: t("vocabulary.cardTypeManagement") }
      ]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("vocabulary.cardTypeManagement")}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t("vocabulary.manageCardTypesDesc", { defaultValue: "Customize note structures, fields, and styling for your flashcards" })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={() => setDialogOpen(true)}
            className="gap-2 font-semibold shadow-xs"
          >
            <Plus className="h-4 w-4" /> {t("vocabulary.createCardType")}
          </Button>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-xl border border-border/80 shrink-0">
            <button
              type="button"
              onClick={() => handleSetViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "grid"
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Grid View"
              aria-label="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleSetViewMode("list")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "list"
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="List View"
              aria-label="List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {cardTypes.length === 0 ? (
        <div className="text-center py-16 rounded-3xl bg-card shadow-xs text-muted-foreground border border-dashed border-border">
          <LayoutTemplate className="h-10 w-10 mx-auto mb-3 opacity-30 text-primary" />
          <p>{t("vocabulary.noCardTypes")}</p>
        </div>
      ) : viewMode === "list" ? (
        /* List / Row View */
        <div className="flex flex-col gap-3">
          {cardTypes.map((cardType) => (
            <div
              key={cardType.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/vocabulary/card-types/${cardType.id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(`/vocabulary/card-types/${cardType.id}`);
                }
              }}
              className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:px-6 rounded-2xl bg-card border border-border/80 shadow-xs hover:shadow-md hover:border-primary/50 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="p-2.5 rounded-xl shrink-0 bg-primary/10 text-primary border border-primary/20">
                  <LayoutTemplate className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                      {cardType.name}
                    </h3>
                    <span className="font-semibold text-xs px-2.5 py-0.5 rounded-full bg-muted/70 text-muted-foreground">
                      {t("vocabulary.cardsCount", { count: cardType.fields?.length || 0 })}
                    </span>
                  </div>
                  {cardType.description ? (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-xl">
                      {cardType.description}
                    </p>
                  ) : (
                    <span className="text-xs text-muted-foreground/60 italic mt-0.5 block">
                      {t("common.noDescription")}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 justify-between sm:justify-end" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                  onClick={(e) => handleOpenEdit(cardType, e)}
                  title={t("vocabulary.edit")}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  onClick={(e) => handleOpenDelete(cardType.id, e)}
                  disabled={deleteCardTypeMutation.isPending}
                  title={t("vocabulary.delete")}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5">
          {cardTypes.map((cardType) => (
            <div
              key={cardType.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/vocabulary/card-types/${cardType.id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(`/vocabulary/card-types/${cardType.id}`);
                }
              }}
              className="group relative text-left w-full p-5 rounded-3xl bg-card border border-border/80 shadow-xs hover:shadow-md hover:border-primary/50 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-base truncate flex items-center gap-2.5">
                    <div className="p-2 rounded-xl shrink-0 bg-primary/10 text-primary border border-primary/20">
                      <LayoutTemplate className="h-4.5 w-4.5" />
                    </div>
                    <span className="truncate group-hover:text-primary transition-colors">{cardType.name}</span>
                  </div>

                  <div className="mt-2.5">
                    <span className="font-semibold text-xs px-2.5 py-0.5 rounded-full bg-muted/70 text-muted-foreground">
                      {t("vocabulary.cardsCount", { count: cardType.fields?.length || 0 })}
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                    {cardType.description || (
                      <span className="italic opacity-60">
                        {t("common.noDescription")}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                    onClick={(e) => handleOpenEdit(cardType, e)}
                    title={t("vocabulary.edit")}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    onClick={(e) => handleOpenDelete(cardType.id, e)}
                    disabled={deleteCardTypeMutation.isPending}
                    title={t("vocabulary.delete")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateCardTypeDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <CreateCardTypeDialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) {
            setEditingCardType(null);
          }
        }}
        mode="edit"
        initialData={editingCardType}
      />

      <ConfirmDeleteDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={async () => {
          if (deletingId) {
            await deleteCardTypeMutation.mutateAsync(deletingId);
            setDeleteConfirmOpen(false);
            setDeletingId(null);
          }
        }}
        isLoading={deleteCardTypeMutation.isPending}
        title={t("vocabulary.deleteCardTypeTitle")}
        description={t("vocabulary.deleteCardTypeDesc")}
      />
    </div>
  );
}
