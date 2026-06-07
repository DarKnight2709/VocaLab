import { useState, useEffect, useRef } from "react";
import { Input } from "@/shared/components/ui/input";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import envConfig from "@/shared/config/envConfig";


type GifPickerProps = {
  onSelect: (url: string, title?: string) => void;
};

// Read API key from environment variables, fallback to empty to avoid crashing (but it will fail API calls)
const GIPHY_API_KEY = envConfig.VITE_GIPHY_API_KEY || "";

export function GifPicker({ onSelect }: GifPickerProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [gifs, setGifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchGifs = async (searchTerm: string) => {
    setLoading(true);
    try {
      const endpoint = searchTerm.trim()
        ? `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(searchTerm)}&limit=20`
        : `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=20`;

      const res = await fetch(endpoint);
      const data = await res.json();
      setGifs(data.data || []);
    } catch (e) {
      console.error(t("chat.errorLoadingGif"), e);
    } finally {
      setLoading(false);
    }
  };

  // Initial load (trending)
  useEffect(() => {
    fetchGifs("");
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchGifs(query);
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <div className="w-75 sm:w-87.5 p-2 bg-background border rounded-lg shadow-xl flex flex-col gap-2 max-h-100">
      <Input
        placeholder={t("chat.searchGif")}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="h-9 focus-visible:ring-1"
        autoFocus
      />
      
      <div className="flex-1 overflow-y-auto min-h-62.5 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        
        <div className="columns-2 gap-2 space-y-2 p-1">
          {gifs.map((gif) => (
            <img
              key={gif.id}
              src={gif.images.fixed_width.url}
              alt={gif.title}
              title={gif.title}
              className="w-full rounded-md cursor-pointer hover:ring-2 hover:ring-primary transition-all object-cover"
              onClick={() => {
                onSelect(gif.images.original.url, gif.title || "GIF");
                setQuery("");
              }}
            />
          ))}
        </div>
        
        {!loading && gifs.length === 0 && (
          <div className="text-center text-sm text-muted-foreground mt-10">
            {t("chat.noGifsFound")}
          </div>
        )}
      </div>
      <div className="text-[10px] text-center text-muted-foreground/50 font-medium tracking-widest pt-1 border-t">
        POWERED BY GIPHY
      </div>
    </div>
  );
}
