import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Plus,
  Pencil,
  Eye,
  Trash2,
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

  const { data: cardTypesData } = useCardTypesQuery();
  const deleteCardTypeMutation = useDeleteCardTypeMutation();

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const cardTypes = cardTypesData?.cardTypes || [];

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto">
        <Breadcrumb items={[
          { label: t("vocabulary.title"), href: "/vocabulary" },
          { label: t("vocabulary.cardTypeManagement") }
        ]} />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">{t("vocabulary.cardTypeManagement")}</h1>

          <Button
            onClick={() => setDialogOpen(true)}
            className="gap-2 shrink-0"
          >
            <Plus className="h-4 w-4" /> {t("vocabulary.createCardType")}
          </Button>
        </div>

        {cardTypes.length === 0 ? (
          <div className="text-center py-16 border rounded-2xl bg-card text-muted-foreground">
            <p>{t("vocabulary.noCardTypes")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {cardTypes.map((cardType) => (
              <div
                key={cardType.id}
                className="p-4 rounded-2xl border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{cardType.name}</div>
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {cardType.description}
                    </div>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground mb-4">
                  {cardType.fields?.length || 0} trường
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-xs gap-1"
                    onClick={() =>
                      navigate(`/vocabulary/card-types/${cardType.id}`)
                    }
                  >
                    <Eye className="h-3.5 w-3.5" /> {t("vocabulary.view")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-xs gap-1"
                    onClick={() => {
                      setEditingCardType({
                        id: cardType.id,
                        name: cardType.name,
                        description: cardType.description,
                        fields: (cardType.fields ?? []).map((field: any, index: number) => ({
                          id: field.id, // RẤT QUAN TRỌNG: Phải giữ ID để Backend không xóa mất field
                          key: field.key,
                          label: field.label,
                          fieldType: field.fieldType,
                          side: String(field.side).toUpperCase(),
                          order: field.order ?? index,
                          color: field.color,
                          fontSize: field.fontSize,
                          isRequired: field.isRequired,
                        })),
                      });
                      setEditDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" /> {t("vocabulary.edit")}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      setDeletingId(cardType.id);
                      setDeleteConfirmOpen(true);
                    }}
                    disabled={deleteCardTypeMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
