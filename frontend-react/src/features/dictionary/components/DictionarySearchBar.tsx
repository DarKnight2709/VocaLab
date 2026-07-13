import { useState, useRef, useEffect } from "react";
import { BookOpen, X, Search as SearchIcon } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { useTranslation } from "@/shared/hooks/useTranslation";
import { useDictionarySuggestion } from "@/features/dictionary/api/dictionaryService";

export function DictionarySearchBar() {
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const { data: searchSuggestion, isLoading } = useDictionarySuggestion(
    searchInput,
    { enabled: showSuggestions },
  );

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    
    // For now, dictionary submission behavior is not fully implemented
    // You can redirect to a dictionary page here or open a modal
    console.log("Dictionary search submitted:", q);

    setShowSuggestions(false);
    inputRef.current?.blur();
  }

  return (
    <div ref={searchRef} className="relative flex-1 max-w-sm w-full">
      <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
        placeholder={t("common.dictionaryPlaceholder") || "Search dictionary..."}
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
      {showSuggestions && searchInput.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-background border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          {isLoading ? (
            <div className="px-4 py-2 text-sm text-muted-foreground animate-pulse">
              Searching...
            </div>
          ) : searchSuggestion?.data?.length ? (
            <ul className="py-1">
              {searchSuggestion.data.map((item: any) => (
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
          )}
        </div>
      )}
    </div>
  );
}
