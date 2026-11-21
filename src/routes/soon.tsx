import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BellRing, CalendarClock, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Header } from "@/components/app/Header";
import { PublicShell } from "@/components/app/PublicShell";
import { SmartImage } from "@/components/app/SmartImage";
import { EmptyState } from "@/components/app/EmptyState";
import { AppCardSkeleton } from "@/components/app/AppCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { upcomingQuery } from "@/services/content";
import { UPCOMING_STATUS, type UpcomingApp } from "@/services/types";
import { addWatch, readWatchlist } from "@/services/watchlist";
import { useOpenApp } from "@/webview/use-open-app";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/soon")({
  head: () => ({
    meta: [
      { title: "Coming Soon — RaavanKingX" },
      { name: "description", content: "Upcoming RaavanKingX apps, release dates and development status." },
      { property: "og:title", content: "Coming Soon — RaavanKingX" },
      { property: "og:description", content: "Upcoming RaavanKingX apps, release dates and development status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SoonPage,
});

const STATUS_STYLE: Record<string, string> = {
  coming_soon: "border-neon/60 text-neon",
  in_development: "border-primary/60 text-primary",
  testing: "border-gold/60 text-gold",
  launching_soon: "border-vip/70 text-vip",
};

function SoonPage() {
  const upcoming = useQuery(upcomingQuery);
  const list = (upcoming.data ?? []).filter((u) => u.is_published);

  return (
    <PublicShell>
      <Header />
      <main className="mx-auto max-w-6xl px-4 pt-6">
        <h1 className="font-display text-2xl font-black tracking-[0.2em] text-foreground text-glow">COMING SOON</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tap Notify Me and we'll tell you when an app goes live.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.isLoading ? (
            Array.from({ length: 3 }, (_, i) => <AppCardSkeleton key={i} />)
          ) : list.length === 0 ? (
            <div className="sm:col-span-2 lg:col-span-3">
              <EmptyState title="Nothing announced yet" body="New apps are on the way — check back soon." />
            </div>
          ) : (
            list.map((u) => <UpcomingCard key={u.id} app={u} />)
          )}
        </div>
      </main>
    </PublicShell>
  );
}

function UpcomingCard({ app }: { app: UpcomingApp }) {
  const [watching, setWatching] = useState(false);
  const [busy, setBusy] = useState(false);
  const openApp = useOpenApp();

  useEffect(() => setWatching(readWatchlist().some((w) => w.id === app.id)), [app.id]);

  const notify = async () => {
    setBusy(true);
    const { error } = await supabase.rpc("notify_upcoming", { p_id: app.id });
    setBusy(false);
    if (error) {
      toast.error("Couldn't save your request. Please try again.");
      return;
    }
    addWatch({ id: app.id, name: app.name });
    setWatching(true);
    toast.success(`We'll let you know when ${app.name} launches.`);
    if (app.notify_url) openApp({ url: app.notify_url, title: app.name });
  };

  const date = app.release_date
    ? new Date(`${app.release_date}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <article className="app-card flex gap-4 rounded-3xl p-4 animate-rise">
      <SmartImage src={app.logo_url} alt={`${app.name} logo`} className="size-16 shrink-0 rounded-2xl border border-app-card-border" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-display text-base font-extrabold text-foreground">{app.name}</h2>
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider",
              STATUS_STYLE[app.status] ?? "border-border text-muted-foreground",
            )}
          >
            {UPCOMING_STATUS[app.status] ?? app.status}
          </span>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{app.description}</p>
        {date && (
          <p className="mt-2 flex items-center gap-1.5 font-mono text-[11px] text-foreground/80">
            <CalendarClock className="size-3.5 text-neon" /> {date}
          </p>
        )}
        {app.progress != null && (
          <div className="mt-2" aria-label={`${app.progress}% complete`}>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-vip-gradient" style={{ width: `${app.progress}%` }} />
            </div>
            <p className="mt-1 font-mono text-[10px] text-muted-foreground">{app.progress}% complete</p>
          </div>
        )}
        {app.notify_enabled && (
          <Button variant={watching ? "neon" : "vip"} size="sm" className="mt-3" onClick={notify} disabled={busy || watching}>
            {watching ? <Check /> : <BellRing />}
            {watching ? "You'll be notified" : "Notify me"}
          </Button>
        )}
      </div>
    </article>
  );
}
