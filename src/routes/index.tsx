import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Header } from "@/components/app/Header";
import { SearchBar } from "@/components/app/SearchBar";
import { HeroSlider } from "@/components/app/HeroSlider";
import { TelegramStrip } from "@/components/app/TelegramStrip";
import { Announcements } from "@/components/app/Announcements";
import { AppCard, AppCardSkeleton } from "@/components/app/AppCard";
import { PublicShell } from "@/components/app/PublicShell";
import { EmptyState } from "@/components/app/EmptyState";
import { Button } from "@/components/ui/button";
import {
  activeAnnouncements,
  announcementsQuery,
  appsQuery,
  bannersQuery,
  categoriesQuery,
  useConfig,
} from "@/services/content";
import { popLaunched } from "@/services/watchlist";
import { cn } from "@/lib/utils";

const PAGE = 20;

export const Route = createFileRoute("/")({
  validateSearch: (s: Record<string, unknown>): { q?: string; cat?: string } => ({
    q: typeof s.q === "string" && s.q ? s.q.slice(0, 80) : undefined,
    cat: typeof s.cat === "string" && s.cat ? s.cat : undefined,
  }),
  head: () => ({
    meta: [
      { title: "RaavanKingX — All Your Apps In One Place" },
      {
        name: "description",
        content: "Open study platforms, web apps and online tools right inside the RaavanKingX app universe.",
      },
      { property: "og:title", content: "RaavanKingX — All Your Apps In One Place" },
      {
        property: "og:description",
        content: "Open study platforms, web apps and online tools right inside the RaavanKingX app universe.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { q = "", cat } = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  const [query, setQuery] = useState(q);
  const [limit, setLimit] = useState(PAGE);

  const { data: config } = useConfig();
  const apps = useQuery(appsQuery);
  const banners = useQuery(bannersQuery);
  const categories = useQuery(categoriesQuery);
  const notices = useQuery(announcementsQuery);

  useEffect(() => setQuery(q), [q]);
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (query !== q) navigate({ search: (prev) => ({ ...prev, q: query || undefined }), replace: true });
    }, 250);
    return () => window.clearTimeout(t);
  }, [query, q, navigate]);
  useEffect(() => setLimit(PAGE), [q, cat]);

  const liveApps = useMemo(() => (apps.data ?? []).filter((a) => a.is_published), [apps.data]);
  const cats = useMemo(() => (categories.data ?? []).filter((c) => c.is_published), [categories.data]);
  const catName = useMemo(() => new Map(cats.map((c) => [c.id, c.name])), [cats]);

  useEffect(() => {
    if (!liveApps.length) return;
    for (const name of popLaunched(liveApps.map((a) => a.name))) {
      toast.success(`${name} is now live!`, { description: "You asked to be notified — open it from the directory." });
    }
  }, [liveApps]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return liveApps
      .filter((a) => !cat || a.category_id === cat)
      .filter((a) => {
        if (!term) return true;
        const c = a.category_id ? (catName.get(a.category_id) ?? "") : "";
        return `${a.name} ${a.description} ${c} ${a.website_url}`.toLowerCase().includes(term);
      })
      .sort((a, b) => Number(b.is_featured) - Number(a.is_featured));
  }, [liveApps, query, cat, catName]);

  const usedCats = cats.filter((c) => liveApps.some((a) => a.category_id === c.id));
  const visibleBanners = (banners.data ?? []).filter((b) => b.is_published);
  const searching = query.trim().length > 0;

  return (
    <PublicShell>
      <Header>
        <SearchBar value={query} onChange={setQuery} />
      </Header>

      <main>
        {!searching && config?.banner_enabled !== false && (
          <HeroSlider banners={visibleBanners} intervalMs={config?.banner_interval_ms ?? 4500} />
        )}
        {!searching && config && <TelegramStrip config={config} />}
        {!searching && <Announcements items={activeAnnouncements(notices.data ?? [])} />}

        <section className="mx-auto max-w-6xl px-4 pt-6" aria-label="App directory">
          <div className="mb-3 flex items-end justify-between">
            <h1 className="font-display text-lg font-black tracking-[0.2em] text-foreground">
              {searching ? "RESULTS" : "ALL APPS"}
            </h1>
            <span className="font-mono text-xs text-muted-foreground">{filtered.length} apps</span>
          </div>

          {usedCats.length > 0 && (
            <div className="no-scrollbar -mx-4 mb-2 flex gap-2 overflow-x-auto px-4 pb-1">
              <CatChip active={!cat} onClick={() => navigate({ search: (p) => ({ ...p, cat: undefined }) })}>
                All
              </CatChip>
              {usedCats.map((c) => (
                <CatChip
                  key={c.id}
                  active={cat === c.id}
                  onClick={() => navigate({ search: (p) => ({ ...p, cat: c.id }) })}
                >
                  <span aria-hidden>{c.icon}</span> {c.name}
                </CatChip>
              ))}
            </div>
          )}

          {apps.isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {Array.from({ length: 6 }, (_, i) => (
                <AppCardSkeleton key={i} />
              ))}
            </div>
          ) : apps.isError ? (
            <EmptyState title="Couldn't load apps" body="Check your internet connection and try again." />
          ) : filtered.length === 0 ? (
            <EmptyState
              title={searching ? "No apps match your search" : "No apps yet"}
              body={searching ? "Try another name or category." : "New apps arrive every week — check back soon."}
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {filtered.slice(0, limit).map((a) => (
                  <AppCard key={a.id} app={a} categoryName={a.category_id ? catName.get(a.category_id) : undefined} />
                ))}
              </div>
              {filtered.length > limit && (
                <div className="mt-5 flex justify-center">
                  <Button variant="neon" onClick={() => setLimit((l) => l + PAGE)}>
                    Load more apps
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </PublicShell>
  );
}

function CatChip({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-4 py-1.5 font-display text-xs font-bold tracking-wider transition-colors",
        active ? "border-neon bg-neon/15 text-neon" : "border-border bg-secondary/60 text-muted-foreground",
      )}
    >
      {children}
    </button>
  );
}
