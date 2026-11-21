import type { AppItem } from "@/services/types";
import { useOpenApp } from "@/webview/use-open-app";
import { Button } from "@/components/ui/button";
import { SmartImage } from "./SmartImage";

export function AppCard({ app, categoryName }: { app: AppItem; categoryName?: string }) {
  const openApp = useOpenApp();
  const flag = app.is_new ? "NEW" : app.is_updated ? "UPDATED" : app.is_popular ? "POPULAR" : null;
  const open = () => openApp({ url: app.website_url, title: app.name, mode: app.webview_mode });

  return (
    <article className="relative pt-3 animate-rise">
      {app.is_vip && (
        <span className="absolute left-1/2 top-0 z-10 -translate-x-1/2 rounded-full bg-vip-gradient px-3 py-0.5 font-display text-[11px] font-black tracking-[0.2em] text-vip-foreground shadow-[var(--shadow-card)]">
          VIP
        </span>
      )}
      <div
        role="button"
        tabIndex={0}
        onClick={open}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && open()}
        className="app-card flex h-full cursor-pointer flex-col items-center rounded-3xl px-3 pb-3 pt-5 text-center transition-transform duration-200 hover:-translate-y-1 active:scale-[0.97]"
      >
        {flag && (
          <span className="absolute right-2 top-5 rounded-md bg-primary/90 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wider text-primary-foreground">
            {flag}
          </span>
        )}
        <SmartImage
          src={app.logo_url}
          alt={`${app.name} logo`}
          className="size-16 rounded-2xl border border-app-card-border/70 bg-background md:size-20"
        />
        <h3 className="mt-3 line-clamp-1 font-display text-base font-extrabold tracking-wide text-foreground">
          {app.name}
        </h3>
        {categoryName && (
          <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-vip">{categoryName}</span>
        )}
        <p className="mt-1 line-clamp-2 min-h-[2.5em] text-xs leading-snug text-muted-foreground">
          {app.description}
        </p>
        <Button
          variant="open"
          size="sm"
          className="mt-3 w-full text-[11px]"
          onClick={(e) => {
            e.stopPropagation();
            open();
          }}
        >
          Open this app
        </Button>
      </div>
    </article>
  );
}

export function AppCardSkeleton() {
  return (
    <div className="pt-3">
      <div className="flex h-56 flex-col items-center gap-3 rounded-3xl border border-border p-4">
        <div className="size-16 rounded-2xl skeleton-shimmer" />
        <div className="h-4 w-2/3 rounded skeleton-shimmer" />
        <div className="h-3 w-full rounded skeleton-shimmer" />
        <div className="mt-auto h-8 w-full rounded-full skeleton-shimmer" />
      </div>
    </div>
  );
}
