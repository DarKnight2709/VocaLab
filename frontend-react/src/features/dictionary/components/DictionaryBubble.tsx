import { useState, useRef, useEffect } from "react";
import { BookOpen, X, Search as SearchIcon, Clock } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { useTranslation } from "@/shared/hooks/useTranslation";
import { useDictionarySuggestion, useDictionaryWordLookup } from "@/features/dictionary/api/dictionaryService";
import { useDictionarySearchHistory } from "@/features/dictionary/hooks/useDictionarySearchHistory";
import { Button } from "@/shared/components/ui/button";
import { Volume2 } from "lucide-react";
import LoadingSpinner from '@/shared/components/LoadingSpinner';
import { cn } from "@/shared/lib/utils";
import { useLocation } from "react-router-dom";

function ExpandableExamples({ examples }: { examples: string[] }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  if (!examples || examples.length === 0) return null;
  
  const showAll = expanded || examples.length <= 2;
  const visibleExamples = showAll ? examples : examples.slice(0, 2);

  return (
    <div className="space-y-1 mt-1 pl-3 border-l-2 border-muted">
      {visibleExamples.map((ex, exIdx) => (
        <p key={exIdx} className="text-xs text-muted-foreground italic" dangerouslySetInnerHTML={{ __html: `"${ex}"` }} />
      ))}
      {!showAll ? (
        <button 
          onClick={() => setExpanded(true)} 
          className="text-[10px] font-semibold text-primary hover:underline mt-1"
        >
          {t('dictionary.moreItems', { count: examples.length - 2 }) || `+ ${examples.length - 2} more`}
        </button>
      ) : examples.length > 2 && (
        <button 
          onClick={() => setExpanded(false)} 
          className="text-[10px] font-semibold text-muted-foreground hover:underline mt-1"
        >
          {t('dictionary.showLess') || "Show less"}
        </button>
      )}
    </div>
  );
}

