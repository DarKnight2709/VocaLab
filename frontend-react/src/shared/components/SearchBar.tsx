import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Search as SearchIcon, X } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import ROUTES from "@/shared/lib/routes";
import { useTranslation } from "@/shared/hooks/useTranslation";
import { useSearchSuggestion } from "@/shared/hooks/useSearchSuggestion";
import { useSearchHistory } from "@/shared/hooks/useSearchHistory";

export function SearchBar() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const qParam = searchParams.get("q") || "";

  const [searchInput, setSearchInput] = useState(qParam);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { data: searchSuggestion, isLoading } = useSearchSuggestion(
    searchInput,
    { enabled: showSuggestions },
  );

  const { history, addToHistory, clearHistory, removeFromHistory } = useSearchHistory();

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setSearchInput(qParam);
  }, [qParam]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearchSubmit(q: string) {
    if (!q.trim()) return;
    addToHistory.mutate({ query: q.trim() });
    navigate(`${ROUTES.SEARCH.url}?q=${encodeURIComponent(q.trim())}`);
    setShowSuggestions(false);
    inputRef.current?.blur();
  }

  return (
    <div ref={searchRef} className="relative flex-1 max-w-sm w-full">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        ref={inputRef}
        value={searchInput}
        onFocus={() => setShowSuggestions(true)}
        onChange={(e) => {
          setSearchInput(e.target.value);
          setShowSuggestions(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearchSubmit(searchInput);
          }
        }}
        placeholder={t("common.searchPlaceholder")}
        className="h-10 pl-9 pr-9 bg-muted/50 border-transparent focus:bg-background focus:border-border transition-all"
      />
      {searchInput.length > 0 && (
        <button
          type="button"
          onClick={() => {
            setSearchInput("");
            setShowSuggestions(true);
            inputRef.current?.focus();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {/* Search Suggestion Dropdown */}
      {showSuggestions && (searchInput.length > 0 || history.length > 0) && (
        <div className="absolute top-full mt-2 w-full bg-background border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          {searchInput.length > 0 ? (
            isLoading ? (
              <div className="px-4 py-2 text-sm text-muted-foreground animate-pulse">
                Searching...
              </div>
            ) : searchSuggestion?.data?.length ? (
              <ul className="py-1">
                {searchSuggestion.data.map((item) => (
                  <li
                    key={item.id}
                    className="px-4 py-2 hover:bg-muted cursor-pointer transition-colors flex items-center gap-3"
                    onClick={() => {
                      handleSearchSubmit(item.text);
                    }}
                  >
                    <SearchIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="truncate">{item.text}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-2 text-sm text-muted-foreground">
                No results found.
              </div>
            )
          ) : (
            <div className="py-1">
              <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase flex items-center justify-between">
                <span>Recent Searches</span>
                <button
                  type="button"
                  onClick={() => clearHistory.mutate()}
                  className="hover:text-foreground hover:underline cursor-pointer"
                >
                  Clear
                </button>
              </div>
              <ul className="pb-1">
                {history.map((item) => (
                  <li
                    key={item.id}
                    className="px-4 py-2 hover:bg-muted cursor-pointer transition-colors flex items-center justify-between group"
                    onClick={() => handleSearchSubmit(item.query)}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <SearchIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate">{item.query}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromHistory.mutate(item.id);
                      }}
                      className="p-1 text-muted-foreground hover:text-foreground hover:bg-background rounded opacity-0 group-hover:opacity-100 transition-all"
                      title="Remove from history"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
