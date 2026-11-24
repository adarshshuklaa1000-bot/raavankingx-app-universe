import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, RefreshCw, Search, XCircle } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageTitle } from "@/admin/AdminShell";
import { adminHead } from "@/admin/head";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/admin/logs")({
  head: () => adminHead("Activity Log"),
  component: LogsAdmin,
});

const fmt = (iso: string) => new Date(iso).toLocaleString();

function LogsAdmin() {
  const [q, setQ] = useState("");
  const logs = useQuery({
    queryKey: ["admin_logs", "all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("admin_logs").select("*").order("created_at", { ascending: false }).limit(300);
      if (error) throw error;
      return data;
    },
  });
  const logins = useQuery({
    queryKey: ["login_attempts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("login_attempts").select("*").order("created_at", { ascending: false }).limit(300);
      if (error) throw error;
      return data;
    },
  });
  const s = q.trim().toLowerCase();
  const shownLogs = (logs.data ?? []).filter((l) => !s || `${l.action} ${l.target} ${l.details} ${l.admin_email}`.toLowerCase().includes(s));
  const shownLogins = (logins.data ?? []).filter((l) => !s || (l.email ?? "").toLowerCase().includes(s));

  return (
    <>
      <PageTitle title="Activity Log">
        <Button variant="neon" size="sm" onClick={() => { void logs.refetch(); void logins.refetch(); }}>
          <RefreshCw className={logs.isFetching || logins.isFetching ? "animate-spin" : ""} /> Refresh
        </Button>
      </PageTitle>
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search activity or email" className="pl-9" aria-label="Search log" />
      </div>
      <Tabs defaultValue="changes">
        <TabsList>
          <TabsTrigger value="changes">Changes ({shownLogs.length})</TabsTrigger>
          <TabsTrigger value="logins">Logins ({shownLogins.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="changes">
          <ul className="space-y-2">
            {shownLogs.map((l) => (
              <li key={l.id} className="rounded-xl border border-border bg-secondary/60 px-3 py-2.5">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="min-w-0 text-sm">
                    <b className="font-mono text-xs uppercase text-vip">{l.action}</b> <span className="break-words">{l.target}</span>
                  </p>
                  <time className="shrink-0 text-[11px] text-muted-foreground">{fmt(l.created_at)}</time>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {l.admin_email}
                  {l.details ? ` · ${l.details}` : ""}
                </p>
              </li>
            ))}
            {!logs.isLoading && shownLogs.length === 0 && <Empty text="No changes recorded yet." />}
          </ul>
        </TabsContent>
        <TabsContent value="logins">
          <ul className="space-y-2">
            {shownLogins.map((l) => (
              <li key={l.id} className="flex items-center gap-3 rounded-xl border border-border bg-secondary/60 px-3 py-2.5">
                {l.success ? <CheckCircle2 className="size-5 shrink-0 text-live" /> : <XCircle className="size-5 shrink-0 text-destructive" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{l.email ?? "Unknown account"}</p>
                  <p className="text-[11px] text-muted-foreground">{l.success ? "Admin signed in" : "Blocked — not an admin"}</p>
                </div>
                <time className="shrink-0 text-[11px] text-muted-foreground">{fmt(l.created_at)}</time>
              </li>
            ))}
            {!logins.isLoading && shownLogins.length === 0 && <Empty text="No sign-ins recorded yet." />}
          </ul>
        </TabsContent>
      </Tabs>
    </>
  );
}

function Empty({ text }: { text: string }) {
  return <li className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">{text}</li>;
}
