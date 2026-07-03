import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, fetchWithSchema, getErrorMessage } from "@/shared/lib/api";
import API_ROUTES from "@/shared/lib/api-routes";
import { toast } from "sonner";
import i18n from "@/shared/i18n";
import {
  CardTypeSchema,
  CardTypeListResponseSchema,
  type CardType,
  type CardField,
} from "@/shared/validations/VocabularySchema";
import type { UpdateCardType } from "@/shared/enums/UpdateCardType.enum";
import type { UpdateCard } from "@/shared/enums/UpdateCard.enum";

export const DuplicatePolicy = {
  SKIP: "SKIP",
  UPDATE: "UPDATE",
  DUPLICATE: "DUPLICATE",
} as const;

export type DuplicatePolicy =
  (typeof DuplicatePolicy)[keyof typeof DuplicatePolicy];

// =====================================================
// Domain: Card Collection (types)
// =====================================================

export interface VocabCollection {
  id: string;
  name: string;
  description: string | null;
  userId: string;
  isPublic: boolean;
  languages: string[];
  originId: string | null;
  origin?: {
    id: string;
    name: string;
    user: {
      username: string;
    };
  } | null;
  user: {
    id: string;
    username: string;
    fullName: string;
    avatar: string | null;
  };
  createdAt: string;
  _count?: { cards: number };
}

// =====================================================
// Domain: Card Type (types)
// =====================================================

// CardFieldType and CardSide are now imported from shared/enums
// CardField and CardType are now imported from shared/validations/VocabularySchema

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

export const useCollectionsQuery = (enabled: boolean) =>
  useQuery<{ collections: VocabCollection[] }>({
    queryKey: ["card-collections"],
    queryFn: async () => {
      const res = await api.get(API_ROUTES.VOCABULARY.COLLECTIONS);
      return res.data;
    },
    enabled,
  });

export const useCollectionDetailQuery = (id: string | null) =>
  useQuery({
    queryKey: ["card-collection-detail", id],
    queryFn: async () => {
      const res = await api.get(API_ROUTES.VOCABULARY.COLLECTION_DETAIL(id!));
      return res.data;
    },
    enabled: !!id,
  });

export const useCollectionDetailPublicQuery = (id: string | null) =>
  useQuery({
    queryKey: ["card-collection-detail-public", id],
    queryFn: async () => {
      const res = await api.get(
        API_ROUTES.VOCABULARY.COLLECTION_DETAIL_PUBLIC(id!),
      );
      return res.data;
    },
    enabled: !!id,
  });

export const useCreateCollectionMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      name: string;
      description?: string;
      isPublic?: boolean;
      languages?: string[];
    }) => api.post(API_ROUTES.VOCABULARY.CREATE_COLLECTION, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["card-collections"] });
      toast.success(i18n.t("vocabulary.createSuccess"));
    },
    onError: (e) =>
      toast.error(getErrorMessage(e, i18n.t("vocabulary.createFailed"))),
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
      body: { name?: string; description?: string; isPublic?: boolean; languages?: string[] };
    }) => api.patch(API_ROUTES.VOCABULARY.UPDATE_COLLECTION(id), body),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["card-collections"] });
      qc.invalidateQueries({
        queryKey: ["card-collection-detail", variables.id],
      });
      qc.invalidateQueries({
        queryKey: ["card-collection-cards", variables.id],
      });
      toast.success(i18n.t("vocabulary.updateSuccess"));
    },
    onError: (e) =>
      toast.error(getErrorMessage(e, i18n.t("vocabulary.updateFailed"))),
  });
};

export const useDeleteCollectionMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete(API_ROUTES.VOCABULARY.DELETE_COLLECTION(id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["card-collections"] });
      toast.success(i18n.t("vocabulary.deleteSuccess"));
    },
    onError: (e) =>
      toast.error(getErrorMessage(e, i18n.t("vocabulary.deleteFailed"))),
  });
};

