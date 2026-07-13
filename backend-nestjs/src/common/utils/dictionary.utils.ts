export type DictionaryType = 'learners' | 'thesaurus';

export function buildDictionaryApiUrl(
  baseUrl: string | undefined,
  apiKey: string | undefined,
  query: string,
  type: DictionaryType,
): string {
  if (!baseUrl || !apiKey) {
    throw new Error('Dictionary API configuration is missing.');
  }
  // encodeURIComponent ensures the query is safely encoded for the URL
  return `${baseUrl}/${type}/json/${encodeURIComponent(query)}?key=${apiKey}`;
}
