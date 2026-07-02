export const SEARCH_SORT = {
  NEWEST: 'newest',
  OLDEST: 'oldest',
  POPULAR: 'popular',
} as const;

export type SearchSort = (typeof SEARCH_SORT)[keyof typeof SEARCH_SORT];

export const SEARCH_TIME = {
  ALL: 'all',
  DAY_24: '24h',
  WEEK_7: '7d',
  MONTH_30: '30d',
  YEAR_1: '1y',
} as const;

export type SearchTime = (typeof SEARCH_TIME)[keyof typeof SEARCH_TIME];

export interface SearchFilters {
  sort: SearchSort;
  time: SearchTime;
}
