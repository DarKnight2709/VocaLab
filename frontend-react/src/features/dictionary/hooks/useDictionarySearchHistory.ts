import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocalStorage } from "@/shared/hooks/useLocalStorage";
import type { SearchHistoryItem } from "@/shared/types/search";

export function useDictionarySearchHistory() {
  const [history, setHistory] = useLocalStorage<SearchHistoryItem[]>(
    "dic-search-history",
    []
  );

  const queryClient = useQueryClient();

  const historyQuery = useQuery({
    queryKey: ["dic-search-history"],
    queryFn: () => history,
    initialData: history,
  });

  const addToHistory = useMutation({
    mutationFn: async (
      search: Omit<SearchHistoryItem, "id">
    ) => {
      const newSearch: SearchHistoryItem = {
        ...search,
        id: `${search.query}-${Date.now()}`,
      };

      const filteredHistory = history.filter(
        (item) => !(item.query === search.query)
      );
      const newHistory = [newSearch, ...filteredHistory].slice(0, 10);

      setHistory(newHistory);
      return newHistory;
    },
    onSuccess: (newHistory) => {
      queryClient.setQueryData(["dic-search-history"], newHistory);
    },
  });

  const clearHistory = useMutation({
    mutationFn: async () => {
      setHistory([]);
      return [];
    },
    onSuccess: () => {
      queryClient.setQueryData(["dic-search-history"], []);
    },
  });

  const removeFromHistory = useMutation({
    mutationFn: async (id: string) => {
      const newHistory = history.filter((item) => item.id !== id);
      setHistory(newHistory);
      return newHistory;
    },
    onSuccess: (newHistory) => {
      queryClient.setQueryData(["dic-search-history"], newHistory);
    },
  });

  return {
    history: historyQuery.data ?? [],
    addToHistory,
    clearHistory,
    removeFromHistory,
  };
}