function ExpandableTags({ tags, type, onClick }: { tags: string[], type: 'synonym' | 'antonym', onClick: (t: string) => void }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  if (!tags || tags.length === 0) return null;
  
  // Display up to 5 items initially for tags
  const limit = 5;
  const showAll = expanded || tags.length <= limit;
  const visibleTags = showAll ? tags : tags.slice(0, limit);
  const colorClass = type === 'synonym' 
    ? "bg-primary/10 text-primary hover:bg-primary/20" 
    : "bg-destructive/10 text-destructive hover:bg-destructive/20";

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {visibleTags.map((tag, i) => (
        <button 
          key={i} 
          onClick={() => onClick(tag)}
          className={`px-2.5 py-1 text-xs font-medium rounded-full cursor-pointer transition-colors ${colorClass}`}
        >
          {tag}
        </button>
      ))}
      {!showAll ? (
        <button 
          onClick={() => setExpanded(true)} 
          className={`px-2 py-1 text-[10px] font-bold rounded-full ${colorClass}`}
        >
          {t('dictionary.moreItems', { count: tags.length - limit }) || `+ ${tags.length - limit} more`}
        </button>
      ) : tags.length > limit && (
        <button 
          onClick={() => setExpanded(false)} 
          className="px-2 py-1 text-[10px] font-bold rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
        >
          {t('dictionary.showLess') || "Show less"}
        </button>
      )}
    </div>
  );
}
export function DictionaryBubble() {
  const { t } = useTranslation();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchedWord, setSearchedWord] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'definitions' | 'idioms' | 'synonyms' | 'inflections'>('definitions');
  const [activePosTab, setActivePosTab] = useState<string | null>('');
  const [activeIdiomTab, setActiveIdiomTab] = useState<'idiom' | 'phrasal-verb'>('idiom');
  const audioRef = useRef<HTMLAudioElement>(null);

  const { history, addToHistory, clearHistory, removeFromHistory } = useDictionarySearchHistory();

  const { data: searchSuggestion, isLoading: isLoadingSuggestions } = useDictionarySuggestion(
    searchInput,
    { enabled: showSuggestions && isOpen },
  );

  const { data: wordData, isLoading: isLoadingWord, error: wordError } = useDictionaryWordLookup(searchedWord || '', {
    enabled: !!searchedWord,
  });

  const bubbleRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (wordData?.meanings && wordData.meanings.length > 0) {
      setActivePosTab(wordData.meanings[0].partOfSpeech);
    }
    if (wordData?.idioms && wordData.idioms.length > 0) {
      setActiveIdiomTab(wordData.idioms[0].isPhrasalVerb ? 'phrasal-verb' : 'idiom');
    }
  }, [wordData]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        bubbleRef.current &&
        !bubbleRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setShowSuggestions(false);
        setSearchedWord(null);
      }
    }
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Focus input when popover opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Hide the dictionary bubble on login and auth pages
  if (location.pathname.startsWith('/login') || location.pathname.startsWith('/auth')) {
    return null;
  }

  function handleSearchSubmit(q: string) {
    if (!q.trim()) return;
    
    addToHistory.mutate({ query: q.trim() });
    
    setShowSuggestions(false);
    setSearchInput("");
    inputRef.current?.blur();
    
    setSearchedWord(q.trim());
    setActiveTab('definitions');
  }

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  return (
    <div className="fixed bottom-12 right-6 z-50 flex flex-col items-end pointer-events-none" ref={bubbleRef}>
      {/* Popover content */}
      <div 
        className={cn(
          "mb-4 bg-background border border-border shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 origin-bottom-right flex flex-col",
          isOpen ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-95 translate-y-4 pointer-events-none",
          "w-[480px] max-w-[calc(100vw-2rem)]",
          showSuggestions && (searchInput.length > 0 || history.length > 0) 
            ? "h-[600px] max-h-[calc(100vh-8rem)]"
            : searchedWord 
              ? "h-[600px] max-h-[calc(100vh-8rem)]" 
              : "h-[400px] max-h-[calc(100vh-8rem)]"
        )}
      >
        {/* Header - Search Bar */}
        <div className="p-2 border-b border-border flex items-center shrink-0 bg-background">
          <div className="relative flex-1 flex items-center">
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
              placeholder={t("common.dictionaryPlaceholder") || "Search dictionary..."}
              className="h-10 pl-9 pr-9 border-none bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
            />
            {searchInput.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setShowSuggestions(true);
                  inputRef.current?.focus();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="w-px h-5 bg-border mx-1 shrink-0"></div>
          <button 
            type="button"
            onClick={() => {
              setIsOpen(false);
              setSearchedWord(null);
            }}
            className="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col min-h-0 bg-background">
          {showSuggestions && (searchInput.length > 0 || history.length > 0) ? (
            <div className="w-full flex-1 overflow-y-auto custom-scrollbar p-2">
              {searchInput.length > 0 ? (
                isLoadingSuggestions ? (
                  <div className="p-8 flex items-center justify-center text-muted-foreground">
                    <LoadingSpinner isLoading={true} />
                  </div>
                ) : searchSuggestion?.data?.length ? (
                  <ul className="py-1">
                    {searchSuggestion.data.map((item: any) => (
                      <li
                        key={item.id}
                        className="px-4 py-3 hover:bg-muted cursor-pointer transition-colors flex items-center gap-3 text-sm rounded-xl"
                        onClick={() => {
                          handleSearchSubmit(item.text);
                        }}
                      >
                        <SearchIcon className="h-4 w-4 text-muted-foreground shrink-0 opacity-50" />
                        <span className="truncate font-medium">{item.text}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-8 text-sm text-muted-foreground text-center">
                    {t('dictionary.noResults') || "No results found."}
                  </div>
                )
              ) : (
                <div className="py-2">
                  <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase flex items-center justify-between">
                    <span>{t('dictionary.recentSearches') || 'Recent Searches'}</span>
                    <button
                      type="button"
                      onClick={() => clearHistory.mutate()}
                      className="hover:text-foreground hover:underline cursor-pointer"
                    >
                      {t('dictionary.clear') || 'Clear'}
                    </button>
                  </div>
                  <ul className="pb-2">
                    {history.map((item) => (
                      <li
                        key={item.id}
                        className="px-4 py-3 hover:bg-muted cursor-pointer transition-colors flex items-center justify-between group rounded-xl"
                        onClick={() => handleSearchSubmit(item.query)}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <Clock className="h-4 w-4 text-muted-foreground shrink-0 opacity-50" />
                          <span className="truncate font-medium">{item.query}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromHistory.mutate(item.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-background rounded-md transition-all text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : searchedWord ? (
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
              {isLoadingWord ? (
                <div className="flex h-full items-center justify-center">
                  <LoadingSpinner isLoading={true} />
                </div>
              ) : wordError || !wordData ? (
                <div className="flex flex-col h-full items-center justify-center text-center p-4">
                  <BookOpen className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-lg font-bold mb-2">{t('dictionary.wordNotFound') || 'Word not found'}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('dictionary.wordNotFoundDesc', { word: searchedWord }) || `We couldn't find a definition for "${searchedWord}".`}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-3xl font-extrabold text-foreground tracking-tight mb-2 flex items-center gap-3">
                        {wordData.word}
                        {wordData.isOffensive && (
                          <span className="text-[10px] font-bold bg-destructive/10 text-destructive px-2 py-0.5 rounded uppercase tracking-wider">
                            Offensive
                          </span>
                        )}
                      </h2>
                      {wordData.pronunciations && wordData.pronunciations.length > 0 && wordData.pronunciations[0].phonetic && (
                        <span className="font-mono text-sm bg-muted/50 px-2 py-1 rounded text-muted-foreground inline-block mt-1">
                          /{wordData.pronunciations[0].phonetic}/
                        </span>
                      )}
                    </div>
                    {wordData.pronunciations && wordData.pronunciations.length > 0 && wordData.pronunciations[0].audioUrl && (
                      <>
                        <audio ref={audioRef} src={wordData.pronunciations[0].audioUrl} />
                        <button
                          onClick={playAudio}
                          className="group flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all shrink-0"
                        >
                          <Volume2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </button>
                      </>
                    )}
                  </div>

                  <div className="flex w-full border-b border-border mt-4 overflow-x-auto custom-scrollbar">
                    <button
                      onClick={() => setActiveTab('definitions')}
                      className={cn(
                        "whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-all border-b-2",
                        activeTab === 'definitions' 
                          ? "border-primary text-primary" 
                          : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                      )}
                    >
                      {t('dictionary.definition') || 'Definition'}
                    </button>
                    {wordData.idioms && wordData.idioms.length > 0 && (
                      <button
                        onClick={() => setActiveTab('idioms')}
                        className={cn(
                          "whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-all border-b-2",
                          activeTab === 'idioms' 
                            ? "border-primary text-primary" 
                            : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                        )}
                      >
                        {t('dictionary.idiomsPhrases') || 'Idioms & Phrases'}
                      </button>
                    )}
                    {((wordData.synonyms && wordData.synonyms.length > 0) || 
                       (wordData.antonyms && wordData.antonyms.length > 0) || 
                       (wordData.relatedWords && wordData.relatedWords.length > 0) || 
                       (wordData.stems && wordData.stems.length > 0)) && (
                      <button
                        onClick={() => setActiveTab('synonyms')}
                        className={cn(
                          "whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-all border-b-2",
                          activeTab === 'synonyms' 
                            ? "border-primary text-primary" 
                            : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                        )}
                      >
                        {t('dictionary.synonymsAntonyms') || 'Synonyms & Antonyms'}
                      </button>
                    )}
                    {wordData.inflections && wordData.inflections.length > 0 && (
                      <button
                        onClick={() => setActiveTab('inflections')}
                        className={cn(
                          "whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-all border-b-2",
                          activeTab === 'inflections' 
                            ? "border-primary text-primary" 
                            : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                        )}
                      >
                        {t('dictionary.inflections') || 'Inflections'}
                      </button>
                    )}
                  </div>

                  <div className="mt-4 pb-4">
                    {activeTab === 'definitions' && (
                      <div className="space-y-4">
                        {/* POS Tabs */}
                        {wordData.meanings.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {wordData.meanings.map((meaning: any) => (
                              <button
                                key={meaning.partOfSpeech}
                                onClick={() => setActivePosTab(meaning.partOfSpeech)}
                                className={cn(
                                  "px-3 py-1 text-xs font-semibold rounded-full capitalize transition-colors",
                                  activePosTab === meaning.partOfSpeech
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                                )}
                              >
                                {t(`dictionary.pos.${(meaning.partOfSpeech || 'unknown').toLowerCase().replace(/\s+/g, '_')}`, { defaultValue: meaning.partOfSpeech || 'Unknown' })}
                              </button>
                            ))}
                          </div>
                        )}

                        {wordData.meanings
                          .filter((m: any) => m.partOfSpeech === (activePosTab || wordData.meanings[0].partOfSpeech))
                          .map((meaning: any, index: number) => (
                            <div key={index} className="space-y-3">

                        <ul className="space-y-4 pl-3">
                          {meaning.definitions.map((def: any, defIdx: number) => (
                            <li key={defIdx} className="space-y-1 relative">
                              <div className="absolute -left-3 top-2 w-1.5 h-1.5 rounded-full bg-primary/40"></div>
                              <p className="text-sm text-foreground/90 font-medium" dangerouslySetInnerHTML={{ __html: def.text }} />
                              
                              {def.examples && def.examples.length > 0 && (
                                <ExpandableExamples examples={def.examples} />
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    </div>
                  )}

                  {activeTab === 'idioms' && wordData.idioms && wordData.idioms.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2 mb-2">
                          {Array.from(new Set(wordData.idioms.map((i: any) => i.isPhrasalVerb ? 'phrasal-verb' : 'idiom'))).map((type: any) => (
                            <button
                              key={type}
                              onClick={() => setActiveIdiomTab(type)}
                              className={cn(
                                "px-3 py-1 text-xs font-semibold rounded-full capitalize transition-colors",
                                activeIdiomTab === type
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                              )}
                            >
                              {type === 'phrasal-verb' ? t('dictionary.phrasalVerbs') || 'Phrasal Verbs' : t('dictionary.idiomsAndPhrases') || 'Idioms & Phrases'}
                            </button>
                          ))}
                        </div>

                        <div className="space-y-5">
                          {wordData.idioms
                            .filter((i: any) => (i.isPhrasalVerb ? 'phrasal-verb' : 'idiom') === activeIdiomTab)
                            .map((idiom: any, index: number) => (
                            <div key={index} className="space-y-2">
                              <h4 className="font-semibold text-primary">{idiom.phrase}</h4>
                              <ul className="space-y-3 pl-3">
                                {idiom.definitions.map((def: any, defIdx: number) => (
                                  <li key={defIdx} className="space-y-1 relative">
                                    <div className="absolute -left-3 top-2 w-1.5 h-1.5 rounded-full bg-primary/40"></div>
                                    <p className="text-sm text-foreground/90" dangerouslySetInnerHTML={{ __html: def.text }} />

                                    {def.examples && def.examples.length > 0 && (
                                      <ExpandableExamples examples={def.examples} />
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === 'synonyms' && (
                      <div className="space-y-6">
                        {wordData.synonyms && wordData.synonyms.length > 0 && (
                          <div className="space-y-2">
                            <h3 className="text-sm font-bold text-foreground">
                              {t('dictionary.synonyms') || 'Synonyms'}
                            </h3>
                            <ExpandableTags 
                              tags={wordData.synonyms} 
                              type="synonym" 
                              onClick={handleSearchSubmit} 
                            />
                          </div>
                        )}
                        {wordData.antonyms && wordData.antonyms.length > 0 && (
                          <div className="space-y-2">
                            <h3 className="text-sm font-bold text-foreground">
                              {t('dictionary.antonyms') || 'Antonyms'}
                            </h3>
                            <ExpandableTags 
                              tags={wordData.antonyms} 
                              type="antonym" 
                              onClick={handleSearchSubmit} 
                            />
                          </div>
                        )}
                        {wordData.relatedWords && wordData.relatedWords.length > 0 && (
                          <div className="space-y-2">
                            <h3 className="text-sm font-bold text-foreground">
                              {t('dictionary.relatedWords') || 'Related Words'}
                            </h3>
                            <ExpandableTags 
                              tags={wordData.relatedWords} 
                              type="synonym" 
                              onClick={handleSearchSubmit} 
                            />
                          </div>
                        )}
                        {wordData.stems && wordData.stems.length > 0 && (
                          <div className="space-y-2">
                            <h3 className="text-sm font-bold text-foreground">
                              {t('dictionary.stems') || 'Stems'}
                            </h3>
                            <ExpandableTags 
                              tags={wordData.stems} 
                              type="synonym" 
                              onClick={handleSearchSubmit} 
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'inflections' && wordData.inflections && wordData.inflections.length > 0 && (
                      <div className="flex flex-wrap gap-x-6 gap-y-3 mt-4">
                        {wordData.inflections.map((inf: any, idx: number) => (
                          <div key={idx} className="text-base text-foreground">
                            {inf.label && <span className="italic text-muted-foreground mr-2">{inf.label}</span>}
                            <span className="font-bold">{inf.value}</span>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>

                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-6 text-center opacity-50">
              <BookOpen className="w-12 h-12 mb-4" />
              <p>{t('common.dictionaryPlaceholder') || 'Search for a word to see its definition'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Bubble Button */}
      <Button
        type="button"
        size="icon"
        className="w-14 h-14 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 pointer-events-auto"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
      </Button>
    </div>
  );
}
