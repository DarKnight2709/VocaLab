import { z } from 'zod';

// 1. Definition Text (Reused from Dictionary schema for safety)
const VerbalIllustrationSchema = z.object({
  t: z.string(),
});

const DefiningTextTupleSchema = z.union([
  z.tuple([z.literal('text'), z.string()]),
  z.tuple([z.literal('vis'), z.array(VerbalIllustrationSchema)]),
  z.tuple([z.literal('wsgram'), z.string()]),
  z.tuple([z.literal('uns'), z.array(z.unknown())]),
  z.tuple([z.literal('snote'), z.array(z.unknown())]),
]);

// 2. Thesaurus Word Lists (New)
// Thesaurus lists return data like: [[{ wd: "adjudicator" }, { wd: "arbiter" }]]
const WordItemSchema = z.object({
  wd: z.string(),
});

// A double array of word objects
const ThesaurusListSchema = z.array(z.array(WordItemSchema));

// 3. Sense Sequence (Expanded)
const SenseSchema = z.object({
  dt: z.array(DefiningTextTupleSchema),
  syn_list: ThesaurusListSchema.optional(), // Synonyms
  rel_list: ThesaurusListSchema.optional(), // Related words
  ant_list: ThesaurusListSchema.optional(), // Antonyms
  near_list: ThesaurusListSchema.optional(), // Near antonyms
});

const SenseSequenceSchema = z.tuple([z.literal('sense'), SenseSchema]);

const DefinitionSchema = z.object({
  sseq: z.array(z.array(SenseSequenceSchema)).optional(),
});

// 4. Headword
const HeadwordInformationSchema = z.object({
  hw: z.string(),
  // Pronunciation omitted in your sample, but good to keep optional for safety
  prs: z.array(z.any()).optional(),
});

// 5. Meta (Expanded for Thesaurus)
const MetaSchema = z.object({
  id: z.string(),
  stems: z.array(z.string()).optional(),
  syns: z.array(z.array(z.string())).optional(),
  ants: z.array(z.array(z.string())).optional(),
  offensive: z.boolean().optional(),
});

// 6. Root Schema
export const ThesaurusEntrySchema = z.array(
  z.object({
    meta: MetaSchema,
    hwi: HeadwordInformationSchema,
    fl: z.string().optional(),
    def: z.array(DefinitionSchema).optional(),
    shortdef: z.array(z.string()),
  }),
);

export type ThesaurusEntry = z.infer<typeof ThesaurusEntrySchema>;
