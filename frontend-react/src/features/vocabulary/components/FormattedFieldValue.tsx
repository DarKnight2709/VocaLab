import React from "react";
import { ExternalLink } from "lucide-react";

const URL_REGEX = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s]|www\.[^\s<]+[^<.,:;"')\]\s]|data:image\/[a-zA-Z0-9+.-]+;base64,[a-zA-Z0-9+/=]+)/gi;
const MD_IMAGE_REGEX = /!\[([^\]]*)\]\((https?:\/\/[^\s)]+|data:image\/[^\s)]+)\)/gi;
const HTML_IMAGE_REGEX = /<img\s+[^>]*src=["']([^"']+)["'][^>]*\/?>/gi;
const IMAGE_EXTENSIONS = /\.(png|jpe?g|gif|svg|webp|avif|bmp|ico)(\?.*)?$/i;

interface FormattedFieldValueProps {
  text: string;
  className?: string;
  showIcon?: boolean;
  imageClassName?: string;
}

export function isImageUrl(str: string): boolean {
  if (!str || typeof str !== "string") return false;
  const trimmed = str.trim();
  if (trimmed.startsWith("data:image/")) return true;
  if (trimmed.startsWith("blob:")) return true;
  if (!/^https?:\/\//i.test(trimmed)) return false;

  try {
    const urlObj = new URL(trimmed);
    const pathname = urlObj.pathname.toLowerCase();
    if (IMAGE_EXTENSIONS.test(pathname) || IMAGE_EXTENSIONS.test(trimmed)) return true;
    if (
      trimmed.includes("res.cloudinary.com") ||
      trimmed.includes("s3.amazonaws.com") ||
      trimmed.includes("amazonaws.com") ||
      (trimmed.includes("raw.githubusercontent.com") && trimmed.includes("kanji")) ||
      trimmed.includes("wikimedia.org/wikipedia/commons")
    ) {
      if (!/\.(html?|pdf|json|txt|zip|mp3|mp4|webm)$/i.test(pathname)) {
        return true;
      }
    }
  } catch {
    return false;
  }
  return false;
}

function isUrl(str: string): boolean {
  if (!str) return false;
  const trimmed = str.trim();
  return (
    /^https?:\/\//i.test(trimmed) ||
    /^www\./i.test(trimmed) ||
    trimmed.startsWith("data:image/") ||
    trimmed.startsWith("blob:")
  );
}

function ImageRenderer({
  src,
  alt = "",
  className = "",
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={`max-h-40 sm:max-h-48 max-w-full w-auto h-auto object-contain rounded inline-block align-middle ${className}`}
      onClick={(e) => e.stopPropagation()}
    />
  );
}

function FormattedInlineText({
  text,
  showIcon = true,
  imageClassName = "",
}: {
  text: string;
  showIcon?: boolean;
  imageClassName?: string;
}) {
  const mdImages: { alt: string; src: string }[] = [];
  const processedMd = text.replace(MD_IMAGE_REGEX, (_, alt, src) => {
    const idx = mdImages.length;
    mdImages.push({ alt, src });
    return `__MD_IMG_${idx}__`;
  });

  const htmlImages: { src: string }[] = [];
  const processedHtml = processedMd.replace(HTML_IMAGE_REGEX, (_, src) => {
    const idx = htmlImages.length;
    htmlImages.push({ src });
    return `__HTML_IMG_${idx}__`;
  });

  const parts = processedHtml.split(URL_REGEX);

  return (
    <span>
      {parts.map((part, i) => {
        if (!part) return null;

        // Markdown image token
        const mdTokenMatch = part.match(/^__MD_IMG_(\d+)__$/);
        if (mdTokenMatch) {
          const imgData = mdImages[parseInt(mdTokenMatch[1], 10)];
          if (imgData) {
            return (
              <ImageRenderer
                key={i}
                src={imgData.src}
                alt={imgData.alt}
                className={imageClassName}
              />
            );
          }
        }

        // HTML image token
        const htmlTokenMatch = part.match(/^__HTML_IMG_(\d+)__$/);
        if (htmlTokenMatch) {
          const imgData = htmlImages[parseInt(htmlTokenMatch[1], 10)];
          if (imgData) {
            return (
              <ImageRenderer
                key={i}
                src={imgData.src}
                className={imageClassName}
              />
            );
          }
        }

        // Image URL or Data URL
        if (isImageUrl(part)) {
          return <ImageRenderer key={i} src={part.trim()} className={imageClassName} />;
        }

        // Web Link
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

export function FormattedFieldValue({
  text,
  className = "",
  showIcon = true,
  imageClassName = "",
}: FormattedFieldValueProps) {
  if (!text) return null;

  const lines = text.split("\n");
  const images: string[] = [];
  const otherLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (isImageUrl(trimmed)) {
      images.push(trimmed);
      continue;
    }

    const mdMatch = trimmed.match(/^!\[([^\]]*)\]\((https?:\/\/[^\s)]+|data:image\/[^\s)]+)\)$/i);
    if (mdMatch) {
      images.push(mdMatch[2]);
      continue;
    }

    const htmlMatch = trimmed.match(/^<img\s+[^>]*src=["']([^"']+)["'][^>]*\/?>$/i);
    if (htmlMatch) {
      images.push(htmlMatch[1]);
      continue;
    }

    // Space-separated images in one line
    const tokens = trimmed.split(/\s+/);
    if (tokens.length > 1 && tokens.every(isImageUrl)) {
      images.push(...tokens);
      continue;
    }

    otherLines.push(line);
  }

  // Pure images
  if (images.length > 0 && otherLines.length === 0) {
    return (
      <div className={`flex flex-wrap items-center gap-2 my-1 ${className}`}>
        {images.map((src, idx) => (
          <ImageRenderer key={idx} src={src} className={imageClassName} />
        ))}
      </div>
    );
  }

  // Mixed images and text lines
  return (
    <div className={className}>
      {images.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 my-1">
          {images.map((src, idx) => (
            <ImageRenderer key={idx} src={src} className={imageClassName} />
          ))}
        </div>
      )}
      {otherLines.map((line, idx) => (
        <div key={idx} className="whitespace-pre-line leading-snug">
          <FormattedInlineText text={line} showIcon={showIcon} imageClassName={imageClassName} />
        </div>
      ))}
    </div>
  );
}

export default FormattedFieldValue;
