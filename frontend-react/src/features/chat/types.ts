
export type ChatViewProps = {
  embedded?: boolean;
  hideHeader?: boolean;
  hideSidebarSearch?: boolean;
  searchQuery?: string;
  onSearchQueryChange?: (value: string) => void;
};
