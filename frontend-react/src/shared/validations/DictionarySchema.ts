import { z } from 'zod';

export const DictionaryDefinitionSchema = z.object({
  text: z.string().nullable(),
  examples: z.array(z.string()),
});

export const DictionaryMeaningSchema = z.object({
  partOfSpeech: z.string().nullable(),
  definitions: z.array(DictionaryDefinitionSchema),
});

export const DictionaryIdiomSchema = z.object({
  isPhrasalVerb: z.boolean(),
  phrase: z.string().nullable(),
  definitions: z.array(DictionaryDefinitionSchema),
});

export const InflectionSchema = z.object({
  label: z.string().nullable(),
  value: z.string().nullable(),
});

export const PronunciationSchema = z.object({
  phonetic: z.string().nullable(),
  audioUrl: z.string().nullable(),
});

export const DictionaryWordDataSchema = z.object({
  word: z.string().nullable(),
  isOffensive: z.boolean().nullable(),
  stems: z.array(z.string()),
  pronunciations: z.array(PronunciationSchema),
  inflections: z.array(InflectionSchema),
  meanings: z.array(DictionaryMeaningSchema),
  idioms: z.array(DictionaryIdiomSchema),
  synonyms: z.array(z.string()),
  antonyms: z.array(z.string()),
  relatedWords: z.array(z.string()),
});

export const DictionaryWordLookupResponseSchema = DictionaryWordDataSchema;

export type DictionaryWordData = z.infer<typeof DictionaryWordDataSchema>;
