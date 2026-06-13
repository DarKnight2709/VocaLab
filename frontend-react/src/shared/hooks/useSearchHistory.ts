import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocalStorage } from "./useLocalStorage";
import type { SearchHistoryItem } from "../types/search";


export function useSearchHistory() {

  // 1. Save search history in localStorage
  const [history, setHistory] = useLocalStorage<SearchHistoryItem[]>(
    "search-history",
    []
  );

  // Update cache in react-query
  const queryClient = useQueryClient();

  // 2. Put search history data from localStorage into cache
  // Auto re-render components that use it if history changes
  const historyQuery = useQuery({
    queryKey: ["search-history"],
    queryFn: () => history,
    initialData: history,
  });


  // 3. Add new search history
  const addToHistory = useMutation({
    mutationFn: async (
      // remove id property from SearchHistoryItem type => create a new type without this property 
      search: Omit<SearchHistoryItem, "id">
    ) => {
      const newSearch: SearchHistoryItem = {
        ...search,
        id: `${search.query}-${Date.now()}`,
      };

      // Remove duplicates and keep only last 10 searches
      const filteredHistory = history.filter(
        (item) => !(item.query === search.query)
      );
      const newHistory = [newSearch, ...filteredHistory].slice(0, 10);

      setHistory(newHistory);
      return newHistory;
    },

    // If successful in getting data from fetch (POST, PUT, DELETE) (in this case is return) then update cache with new data
    onSuccess: (newHistory) => {
      queryClient.setQueryData(["search-history"], newHistory);
    },
  });

  const clearHistory = useMutation({
    mutationFn: async () => {
      setHistory([]);
      return [];
    },
    onSuccess: () => {
      queryClient.setQueryData(["search-history"], []);
    },
  });

  const removeFromHistory = useMutation({
    mutationFn: async (id: string) => {
      const newHistory = history.filter((item) => item.id !== id);
      setHistory(newHistory);
      return newHistory;
    },
    onSuccess: (newHistory) => {
      queryClient.setQueryData(["search-history"], newHistory);
    },
  });

  // return 3 cái:
    // 1. Giá trị của history cái này có thể thay đổi khi có cập nhật dữ liệu vào cache như (Cập nhật, xóa)
    // 2. Thêm vào history (hành động này làm thay đổi đến cache => thay đổi giá trị của history)
    // 3. Xóa toàn bộ history (hành động này làm thay đổi đến cache => thay đổi giá trị của history)
  return {
    history: historyQuery.data ?? [],
    addToHistory,
    clearHistory,
    removeFromHistory,
  };
}