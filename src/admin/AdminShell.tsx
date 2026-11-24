import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  AppWindow,
  ExternalLink,
  Image,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Rocket,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Tags,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { SmartImage } from "@/components/app/SmartImage";
import { DEFAULT_LOGO, useConfig } from "@/services/content";
import { useAuthUser } from "./useAdmin";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/apps", label: "Apps & Websites", icon: AppWindow },
  { to: "/admin/upcoming", label: "Upcoming", icon: Rocket },
  { to: "/admin/banners", label: "Banners", icon: Image },
  { to: "/admin/notices", label: "Notices", icon: Megaphone },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/settings", label: "Settings", icon: Settings },
  { to: "/admin/owner", label: "Owner Profile", icon: UserRound },
  { to: "/admin/logs", label: "Activity Log", icon: Activity },
] as const;

/**
 * Admin access: signed in with Google AND holding the admin role in the protected roles table.
 * The first check of each browser session is recorded in the login history.
 */
function useAdminAccess(userId: string | undefined) {
  return useQuery({
    queryKey: ["admin-access", userId],
    enabled: !!userId,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const key = `rkx-admin-login-${userId}`;
      if (!sessionStorage.getItem(key)) {
        const { data, error } = await supabase.rpc("record_admin_login");
        if (error) throw error;
        sessionStorage.setItem(key, "1");
        return data === true;
      }
      const { data, error } = await supabase.rpc("is_admin");
      if (error) throw error;
      return data === true;
    },
  });
}

export function AdminShell() {
  const user = useAuthUser();
  const access = useAdminAccess(user.data?.id);

  if (user.isLoading || (user.data && access.isLoading)) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <div className="size-10 animate-spin rounded-full border-2 border-neon border-t-transparent" aria-label="Loading" />
      </div>
    );
  }
  if (!user.data) return <AdminLogin />;
  if (access.isError || !access.data) return <AccessDenied email={user.data.email ?? ""} />;
  return <AdminLayout email={user.data.email ?? ""} />;
}

function useSignOut() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    for (const k of Object.keys(sessionStorage)) if (k.startsWith("rkx-admin-login-")) sessionStorage.removeItem(k);
    navigate({ to: "/admin", replace: true });
  };
}

function Brand() {
  const { data: config } = useConfig();
  return (
    <div className="flex items-center gap-2.5">
      <SmartImage src={config?.app_logo || DEFAULT_LOGO} alt="" eager className="size-9 rounded-xl neon-border" />
      <div className="leading-tight">
        <p className="font-display text-base font-extrabold tracking-wider text-glow">{config?.app_name ?? "RAAVANKINGX"}</p>
        <p className="font-mono text-[10px] font-bold tracking-[0.3em] text-vip">ADMIN PANEL</p>
      </div>
    </div>
  );
}

const GOOGLE_G = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
    <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" />
  </svg>
);

function AdminLogin() {
  const [busy, setBusy] = useState(false);
  const signIn = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/admin`,
      extraParams: { prompt: "select_account" },
    });
    if (result.error) {
      toast.error(result.error.message || "Google sign-in failed");
      setBusy(false);
    }
    // On success the session listener refreshes the page state.
  };
  return (
    <main className="grid min-h-dvh place-items-center p-6">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-secondary/70 p-7 text-center shadow-[var(--shadow-neon)]">
        <div className="flex justify-center">
          <Brand />
        </div>
        <ShieldCheck className="mx-auto mt-7 size-10 text-neon" />
        <h1 className="mt-3 font-display text-xl font-black tracking-widest">SECURE LOGIN</h1>
        <p className="mt-2 text-sm text-muted-foreground">Only the RaavanKingX owner Google accounts can open this panel.</p>
        <button
          type="button"
          onClick={signIn}
          disabled={busy}
          className="btn-google-dark mt-6 inline-flex h-10 w-full items-center justify-center rounded-full transition-opacity disabled:opacity-60"
        >
          {GOOGLE_G}
          <span>{busy ? "Opening Google…" : "Sign in with Google"}</span>
        </button>
        <Link to="/" className="mt-5 inline-block text-xs text-muted-foreground underline-offset-4 hover:underline">
          ← Back to the app
        </Link>
      </div>
    </main>
  );
}

function AccessDenied({ email }: { email: string }) {
  const signOut = useSignOut();
  return (
    <main className="grid min-h-dvh place-items-center p-6 text-center">
      <div className="max-w-sm">
        <ShieldAlert className="mx-auto size-12 text-destructive" />
        <h1 className="mt-3 font-display text-xl font-black tracking-widest">ACCESS DENIED</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{email}</span> is not an admin account. This attempt has been recorded.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button variant="neon" onClick={signOut}>
            <LogOut /> Use another account
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/">Back to app</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

function AdminLayout({ email }: { email: string }) {
  const signOut = useSignOut();
  const navCls =
    "flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground";
  const activeCls = "bg-accent text-foreground shadow-[var(--shadow-neon)]";
  return (
    <div className="min-h-dvh lg:flex">
      <aside className="sticky top-0 z-40 border-b border-border bg-sidebar/95 backdrop-blur lg:h-dvh lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-2 px-4 py-3 pt-safe lg:py-5">
          <Brand />
          <div className="flex items-center gap-1 lg:hidden">
            <Button variant="ghost" size="icon" asChild aria-label="Open the app">
              <Link to="/">
                <ExternalLink />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
              <LogOut />
            </Button>
          </div>
        </div>
        <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: "exact" in n }}
              className={navCls}
              activeProps={{ className: activeCls }}
            >
              <n.icon className="size-4" />
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden space-y-2 border-t border-border p-4 lg:absolute lg:inset-x-0 lg:bottom-0 lg:block">
          <p className="truncate text-xs text-muted-foreground" title={email}>
            {email}
          </p>
          <div className="flex gap-2">
            <Button variant="neon" size="sm" asChild className="flex-1">
              <Link to="/">
                <ExternalLink /> View app
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut /> Sign out
            </Button>
          </div>
        </div>
      </aside>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-5 lg:px-8 lg:py-8">
        <Outlet />
      </main>
    </div>
  );
}

export function PageTitle({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
      <h1 className="font-display text-2xl font-black tracking-wider">{title}</h1>
      {children}
    </div>
  );
}
