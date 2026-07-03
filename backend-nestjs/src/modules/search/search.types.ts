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

export const SEARCH_PROFILE_SORT = {
  ALL: 'all',
  FRIENDS: 'friends',
  MUTUAL_FRIENDS: 'mutual-friends',
} as const;

export type SearchProfileSort =
  (typeof SEARCH_PROFILE_SORT)[keyof typeof SEARCH_PROFILE_SORT];

export interface PostSearchFilters {
  sort: SearchSort;
  time: SearchTime;
}

export interface ProfileSearchFilters {
  profileSort: SearchProfileSort;
}

export const SEARCH_GROUP_FILTER = {
  ALL: 'all',
  MY_GROUPS: 'my_groups',
  POPULAR: 'popular',
} as const;

export type SearchGroupFilter =
  (typeof SEARCH_GROUP_FILTER)[keyof typeof SEARCH_GROUP_FILTER];

export interface GroupSearchFilters {
  filter?: SearchGroupFilter;
  languages?: string[];
}