export const useForkCollectionMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      originalCollectionId,
      name,
      description,
      isPublic,
      mergeCardType,
      updateCardType,
      updateCard,
    }: {
      originalCollectionId: string;
      name: string;
      description?: string;
      isPublic: boolean;
      mergeCardType: boolean;
      updateCardType: UpdateCardType;
      updateCard: UpdateCard;
    }) => {
      const response = await api.post(
        API_ROUTES.VOCABULARY.FORK_COLLECTION(originalCollectionId),
        {
          name,
          description,
          isPublic,
          mergeCardType,
          updateCardType,
          updateCard,
        },
      )
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["card-collections"] });
      toast.success(
        i18n.t("vocabulary.forkSuccess") || "Collection copied successfully!",
      );
    },
    onError: (e) =>
      toast.error(
        getErrorMessage(
          e,
          i18n.t("vocabulary.forkFailed") || "Failed to copy collection.",
        ),
      ),
  });
};

// =====================================================
// Domain: Card Type (hooks)
// =====================================================

export const useCardTypesQuery = (enabled: boolean) =>
  useQuery({
    queryKey: ["card-types"],
    queryFn: async () => {
      const result = await fetchWithSchema(
        api.get(API_ROUTES.VOCABULARY.CARD_TYPES),
        CardTypeListResponseSchema,
      );
      return result.data;
    },
    enabled,
  });

export const useCardTypeDetailsQuery = (id: string | null) =>
  useQuery({
    queryKey: ["card-type-details", id],
    queryFn: async () => {
      const result = await fetchWithSchema(
        api.get(API_ROUTES.VOCABULARY.CARD_TYPE_DETAILS(id!)),
        CardTypeSchema,
      );
      return result.data;
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
        label: string;
        fieldType: string;
        side: string;
        order: number;
        color?: string | null;
        fontSize?: number | null;
        isRequired?: boolean;
      }>;
    }) => api.post(API_ROUTES.VOCABULARY.CREATE_CARD_TYPE, body),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["card-types"] });
      toast.success(i18n.t("vocabulary.cardTypeCreateSuccess"));
    },
    onError: (e) =>
      toast.error(
        getErrorMessage(e, i18n.t("vocabulary.cardTypeCreateFailed")),
      ),
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
          id?: string;
          label: string;
          fieldType: string;
          side: string;
          order: number;
          color?: string | null;
          fontSize?: number | null;
          isRequired?: boolean;
        }>;
      };
    }) => api.patch(API_ROUTES.VOCABULARY.UPDATE_CARD_TYPE(id), body),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["card-types"] });
      qc.invalidateQueries({ queryKey: ["card-type-details", id] });
      // Refresh all cards using this type
      qc.invalidateQueries({ queryKey: ["card-collections"] });
      qc.invalidateQueries({ queryKey: ["card-collection-cards"] });
      qc.invalidateQueries({ queryKey: ["card-collection-detail"] });
      toast.success(i18n.t("vocabulary.cardTypeUpdateSuccess"));
    },
    onError: (e) =>
      toast.error(
        getErrorMessage(e, i18n.t("vocabulary.cardTypeUpdateFailed")),
      ),
  });
};

export const useDeleteCardTypeMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete(API_ROUTES.VOCABULARY.DELETE_CARD_TYPE(id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["card-types"] });
      toast.success(i18n.t("vocabulary.cardTypeDeleteSuccess"));
    },
    onError: (e) =>
      toast.error(
        getErrorMessage(e, i18n.t("vocabulary.cardTypeDeleteFailed")),
      ),
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
      toast.success(i18n.t("vocabulary.cardAddSuccess"));
    },
    onError: (e) =>
      toast.error(getErrorMessage(e, i18n.t("vocabulary.cardAddFailed"))),
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
      toast.success(i18n.t("vocabulary.cardDeleteSuccess"));
    },
    onError: (e) =>
      toast.error(getErrorMessage(e, i18n.t("vocabulary.cardDeleteFailed"))),
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
      toast.success(i18n.t("vocabulary.updateSuccess"));
    },
    onError: (e) =>
      toast.error(getErrorMessage(e, i18n.t("vocabulary.updateFailed"))),
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
      toast.success(i18n.t("vocabulary.importSuccess"));
    },
    onError: (e) =>
      toast.error(getErrorMessage(e, i18n.t("vocabulary.importFailed"))),
  });
};
