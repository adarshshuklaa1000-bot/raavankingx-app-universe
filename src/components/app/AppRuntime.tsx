import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useRouter } from "@tanstack/react-router";
import { Wrench } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_LOGO, useConfig } from "@/services/content";
import { LIVE_TABLES } from "@/services/types";
import { SmartImage } from "./SmartImage";

const HEX = /^#[0-9a-f]{6}$/i;

/** One realtime channel for every content table: admin changes appear instantly everywhere. */
function useLiveSync() {
  const queryClient = useQueryClient();
  useEffect(() => {
    let channel = supabase.channel(`live-content-${Math.random().toString(36).slice(2)}`);
    for (const table of LIVE_TABLES) {
      channel = channel.on("postgres_changes", { event: "*", schema: "public", table }, () => {
        queryClient.invalidateQueries({ queryKey: [table] });
      });
    }
    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

function useAuthRefresh() {
  const router = useRouter();
  const queryClient = useQueryClient();
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      queryClient.invalidateQueries();
    });
    return () => data.subscription.unsubscribe();
  }, [router, queryClient]);
}

/** Anonymous visit counting: one id per browser tab session, a heartbeat while visible. */
function useVisitTracking() {
  useEffect(() => {
    let id = sessionStorage.getItem("rkx-session");
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem("rkx-session", id);
    }
    const sid = id;
    const ping = () => {
      if (document.visibilityState === "visible") supabase.rpc("track_visit", { p_session: sid }).then(() => {});
    };
    ping();
    const t = window.setInterval(ping, 120_000);
    return () => window.clearInterval(t);
  }, []);
}

function useHashAdmin() {
  useEffect(() => {
    if (window.location.hash.startsWith("#/admin")) window.location.replace("/admin");
  }, []);
}

function useThemeOverrides(primary?: string | null, vip?: string | null) {
  useEffect(() => {
    const root = document.documentElement.style;
    if (primary && HEX.test(primary)) root.setProperty("--primary", primary);
    else root.removeProperty("--primary");
    if (vip && HEX.test(vip)) root.setProperty("--vip", vip);
    else root.removeProperty("--vip");
  }, [primary, vip]);
}

export function AppRuntime({ children }: { children: React.ReactNode }) {
  const { data: config } = useConfig();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const { data: viewerIsAdmin } = useQuery({
    queryKey: ["viewer-is-admin"],
    queryFn: async () => (await supabase.rpc("is_admin")).data === true,
    staleTime: 5 * 60_000,
  });

  useLiveSync();
  useAuthRefresh();
  useVisitTracking();
  useHashAdmin();
  useThemeOverrides(config?.theme_primary, config?.theme_vip);

  const maintenance = config?.maintenance_enabled && !isAdmin && !viewerIsAdmin;

  return (
    <>
      {maintenance ? <Maintenance message={config.maintenance_message} logo={config.app_logo} /> : children}
      {!isAdmin && <Splash enabled={config?.splash_enabled ?? true} image={config?.splash_image || config?.app_logo} />}
    </>
  );
}

function Maintenance({ message, logo }: { message: string; logo: string | null }) {
  return (
    <main className="grid min-h-dvh place-items-center p-6 text-center">
      <div className="max-w-sm">
        <SmartImage src={logo || DEFAULT_LOGO} alt="" eager className="mx-auto size-20 rounded-2xl neon-border" />
        <Wrench className="mx-auto mt-6 size-6 text-vip" />
        <h1 className="mt-2 font-display text-xl font-black tracking-widest">UNDER MAINTENANCE</h1>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      </div>
    </main>
  );
}

function Splash({ enabled, image }: { enabled: boolean; image: string | null | undefined }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (sessionStorage.getItem("rkx-splash") || !enabled) {
      setVisible(false);
      return;
    }
    sessionStorage.setItem("rkx-splash", "1");
    const t = window.setTimeout(() => setVisible(false), 900);
    return () => window.clearTimeout(t);
  }, [enabled]);
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-background animate-out fade-out fill-mode-forwards delay-700 duration-300" aria-hidden>
      <div className="text-center">
        <SmartImage src={image || DEFAULT_LOGO} alt="" eager className="mx-auto size-28 rounded-3xl neon-border" />
        <p className="mt-4 font-display text-2xl font-black tracking-[0.3em] text-glow">RAAVANKINGX</p>
        <p className="mt-1 font-mono text-[10px] tracking-[0.3em] text-muted-foreground">ALL YOUR APPS IN ONE PLACE</p>
      </div>
    </div>
  );
}
