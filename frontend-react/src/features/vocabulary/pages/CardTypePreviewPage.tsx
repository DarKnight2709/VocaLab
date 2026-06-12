import { useNavigate, useParams } from "react-router";
import { Button } from "@/shared/components/ui/button";
import { toast } from "sonner";
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

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold truncate">{cardType.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {cardType.description}
          </p>
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
