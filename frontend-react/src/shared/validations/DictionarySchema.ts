import { z } from 'zod';

export const DictionaryDefinitionSchema = z.object({
  text: z.string(),
  examples: z.array(z.string()),
});

export const DictionaryMeaningSchema = z.object({
  partOfSpeech: z.string(),
  definitions: z.array(DictionaryDefinitionSchema),
});

export const DictionaryIdiomSchema = z.object({
  phrase: z.string(),
  definitions: z.array(DictionaryDefinitionSchema),
});

export const DictionaryWordDataSchema = z.object({
  word: z.string(),
  phonetic: z.string().optional(),
  audioUrl: z.string().optional(),
  meanings: z.array(DictionaryMeaningSchema),
  idioms: z.array(DictionaryIdiomSchema).optional(),
  synonyms: z.array(z.string()).optional(),
  antonyms: z.array(z.string()).optional(),
});

export const DictionaryWordLookupResponseSchema = DictionaryWordDataSchema;

export type DictionaryWordData = z.infer<typeof DictionaryWordDataSchema>;
