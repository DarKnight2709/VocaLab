import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, getErrorMessage } from "@/shared/lib/api";
import API_ROUTES from "@/shared/lib/api-routes";
import { toast } from "sonner";
 
export const DuplicatePolicy = {
  SKIP: "SKIP",
  UPDATE: "UPDATE",
  DUPLICATE: "DUPLICATE",
} as const;
 
export type DuplicatePolicy = (typeof DuplicatePolicy)[keyof typeof DuplicatePolicy];

// =====================================================
// Domain: Card Collection (types)
// =====================================================

export interface VocabCollection {
  id: string;
  name: string;
  description: string | null;
  userId: string;
  createdAt: string;
  _count?: { cards: number };
}

// =====================================================
// Domain: Card Type (types)
// =====================================================

export type CardFieldType = "TEXT" | "TEXTAREA" | "IMAGE";
export type CardSide = "front" | "back";

export interface CardField {
  id: string;
  key: string;
  label: string;
  fieldType: CardFieldType;
  isRequired: boolean;
  order: number;
  side?: CardSide;
  position?: number;
  color?: string;
  fontSize?: number;
}

export interface CardType {
  id: string;
  name: string;
  description: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  fields: CardField[];
}

// =====================================================
// Domain: Card (types)
// =====================================================

export interface CardFieldValue {
  id: string;
  cardId: string;
  fieldId: string;
  value: string;
  field?: CardField;
}

export interface CardItem {
  id: string;
  cardTypeId: string;
  cardCollectionId: string;
  position: number | null;
  createdAt: string;
  updatedAt: string;
  cardType?: CardType;
  values?: CardFieldValue[];
}

export interface VocabCollectionDetail extends VocabCollection {
  cards: CardItem[];
}

// =====================================================
// Domain: Card Collection (hooks)
// =====================================================

export const useCollectionsQuery = () =>
  useQuery<{ collections: VocabCollection[] }>({
    queryKey: ["card-collections"],
    queryFn: async () => {
      const res = await api.get(API_ROUTES.VOCABULARY.COLLECTIONS);
      return res.data;
    },
  });

export const useCollectionDetailQuery = (id: string | null) =>
  useQuery<{ collection: VocabCollectionDetail }>({
    queryKey: ["card-collection-detail", id],
    queryFn: async () => {
      const res = await api.get(API_ROUTES.VOCABULARY.COLLECTION_DETAIL(id!));
      return res.data;
    },
    enabled: !!id,
  });

export const useCollectionCardsQuery = (id: string | null) =>
  useQuery<{ collection: VocabCollectionDetail }>({
    queryKey: ["card-collection-cards", id],
    queryFn: async () => {
      const res = await api.get(API_ROUTES.VOCABULARY.COLLECTION_CARDS(id!));
      return res.data;
    },
    enabled: !!id,
  });

export const useCreateCollectionMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; description?: string }) =>
      api.post(API_ROUTES.VOCABULARY.CREATE_COLLECTION, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["card-collections"] });
      toast.success("Tạo bộ từ vựng thành công");
    },
    onError: (e) => toast.error(getErrorMessage(e, "Tạo thất bại")),
  });
};

export const useUpdateCollectionMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: { name?: string; description?: string };
    }) => api.patch(API_ROUTES.VOCABULARY.UPDATE_COLLECTION(id), body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["card-collections"] });
      toast.success("Cập nhật thành công");
    },
    onError: (e) => toast.error(getErrorMessage(e, "Cập nhật thất bại")),
  });
};

export const useDeleteCollectionMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete(API_ROUTES.VOCABULARY.DELETE_COLLECTION(id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["card-collections"] });
      toast.success("Đã xóa bộ từ vựng");
    },
    onError: (e) => toast.error(getErrorMessage(e, "Xóa thất bại")),
  });
};

// =====================================================
// Domain: Card Type (hooks)
// =====================================================

export const useCardTypesQuery = () =>
  useQuery<{ cardTypes: CardType[] }>({
    queryKey: ["card-types"],
    queryFn: async () => {
      const res = await api.get(API_ROUTES.VOCABULARY.CARD_TYPES);
      const payload = res.data;

      if (Array.isArray(payload)) {
        return { cardTypes: payload as CardType[] };
      }

      return {
        cardTypes: (payload?.cardTypes ?? []) as CardType[],
      };
    },
  });

export const useCardTypeDetailsQuery = (id: string | null) =>
  useQuery<{ cardType: CardType }>({
    queryKey: ["card-type-details", id],
    queryFn: async () => {
      const res = await api.get(API_ROUTES.VOCABULARY.CARD_TYPE_DETAILS(id!));
      return res.data;
    },
    enabled: !!id,
  });

