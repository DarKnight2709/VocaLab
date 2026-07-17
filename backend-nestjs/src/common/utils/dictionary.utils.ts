export type DictionaryType = 'learners' | 'thesaurus';

export function buildDictionaryApiUrl(
  baseUrl: string,
  apiKey: string,
  query: string,
  type: DictionaryType,
): string {
  return `${baseUrl}/${type}/json/${encodeURIComponent(query)}?key=${apiKey}`;
}
