import { z } from "zod";
import { CardSide } from "../enums/CardSide.enum";

// Enums for Zod
export const CardSideEnum = z.nativeEnum(CardSide);

// Card Field
export const CardFieldSchema = z.object({
  id: z.string(),
  cardTypeId: z.string().optional(),
  key: z.string(),
  label: z.string(),
  side: CardSideEnum,
  order: z.number(),
  color: z.string().nullable().optional(),
  fontSize: z.number().nullable().optional(),
  isRequired: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Card Type
export const CardTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  fields: z.array(CardFieldSchema),
});

// Card Type List Response
export const CardTypeListResponseSchema = z.object({
  cardTypes: z.array(CardTypeSchema),
});

// Card Type Details Response (Single CardType)
export const CardTypeDetailsResponseSchema = CardTypeSchema;

// Types inferred from schemas
export type CardField = z.infer<typeof CardFieldSchema>;
export type CardType = z.infer<typeof CardTypeSchema>;
export type CardTypeListResponse = z.infer<typeof CardTypeListResponseSchema>;
export type CardTypeDetailsResponse = z.infer<typeof CardTypeDetailsResponseSchema>;
