import { useNavigate, useParams } from "react-router";
import { Button } from "@/shared/components/ui/button";
import { toast } from "sonner";
import { LayoutTemplate } from "lucide-react";
import CardFieldDragDrop from "../components/CardFieldDragDrop";
import { useCardTypeDetailsQuery, useUpdateCardTypeMutation } from "../api/vocabularyService";
import Breadcrumb from "@/shared/components/Breadcrumb";
import { useTranslation } from "@/shared/hooks/useTranslation";
import { type CardType } from "@/shared/validations/VocabularySchema";

export default function CardTypePreviewPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { cardTypeId } = useParams();

  const {
    data: cardTypeData,
    isLoading,
    isError,
  } = useCardTypeDetailsQuery(cardTypeId!);
  const updateMutation = useUpdateCardTypeMutation();

  const cardType = cardTypeData as CardType;

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">{t("vocabulary.loading")}</p>
      </div>
    );
  }

  if (isError || !cardType) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3">
        <p className="text-muted-foreground">{t("vocabulary.cardTypeLoadFailed")}</p>
        <Button variant="outline" onClick={() => navigate("/vocabulary/card-types")}>{t("vocabulary.back")}</Button>
      </div>
    );
  }

  const handleSaveChanges = async (updatedFields: any[]) => {
    try {
      await updateMutation.mutateAsync({
        id: cardType.id,
        body: {
          name: cardType.name,
          description: cardType.description || undefined,
          fields: updatedFields,
        },
      });
      toast.success(t("vocabulary.cardTypeUpdated") || "Card type updated successfully");
    } catch {
      toast.error(t("vocabulary.cardTypeUpdateFailed"));
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: t("vocabulary.title"), href: "/vocabulary" },
          {
            label: t("vocabulary.cardTypeManagement"),
            href: "/vocabulary/card-types",
          },
          { label: cardType.name },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 shrink-0 mt-0.5">
            <LayoutTemplate className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{cardType.name}</h1>
            {cardType.description && (
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                {cardType.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <CardFieldDragDrop
        cardType={cardType}
        onSave={handleSaveChanges}
        isSaving={updateMutation.isPending}
      />
    </div>
  );
}
