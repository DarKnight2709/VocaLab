import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Search as SearchIcon, X, Clock } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import ROUTES from "@/shared/lib/routes";
import { useTranslation } from "@/shared/hooks/useTranslation";
import { useSearchSuggestion } from "@/shared/hooks/useSearchSuggestion";
import { useSearchHistory } from "@/shared/hooks/useSearchHistory";
import { useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();

  useEffect(() => {
    setSearchInput(qParam);
  }, [qParam]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setShowSuggestions(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

    const type = searchParams.get("type") || "all";
    const params = new URLSearchParams();
    params.set("q", q.trim());
    params.set("type", type);

    queryClient.invalidateQueries({ queryKey: ["search-sidebar", q.trim()] });
    queryClient.invalidateQueries({ queryKey: ["search-infinite", q.trim()] });

    navigate(`${ROUTES.SEARCH.url}?${params.toString()}`);
    setShowSuggestions(false);
    inputRef.current?.blur();
  }

  return (
    <div ref={searchRef} className="relative flex-1 max-w-md w-full">
      <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/80 pointer-events-none" />
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
          if (e.key === "Escape") {
            setShowSuggestions(false);
            inputRef.current?.blur();
          }
        }}
        placeholder={t("common.searchPlaceholder")}
        className="h-10 pl-10 pr-12 rounded-2xl bg-muted/50 hover:bg-muted/70 focus:bg-card border border-border/70 focus:border-primary/50 text-sm placeholder:text-muted-foreground/70 transition-all shadow-2xs focus:shadow-xs focus:ring-2 focus:ring-primary/10"
      />
      {searchInput.length > 0 ? (
        <button
          type="button"
          onClick={() => {
            setSearchInput("");
            setShowSuggestions(true);
            inputRef.current?.focus();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : (
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-muted-foreground/70 bg-background/80 rounded-md border border-border/80 shadow-2xs absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none select-none">
          ⌘K
        </kbd>
      )}

      {/* Search Suggestion Dropdown */}
      {showSuggestions && (searchInput.length > 0 || history.length > 0) && (
        <div className="absolute top-full mt-2 w-full bg-card/95 backdrop-blur-md border border-border/80 rounded-2xl shadow-xl z-50 overflow-hidden p-1.5">
          {searchInput.length > 0 ? (
            isLoading ? (
              <div className="px-4 py-3 text-sm text-muted-foreground animate-pulse">
                Searching...
              </div>
            ) : searchSuggestion?.data?.length ? (
              <ul className="py-0.5 space-y-0.5">
                {searchSuggestion.data.map((item) => (
                  <li
                    key={item.id}
                    className="px-3.5 py-2.5 rounded-xl hover:bg-muted/80 cursor-pointer transition-colors flex items-center gap-3 text-sm"
                    onClick={() => {
                      handleSearchSubmit(item.text);
                    }}
                  >
                    <SearchIcon className="h-4 w-4 text-primary shrink-0" />
                    <span className="truncate font-medium text-foreground">{item.text}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-3 text-sm text-muted-foreground">
                No results found.
              </div>
            )
          ) : (
            <div>
              <div className="px-3.5 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                <span>Recent Searches</span>
                <button
                  type="button"
                  onClick={() => clearHistory.mutate()}
                  className="hover:text-primary transition-colors cursor-pointer text-xs lowercase first-letter:uppercase font-normal"
                >
                  Clear all
                </button>
              </div>
              <ul className="space-y-0.5 pb-1">
                {history.map((item) => (
                  <li
                    key={item.id}
                    className="px-3.5 py-2 rounded-xl hover:bg-muted/80 cursor-pointer transition-colors flex items-center justify-between group text-sm"
                    onClick={() => handleSearchSubmit(item.query)}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate font-medium text-foreground">{item.query}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromHistory.mutate(item.id);
                      }}
                      className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      title="Remove from history"
                    >
                      <X className="h-3.5 w-3.5" />
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
