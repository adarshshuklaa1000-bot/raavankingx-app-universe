import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Rocket } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Manager } from "@/admin/Manager";
import { PageTitle } from "@/admin/AdminShell";
import { adminHead } from "@/admin/head";
import { upcomingFields } from "@/admin/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { categoriesQuery, upcomingQuery } from "@/services/content";
import { UPCOMING_STATUS, type UpcomingApp } from "@/services/types";
import { isHttpsUrl, normalizeUrl } from "@/services/url";

export const Route = createFileRoute("/admin/upcoming")({
  head: () => adminHead("Upcoming Apps"),
  component: UpcomingAdmin,
});

const summary = (u: UpcomingApp) => ({
  title: u.name,
  subtitle: [UPCOMING_STATUS[u.status] ?? u.status, u.release_date, u.progress != null ? `${u.progress}%` : null]
    .filter(Boolean)
    .join(" · "),
  image: u.logo_url,
  badges: [`${u.notify_count} NOTIFY`],
});

function UpcomingAdmin() {
  const upcoming = useQuery(upcomingQuery);
  const [launching, setLaunching] = useState<UpcomingApp | null>(null);
  return (
    <>
      <PageTitle title="Upcoming Apps" />
      <Manager
        table="upcoming_apps"
        singular="Upcoming app"
        rows={upcoming.data ?? []}
        loading={upcoming.isLoading}
        fields={upcomingFields}
        defaults={{ status: "coming_soon", notify_enabled: true, is_published: true }}
        summary={summary}
        rowActions={(u) => (
          <Button variant="vip" size="sm" onClick={() => setLaunching(u)} aria-label={`Launch ${u.name}`}>
            <Rocket /> <span className="hidden sm:inline">Launch</span>
          </Button>
        )}
      />
      {launching && <LaunchDialog app={launching} onClose={() => setLaunching(null)} />}
    </>
  );
}

function LaunchDialog({ app, onClose }: { app: UpcomingApp; onClose: () => void }) {
  const queryClient = useQueryClient();
  const cats = useQuery(categoriesQuery);
  const [url, setUrl] = useState(app.website_url ?? "");
  const [cat, setCat] = useState("");
  const [busy, setBusy] = useState(false);
  const launch = async () => {
    const link = normalizeUrl(url);
    if (!isHttpsUrl(link)) {
      toast.error("Enter a secure https:// website link.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.rpc("launch_upcoming", {
      p_id: app.id,
      p_website_url: link,
      ...(cat ? { p_category_id: cat } : {}),
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`${app.name} is now live in Apps`);
    queryClient.invalidateQueries({ queryKey: ["apps"] });
    queryClient.invalidateQueries({ queryKey: ["upcoming_apps"] });
    onClose();
  };
  return (
    <Dialog open onOpenChange={(o) => !o && !busy && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display">Launch {app.name}</DialogTitle>
          <DialogDescription>Moves it from Upcoming to the live apps list with a NEW tag.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="launch-url">Website link</Label>
            <Input id="launch-url" inputMode="url" placeholder="https://" value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="launch-cat">Category</Label>
            <select id="launch-cat" value={cat} onChange={(e) => setCat(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="">— None —</option>
              {(cats.data ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant="vip" onClick={launch} disabled={busy}>
            <Rocket /> {busy ? "Launching…" : "Launch now"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
