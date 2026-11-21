import { useState } from "react";
import { DEFAULT_LOGO } from "@/services/content";
import { isSafeImageUrl } from "@/services/url";
import { cn } from "@/lib/utils";

/** Lazy, async-decoded image that falls back to the RaavanKingX logo when a link breaks. */
export function SmartImage({
  src,
  alt,
  className,
  eager = false,
  fallback = DEFAULT_LOGO,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  eager?: boolean;
  fallback?: string;
}) {
  const [failed, setFailed] = useState(false);
  const url = !failed && isSafeImageUrl(src) ? (src as string) : fallback;
  return (
    <img
      src={url}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
    />
  );
}
