import { z } from "zod";

export const SearchSuggestionResultSchema = z.object({
  id: z.string(),
  text: z.string(),
});

export const SearchSuggestionListSchema = z.array(SearchSuggestionResultSchema);

export type SearchSuggestionResult = z.infer<typeof SearchSuggestionResultSchema>;
