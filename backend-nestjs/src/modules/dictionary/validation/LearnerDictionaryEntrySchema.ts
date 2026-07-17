import { z } from 'zod';

// 1. Core Linguistics & Definitions
const VerbalIllustrationSchema = z.object({
  t: z.string(),
});

const UsageNoteSchema = z.union([
  z.tuple([z.literal('t'), z.string()]),
  z.tuple([z.literal('vis'), z.array(VerbalIllustrationSchema)]),
]);

export const DefiningTextTupleSchema = z.union([
  z.tuple([z.literal('text'), z.string()]),
  z.tuple([z.literal('vis'), z.array(VerbalIllustrationSchema)]),
  z.tuple([z.literal('snote'), z.array(UsageNoteSchema)]),
  z.tuple([z.literal('wsgram'), z.string()]),
  z.tuple([z.literal('uns'), z.array(z.array(z.unknown()))]),
]);

export const SensePhrasevariantsSchema = z.object({
  phrs: z.array(z.object({
    pva: z.string(),
    pvl: z.string().optional()
  }))
})

export const SenseSchema = z.object({
  sls: z.array(z.string()).optional(),
  sphrasev: SensePhrasevariantsSchema.optional(),
  dt: z.array(z.unknown()).transform(
    (arr) => arr.filter((item) => DefiningTextTupleSchema.safeParse(item).success) as z.infer<typeof DefiningTextTupleSchema>[]
  ),
  sgram: z.string().optional(),
  lbs: z.array(z.string()).optional(),
});

export const SenseSequenceSchema = z.union([
  z.tuple([z.literal('sense'), SenseSchema]),
]);

export const DefinitionSchema = z.object({
  sseq: z.array(z.array(z.unknown())).transform(
    (outerArr) => outerArr.map(innerArr => {
      return innerArr
        .map(item => SenseSequenceSchema.safeParse(item))
        .filter(parsed => parsed.success)
        .map(parsed => parsed.data as z.infer<typeof SenseSequenceSchema>);
    }).filter(innerArr => innerArr.length > 0)
  ).optional(),
});

// 2. Pronunciation & Headword
export const PronunciationSchema = z.object({
  ipa: z.string().optional(),
  sound: z.object({ audio: z.string() }).optional(),
});

export const HeadwordInformationSchema = z.object({
  hw: z.string(),
  prs: z.array(PronunciationSchema).optional(),
});

// 3. Inflections (Plurals, Verb Tenses)
export const InflectionSchema = z.object({
  il: z.string().optional(),
  if: z.string().optional(),
});

// 4. Idioms and Phrases (Run-ons)
export const DefinedRunOnSchema = z.object({
  drp: z.string(),
  gram: z.string().optional(),
  def: z.array(DefinitionSchema).optional(),
});

// 5. Sanitized Metadata (Stripped of MW internal bloat)
const MetaSchema = z.object({
  id: z.string(), // Keep this: often contains the word + sense number (e.g., "apple:1")
  stems: z.array(z.string()).optional(), // Keep this: incredibly useful for your own search indexing
  offensive: z.boolean().optional(), // Keep this: vital for content filtering
});

// 6. Root Schema
export const LearnerDictionaryEntrySchema = z.array(
  z.object({
    meta: MetaSchema,
    hwi: HeadwordInformationSchema,
    fl: z.string().optional(), // Functional label (noun, verb). Sometimes omitted on idioms.
    gram: z.string().optional(), // Grammar label (e.g. 'count', 'noncount')
    ins: z.array(InflectionSchema).optional(),
    def: z.array(DefinitionSchema).optional(),
    dros: z.array(DefinedRunOnSchema).optional(),
    shortdef: z.array(z.string()).optional(),
  }),
);

export type UsageNote = z.infer<typeof UsageNoteSchema>;
export type DefinedRunOn = z.infer<typeof DefinedRunOnSchema>;
export type Inflection = z.infer<typeof InflectionSchema>;
export type HeadwordInformation = z.infer<typeof HeadwordInformationSchema>;
export type Pronunciation = z.infer<typeof PronunciationSchema>;
export type Definition = z.infer<typeof DefinitionSchema>;
export type SenseSequence = z.infer<typeof SenseSequenceSchema>;
export type Sense = z.infer<typeof SenseSchema>;
export type DefiningTextTuple = z.infer<typeof DefiningTextTupleSchema>;
// Export the inferred type for use across your backend services
export type LearnerDictionaryEntry = z.infer<
  typeof LearnerDictionaryEntrySchema
>;
