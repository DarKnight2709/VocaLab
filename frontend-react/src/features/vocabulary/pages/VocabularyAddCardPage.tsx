import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Plus } from "lucide-react";
import {
  useCardTypesQuery,
  useCreateCardMutation,
  useCollectionCardsQuery,
} from "../api/vocabularyService";
import Breadcrumb from "@/shared/components/Breadcrumb";
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
import { toast } from "sonner";

interface FieldConfig {
  value: string;
}

export default function VocabularyAddCardPage() {
  const navigate = useNavigate();
  const { collectionId } = useParams<{ collectionId: string }>();

  const { data: cardTypesData, isLoading: isTypesLoading } = useCardTypesQuery();
  const { data: colData, isLoading: isColLoading } = useCollectionCardsQuery(collectionId || null);
  const createCardMutation = useCreateCardMutation(collectionId || "");

  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [fieldConfigs, setFieldConfigs] = useState<Record<string, FieldConfig>>(
    {},
  );

  const cardTypes = cardTypesData?.cardTypes ?? [];

  const selectedType = useMemo(
    () => cardTypes.find((type) => type.id === selectedTypeId),
    [cardTypes, selectedTypeId],
  );

  useEffect(() => {
    if (!selectedTypeId && cardTypes.length > 0) {
      setSelectedTypeId(cardTypes[0].id);
    }
  }, [cardTypes, selectedTypeId]);

  useEffect(() => {
    if (!selectedType) {
      setFieldConfigs({});
      return;
    }

    const sortedFields = [...selectedType.fields].sort((a, b) => b.order - a.order);
    const initialConfig: Record<string, FieldConfig> = {};

    sortedFields.forEach((field) => {
      initialConfig[field.id] = {
        value: "",
      };
    });

    setFieldConfigs(initialConfig);
  }, [selectedType]);

  function updateFieldConfig(fieldId: string, patch: Partial<FieldConfig>) {
    setFieldConfigs((prev) => ({
      ...prev,
      [fieldId]: {
        ...prev[fieldId],
        ...patch,
      },
    }));
  }

  async function handleCreateCard(e: React.FormEvent) {
    e.preventDefault();
    if (!collectionId || !selectedType) return;

    const hasValue = selectedType.fields.some((field) => {
      const value = fieldConfigs[field.id]?.value?.trim() ?? "";
      return value.length > 0;
    });
    
    if (!hasValue) {
      toast.warning("Tất cả các trường đều rỗng. Vui lòng nhập ít nhất một trường.");
      return;
    }

    const missingRequired = selectedType.fields.filter(f => f.isRequired && !(fieldConfigs[f.id]?.value?.trim()));
    if (missingRequired.length > 0) {
      toast.warning(`Trường "${missingRequired[0].label}" là bắt buộc.`);
      return;
    }

    const values = selectedType.fields
      .map((field) => ({
        fieldId: field.id,
        value: fieldConfigs[field.id]?.value?.trim() ?? "",
      }))
      .filter((item) => item.value.length > 0);

    await createCardMutation.mutateAsync({
      cardTypeId: selectedType.id,
      cardCollectionId: collectionId,
      values,
    });

    navigate(`/vocabulary/${collectionId}`);
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto space-y-5">
        <Breadcrumb 
          items={[
            { label: "Từ vựng", href: "/vocabulary" },
            { label: isColLoading ? "Đang tải..." : colData?.collection.name || "Bộ sưu tập", href: `/vocabulary/${collectionId}` },
            { label: "Tạo card mới" }
          ]} 
        />

        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Tạo card mới</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Chọn card type, điền value cho các field và sắp xếp mặt trước/mặt
              sau.
            </p>
          </div>
        </div>

        <form onSubmit={handleCreateCard} className="space-y-5">
          <div className="rounded-2xl border bg-card p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Card type</Label>
                <Button
                  type="button"
                  variant="link"
                  className="h-auto p-0"
                  onClick={() => navigate("/vocabulary/card-types")}
                >
                  Quản lý
                </Button>
              </div>
              <Select
                value={selectedTypeId}
                onValueChange={setSelectedTypeId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={isTypesLoading ? "Đang tải..." : "Chọn type"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {cardTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Fields</Label>
                <Button
                  type="button"
                  variant="link"
                  className="h-auto p-0"
                  onClick={() => navigate(`/vocabulary/card-types/${selectedTypeId}`)}
                  disabled={!selectedTypeId}
                >
                  Quản lý
                </Button>
              </div>

              <div className="min-h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                {(selectedType?.fields ?? []).length === 0 ? (
                  <p className="text-muted-foreground">Chưa có field</p>
                ) : (
                  <ul className="space-y-1">
                    {(selectedType?.fields ?? []).map((field) => (
                      <li key={field.id} className="text-foreground">
                        {field.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Preview</Label>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/vocabulary/card-types/${selectedTypeId}`)}
                disabled={!selectedTypeId}
                className="w-full"
              >
                Mở preview card type
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-4 space-y-4">
            <h2 className="font-semibold">Điền dữ liệu field</h2>

            {(selectedType?.fields ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">
                Type này chưa có field.
              </p>
            )}

            {(selectedType?.fields ?? []).map((field) => (
              <div key={field.id} className="space-y-1.5">
                <Label>
                  {field.label}
                  {field.isRequired ? " *" : ""}
                </Label>
                <Input
                  value={fieldConfigs[field.id]?.value ?? ""}
                  onChange={(e) =>
                    updateFieldConfig(field.id, {
                      value: e.target.value,
                    })
                  }
                  placeholder={`Nhập ${field.label.toLowerCase()}`}
                  required={field.isRequired}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/vocabulary/${collectionId}`)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={
                createCardMutation.isPending || !collectionId || !selectedTypeId
              }
              className="gap-2"
            >
              <Plus className="h-4 w-4" /> Create
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
