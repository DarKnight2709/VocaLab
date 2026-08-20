import React from "react";
import { ExternalLink } from "lucide-react";

const URL_REGEX = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s]|www\.[^\s<]+[^<.,:;"')\]\s])/gi;

interface FormattedFieldValueProps {
  text: string;
  className?: string;
  showIcon?: boolean;
}

function isUrl(str: string): boolean {
  return /^https?:\/\//i.test(str) || /^www\./i.test(str);
}

export function FormattedFieldValue({
  text,
  className = "",
  showIcon = true,
}: FormattedFieldValueProps) {
  if (!text) return null;

  const parts = text.split(URL_REGEX);

  if (parts.length === 1) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (isUrl(part)) {
          const href = part.toLowerCase().startsWith("www.") ? `https://${part}` : part;
          return (
            <a
              key={i}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              referrerPolicy="no-referrer"
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2 break-all inline-flex items-center gap-0.5 font-medium cursor-pointer transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <span>{part}</span>
              {showIcon && <ExternalLink className="inline h-3.5 w-3.5 ml-0.5 mb-0.5 shrink-0 opacity-80" />}
            </a>
          );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </span>
  );
}

export default FormattedFieldValue;
