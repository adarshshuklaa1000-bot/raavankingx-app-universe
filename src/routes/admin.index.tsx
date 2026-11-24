import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppWindow, Bell, Crown, Eye, Image, Megaphone, Plus, Rocket, ShieldAlert, Users, Wrench } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageTitle } from "@/admin/AdminShell";
import { adminHead } from "@/admin/head";
import { Button } from "@/components/ui/button";
import { activeAnnouncements, announcementsQuery, appsQuery, bannersQuery, upcomingQuery, useConfig } from "@/services/content";

export const Route = createFileRoute("/admin/")({
  head: () => adminHead("Dashboard"),
  component: Dashboard,
});

const DAY = 86_400_000;

async function countVisits(sinceMs?: number) {
  let q = supabase.from("visits").select("session_id", { count: "exact", head: true });
  if (sinceMs) q = q.gte("last_seen", new Date(Date.now() - sinceMs).toISOString());
  const { count, error } = await q;
  if (error) throw error;
  return count ?? 0;
}

function Dashboard() {
  const apps = useQuery(appsQuery);
  const upcoming = useQuery(upcomingQuery);
  const banners = useQuery(bannersQuery);
  const notices = useQuery(announcementsQuery);
  const { data: config } = useConfig();
  const visits = useQuery({
    queryKey: ["admin-visits"],
    refetchInterval: 60_000,
    queryFn: async () => {
      const [total, today, week] = await Promise.all([countVisits(), countVisits(DAY), countVisits(7 * DAY)]);
      return { total, today, week };
    },
  });
  const failedLogins = useQuery({
    queryKey: ["admin-failed-logins"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("login_attempts")
        .select("id", { count: "exact", head: true })
        .eq("success", false)
        .gte("created_at", new Date(Date.now() - 7 * DAY).toISOString());
      if (error) throw error;
      return count ?? 0;
    },
  });
  const recent = useQuery({
    queryKey: ["admin_logs", "recent"],
    queryFn: async () => {
      const { data, error } = await supabase.from("admin_logs").select("*").order("created_at", { ascending: false }).limit(6);
      if (error) throw error;
      return data;
    },
  });

  const a = apps.data ?? [];
  const live = a.filter((x) => x.is_published);
  const stats = [
    { label: "Live apps", value: live.length, sub: `${a.length - live.length} hidden`, icon: AppWindow, to: "/admin/apps" },
    { label: "VIP apps", value: a.filter((x) => x.is_vip).length, sub: `${a.filter((x) => x.kind === "website").length} websites`, icon: Crown, to: "/admin/apps" },
    { label: "Upcoming", value: upcoming.data?.length ?? 0, sub: `${(upcoming.data ?? []).reduce((s, u) => s + u.notify_count, 0)} notify taps`, icon: Rocket, to: "/admin/upcoming" },
    { label: "Banners", value: (banners.data ?? []).filter((b) => b.is_published).length, sub: "visible", icon: Image, to: "/admin/banners" },
    { label: "Notices", value: activeAnnouncements(notices.data ?? []).length, sub: "showing now", icon: Megaphone, to: "/admin/notices" },
    { label: "Visitors today", value: visits.data?.today ?? 0, sub: `${visits.data?.week ?? 0} this week`, icon: Eye, to: "/admin" },
    { label: "All-time visitors", value: visits.data?.total ?? 0, sub: "browser sessions", icon: Users, to: "/admin" },
    { label: "Blocked logins", value: failedLogins.data ?? 0, sub: "last 7 days", icon: ShieldAlert, to: "/admin/logs" },
  ] as const;

  return (
    <>
      <PageTitle title="Dashboard">
        <div className="flex flex-wrap gap-2">
          <Button variant="neon" size="sm" asChild>
            <Link to="/admin/apps"><Plus /> App</Link>
          </Button>
          <Button variant="neon" size="sm" asChild>
            <Link to="/admin/banners"><Plus /> Banner</Link>
          </Button>
          <Button variant="neon" size="sm" asChild>
            <Link to="/admin/notices"><Bell /> Notice</Link>
          </Button>
        </div>
      </PageTitle>

      {config?.maintenance_enabled && (
        <Link to="/admin/settings" className="mb-4 flex items-center gap-3 rounded-2xl border border-vip/60 bg-vip/10 p-3 text-sm">
          <Wrench className="size-5 text-vip" />
          <span><b>Maintenance mode is ON.</b> Visitors see the maintenance screen. Tap to change.</span>
        </Link>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className="rounded-2xl border border-border bg-secondary/60 p-4 transition-colors hover:bg-accent">
            <s.icon className="size-5 text-neon" />
            <p className="mt-2 font-display text-3xl font-black">{s.value}</p>
            <p className="font-display text-xs font-bold tracking-wider">{s.label.toUpperCase()}</p>
            <p className="text-[11px] text-muted-foreground">{s.sub}</p>
          </Link>
        ))}
      </div>

      <section className="mt-6 rounded-2xl border border-border bg-secondary/60 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-sm font-black tracking-[0.2em] text-neon">RECENT ACTIVITY</h2>
          <Link to="/admin/logs" className="text-xs text-muted-foreground hover:text-foreground">See all →</Link>
        </div>
        {recent.data?.length ? (
          <ul className="divide-y divide-border">
            {recent.data.map((l) => (
              <li key={l.id} className="flex items-baseline justify-between gap-3 py-2 text-sm">
                <span className="min-w-0 truncate">
                  <b className="font-mono text-xs uppercase text-vip">{l.action}</b> {l.target}
                </span>
                <time className="shrink-0 text-[11px] text-muted-foreground">{new Date(l.created_at).toLocaleString()}</time>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{recent.isLoading ? "Loading…" : "No changes yet."}</p>
        )}
      </section>
    </>
  );
}
