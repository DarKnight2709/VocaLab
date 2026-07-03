import { useState, Fragment } from "react";
import ISO6391 from "iso-639-1";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/shared/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { useTranslation } from "@/shared/hooks/useTranslation";
import { Badge } from "@/shared/components/ui/badge";

const priorityCodes = ["en", "vi"];
const allCodes = ISO6391.getAllCodes();
const sortedCodes = [
  ...priorityCodes,
  ...allCodes.filter((code) => !priorityCodes.includes(code))
];

const ALL_LANGUAGES = sortedCodes.map((code) => ({
  value: code,
  label: `${ISO6391.getName(code)} (${ISO6391.getNativeName(code)})`,
}));

interface LanguagePickerProps {
  selected: string[];
  onChange: (selected: string[]) => void;
  maxDisplayed?: number;
}

export function LanguagePicker({ selected, onChange, maxDisplayed }: LanguagePickerProps) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  const handleSelect = (currentValue: string) => {
    if (selected.includes(currentValue)) {
      onChange(selected.filter((item) => item !== currentValue));
    } else {
      onChange([...selected, currentValue]);
    }
  };

  const removeLanguage = (langValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter((item) => item !== langValue));
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-10 px-3 py-2"
        >
          <div className="flex flex-wrap gap-1 items-center">
            {selected.length > 0 ? (
              <>
                {(maxDisplayed ? selected.slice(0, maxDisplayed) : selected).map((val) => {
                  const lang = ALL_LANGUAGES.find((l) => l.value === val);
                  return (
                    <Badge
                      variant="secondary"
                      key={val}
                      className="mr-1 mb-1 font-normal"
                      onClick={(e) => removeLanguage(val, e)}
                    >
                      {lang?.label || val}
                      <span className="ml-1 text-muted-foreground hover:text-foreground cursor-pointer">
                        ×
                      </span>
                    </Badge>
                  );
                })}
                {maxDisplayed && selected.length > maxDisplayed && (
                  <Badge variant="secondary" className="mr-1 mb-1 font-normal">
                    +{selected.length - maxDisplayed}
                  </Badge>
                )}
              </>
            ) : (
              <span className="text-muted-foreground font-normal">
                {t("chat.selectLanguages") || "Select languages..."}
              </span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder={t("chat.searchLanguage") || "Search language..."} />
          <CommandList className="max-h-64 overflow-y-auto">
            <CommandEmpty>No language found.</CommandEmpty>
            <CommandGroup>
              {ALL_LANGUAGES.map((lang, index) => (
                <Fragment key={lang.value}>
                  <CommandItem
                    value={lang.value}
                    onSelect={() => handleSelect(lang.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selected.includes(lang.value)
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    {lang.label}
                  </CommandItem>
                  {index === 1 && <CommandSeparator />}
                </Fragment>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