export const useCreateCardTypeMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      name: string;
      description?: string;
      fields: Array<{
        key: string;
        label: string;
        fieldType: string;
        side: string;
        order: number;
        color?: string;
        fontSize?: number;
        isRequired?: boolean;
      }>;
    }) => api.post(API_ROUTES.VOCABULARY.CREATE_CARD_TYPE, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["card-types"] });
      toast.success("Tạo kiểu thẻ thành công");
    },
    onError: (e) => toast.error(getErrorMessage(e, "Tạo kiểu thẻ thất bại")),
  });
};

export const useUpdateCardTypeMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: {
        name?: string;
        description?: string;
        fields?: Array<{
          key: string;
          label: string;
          fieldType: string;
          side: string;
          order: number;
          isRequired?: boolean;
        }>;
      };
    }) => api.patch(API_ROUTES.VOCABULARY.UPDATE_CARD_TYPE(id), body),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["card-types"] });
      qc.invalidateQueries({ queryKey: ["card-type-details", id] });
      // Thêm cái này để refresh toàn bộ Card đang dùng Type này
      qc.invalidateQueries({ queryKey: ["card-collections"] });
      qc.invalidateQueries({ queryKey: ["card-collection-cards"] });
      qc.invalidateQueries({ queryKey: ["card-collection-detail"] });
      toast.success("Cập nhật kiểu thẻ thành công");
    },
    onError: (e) =>
      toast.error(getErrorMessage(e, "Cập nhật kiểu thẻ thất bại")),
  });
};

export const useDeleteCardTypeMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete(API_ROUTES.VOCABULARY.DELETE_CARD_TYPE(id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["card-types"] });
      toast.success("Đã xóa kiểu thẻ");
    },
    onError: (e) => toast.error(getErrorMessage(e, "Xóa kiểu thẻ thất bại")),
  });
};

//=====================================================
// Domain: Card (hooks)
// =====================================================

export const useCreateCardMutation = (collectionId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      cardTypeId: string;
      cardCollectionId: string;
      values: Array<{ fieldId: string; value: string }>;
    }) =>
      api.post(API_ROUTES.VOCABULARY.CREATE_CARD(body.cardCollectionId), body),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["card-collection-cards", collectionId],
      });
      qc.invalidateQueries({
        queryKey: ["card-collection-detail", collectionId],
      });
      qc.invalidateQueries({ queryKey: ["card-collections"] });
      toast.success("Thêm từ thành công");
    },
    onError: (e) => toast.error(getErrorMessage(e, "Thêm từ thất bại")),
  });
};

export const useDeleteCardMutation = (collectionId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cardId: string) =>
      api.delete(API_ROUTES.VOCABULARY.DELETE_CARD(cardId)),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["card-collection-cards", collectionId],
      });
      qc.invalidateQueries({
        queryKey: ["card-collection-detail", collectionId],
      });
      qc.invalidateQueries({ queryKey: ["card-collections"] });
      toast.success("Đã xóa từ");
    },
    onError: (e) => toast.error(getErrorMessage(e, "Xóa từ thất bại")),
  });
};

export const useUpdateCardMutation = (collectionId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      cardId,
      body,
    }: {
      cardId: string;
      body: { values: Array<{ fieldId: string; value: string }> };
    }) => api.patch(API_ROUTES.VOCABULARY.UPDATE_CARD(cardId), body),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["card-collection-cards", collectionId],
      });
      qc.invalidateQueries({
        queryKey: ["card-collection-detail", collectionId],
      });
      qc.invalidateQueries({ queryKey: ["card-collections"] });
      toast.success("Cập nhật từ thành công");
    },
    onError: (e) => toast.error(getErrorMessage(e, "Cập nhật từ thất bại")),
  });
};

export interface ImportVocabularyPayload {
  rawText: string;
  delimiter: string;
  cardTypeId: string;
  collectionId: string;
  duplicatePolicy: DuplicatePolicy;
}

export const useImportVocabularyMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ImportVocabularyPayload) =>
      api.post(API_ROUTES.VOCABULARY.IMPORT_CARDS(body.collectionId), body),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["card-collections"] });
      if (variables.collectionId) {
        qc.invalidateQueries({
          queryKey: ["card-collection-cards", variables.collectionId],
        });
        qc.invalidateQueries({
          queryKey: ["card-collection-detail", variables.collectionId],
        });
      }
      toast.success("Nhập dữ liệu thành công");
    },
    onError: (e) => toast.error(getErrorMessage(e, "Nhập dữ liệu thất bại")),
  });
};
