import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Plus,
  Pencil,
  Trash2,
  LayoutTemplate,
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCardType, setEditingCardType] = useState<any | null>(null);

  const { data: cardTypesData } = useCardTypesQuery(true);
  const deleteCardTypeMutation = useDeleteCardTypeMutation();

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const cardTypes = [...(cardTypesData?.cardTypes || [])].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-6">
      <Breadcrumb items={[
        { label: t("vocabulary.title"), href: "/vocabulary" },
        { label: t("vocabulary.cardTypeManagement") }
      ]} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{t("vocabulary.cardTypeManagement")}</h1>

        <Button
          onClick={() => setDialogOpen(true)}
          className="gap-2 shrink-0"
        >
          <Plus className="h-4 w-4" /> {t("vocabulary.createCardType")}
        </Button>
      </div>

      {cardTypes.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-card shadow-sm text-muted-foreground">
          <p>{t("vocabulary.noCardTypes")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
              className="text-left w-full p-4 rounded-2xl bg-card shadow-sm hover:bg-muted/50 transition-colors cursor-pointer group relative"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold flex items-center gap-2 truncate">
                    <LayoutTemplate className="h-4 w-4 text-primary shrink-0" />
                    <span className="truncate">{cardType.name}</span>
                    <span className="font-normal text-sm text-muted-foreground shrink-0">
                      ({t("vocabulary.cardsCount", { count: cardType.fields?.length || 0 })})
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {cardType.description || (
                      <span className="italic opacity-70">
                        {t("common.noDescription")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
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
                    }}
                    title={t("vocabulary.edit")}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingId(cardType.id);
                      setDeleteConfirmOpen(true);
                    }}
                    disabled={deleteCardTypeMutation.isPending}
                    title={t("vocabulary.delete")}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
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
