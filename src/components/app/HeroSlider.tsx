import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import type { Banner } from "@/services/types";
import { useOpenApp } from "@/webview/use-open-app";
import { Button } from "@/components/ui/button";
import { SmartImage } from "./SmartImage";

export function HeroSlider({ banners, intervalMs }: { banners: Banner[]; intervalMs: number }) {
  const [emblaRef, embla] = useEmblaCarousel({ loop: banners.length > 1 });
  const [index, setIndex] = useState(0);
  const openApp = useOpenApp();

  useEffect(() => {
    if (!embla) return;
    const onSelect = () => setIndex(embla.selectedScrollSnap());
    embla.on("select", onSelect);
    embla.on("reInit", onSelect);
    return () => {
      embla.off("select", onSelect);
      embla.off("reInit", onSelect);
    };
  }, [embla]);

  useEffect(() => {
    if (!embla || banners.length < 2) return;
    const id = window.setInterval(() => embla.scrollNext(), Math.max(2000, intervalMs));
    return () => window.clearInterval(id);
  }, [embla, banners.length, intervalMs]);

  const go = useCallback(
    (b: Banner) => {
      if (b.action_url) openApp({ url: b.action_url, title: b.title || "RaavanKingX" });
    },
    [openApp],
  );

  if (banners.length === 0) return null;

  return (
    <section aria-label="Featured" className="mx-auto max-w-6xl px-4 pt-4">
      <div className="overflow-hidden rounded-3xl neon-border" ref={emblaRef}>
        <div className="flex">
          {banners.map((b, i) => (
            <div key={b.id} className="relative min-w-0 flex-[0_0_100%]">
              <button
                type="button"
                onClick={() => go(b)}
                disabled={!b.action_url}
                className="block w-full text-left disabled:cursor-default"
                aria-label={b.title ?? "Banner"}
              >
                <SmartImage
                  src={b.image_url}
                  alt={b.title ?? ""}
                  eager={i === 0}
                  fallback="/images/banner-default.webp"
                  className="aspect-[16/8] w-full md:aspect-[16/6]"
                />
              </button>
              {(b.title || b.subtitle || b.action_label) && (
                <div className="pointer-events-none absolute inset-0 flex flex-col justify-center gap-2 bg-gradient-to-r from-background/90 via-background/40 to-transparent p-5 md:p-10">
                  {b.title && (
                    <h2 className="max-w-[70%] font-display text-xl font-black leading-tight tracking-wide text-foreground text-glow md:text-4xl">
                      {b.title}
                    </h2>
                  )}
                  {b.subtitle && (
                    <p className="font-display text-sm font-bold tracking-[0.25em] text-vip md:text-lg">
                      {b.subtitle}
                    </p>
                  )}
                  {b.action_label && b.action_url && (
                    <Button
                      variant="vip"
                      size="sm"
                      className="pointer-events-auto mt-1 w-fit"
                      onClick={() => go(b)}
                    >
                      {b.action_label}
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {banners.length > 1 && (
        <div className="mt-3 flex justify-center gap-2">
          {banners.map((b, i) => (
            <button
              key={b.id}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => embla?.scrollTo(i)}
              className={
                i === index
                  ? "h-2 w-6 rounded-full bg-neon transition-all"
                  : "h-2 w-2 rounded-full bg-muted-foreground/40 transition-all"
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
