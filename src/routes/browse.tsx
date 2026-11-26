import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ArrowRight, ExternalLink, Home, RotateCw, ShieldAlert, WifiOff, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { checkUrl } from "@/services/url-check.functions";
import { hostOf, isHttpsUrl } from "@/services/url";
import { useConfig } from "@/services/content";
import { hasNativeWebView, RaavanWebView } from "@/webview/native";

type BrowseSearch = { url: string; title?: string | undefined; mode?: "restricted" | undefined };

export const Route = createFileRoute("/browse")({
  validateSearch: (s: Record<string, unknown>): BrowseSearch => ({
    url: typeof s["url"] === "string" ? s["url"] : "",
    title: typeof s["title"] === "string" ? s["title"].slice(0, 80) : undefined,
    mode: s["mode"] === "restricted" ? "restricted" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "In-app browser — RaavanKingX" },
      { name: "description", content: "Websites opened inside RaavanKingX." },
      { property: "og:title", content: "In-app browser — RaavanKingX" },
      { property: "og:description", content: "Websites opened inside RaavanKingX." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BrowsePage,
});

function BrowsePage() {
  const { url, title, mode } = Route.useSearch();
  const navigate = useNavigate();
  const router = useRouter();
  const check = useServerFn(checkUrl);
  const { data: config } = useConfig();
  const valid = isHttpsUrl(url);
  const [forced, setForced] = useState(false);
  const [frameKey, setFrameKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [slow, setSlow] = useState(false);
  const [depth, setDepth] = useState(0);
  const [ahead, setAhead] = useState(0);
  const pending = useRef<"back" | "forward" | null>(null);
  const [native, setNative] = useState(false);

  useEffect(() => setNative(hasNativeWebView()), []);

  const status = useQuery({
    queryKey: ["embed-check", url],
    queryFn: () => check({ data: { url } }),
    enabled: valid,
    staleTime: 30 * 60_000,
    retry: false,
  });

  const close = () => {
    if (window.history.length > 1 && depth === 0) router.history.back();
    else navigate({ to: "/" });
  };

  useEffect(() => {
    if (!loading) return;
    setSlow(false);
    const t = window.setTimeout(() => setSlow(true), 15000);
    return () => window.clearTimeout(t);
  }, [loading, frameKey]);

  const onFrameLoad = () => {
    setLoading(false);
    if (pending.current === "back") {
      setDepth((d) => Math.max(0, d - 1));
      setAhead((a) => a + 1);
    } else if (pending.current === "forward") {
      setDepth((d) => d + 1);
      setAhead((a) => Math.max(0, a - 1));
    } else {
      setDepth((d) => d + 1);
      setAhead(0);
    }
    pending.current = null;
  };

  const reset = () => {
    setLoading(true);
    setDepth(0);
    setAhead(0);
    setFrameKey((k) => k + 1);
  };

  const openNative = () =>
    RaavanWebView.open({ url, title: title ?? hostOf(url) ?? "", allowedDomains: config?.allowed_domains ?? [] });

  const name = title || hostOf(url) || "Website";
  const blocked = status.data && (!status.data.embeddable || !status.data.reachable);
  const showFrame = valid && (forced || (mode !== "restricted" && status.data && !blocked));

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="bg-header-glow pt-safe">
        <div className="flex items-center gap-1 px-2 py-2">
          <ToolBtn label="Back" disabled={!showFrame || depth <= 1} onClick={() => { pending.current = "back"; window.history.back(); }}>
            <ArrowLeft />
          </ToolBtn>
          <ToolBtn label="Forward" disabled={!showFrame || ahead === 0} onClick={() => { pending.current = "forward"; window.history.forward(); }}>
            <ArrowRight />
          </ToolBtn>
          <ToolBtn label="Refresh" disabled={!showFrame} onClick={reset}>
            <RotateCw />
          </ToolBtn>
          <div className="min-w-0 flex-1 px-2">
            <p className="truncate font-display text-sm font-bold text-foreground">RAAVANKINGX</p>
          </div>
          <ToolBtn label="Home" onClick={() => navigate({ to: "/" })}>
            <Home />
          </ToolBtn>
          <ToolBtn label="Close" onClick={close}>
            <X />
          </ToolBtn>
        </div>
        <div className="h-0.5 overflow-hidden bg-transparent">
          {(loading || status.isLoading) && <div className="h-full w-1/3 animate-[marquee_1.2s_linear_infinite] bg-neon" />}
        </div>
      </div>

      <div className="relative flex-1">
        {!valid ? (
          <Fallback icon={<ShieldAlert />} title="This link can't be opened" body="Only secure https links can be opened inside RaavanKingX." onHome={() => navigate({ to: "/" })} />
        ) : showFrame ? (
          <>
            <iframe
              key={frameKey}
              src={url}
              title={name}
              onLoad={onFrameLoad}
              className="absolute inset-0 size-full border-0 bg-foreground"
              allow="fullscreen; autoplay; clipboard-write; encrypted-media; picture-in-picture; camera; microphone"
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads allow-modals allow-presentation allow-storage-access-by-user-activation"
              referrerPolicy="strict-origin-when-cross-origin"
            />
            {slow && loading && (
              <div className="absolute inset-x-4 bottom-6 flex items-center gap-3 rounded-2xl neon-border bg-secondary p-3">
                <WifiOff className="size-5 text-vip" />
                <p className="flex-1 text-xs text-muted-foreground">This is taking longer than usual.</p>
                <Button size="sm" variant="neon" onClick={reset}>
                  Retry
                </Button>
              </div>
            )}
          </>
        ) : status.isLoading ? (
          <div className="grid h-full place-items-center">
            <p className="font-mono text-xs tracking-widest text-muted-foreground">CHECKING WEBSITE…</p>
          </div>
        ) : (
          <Fallback
            icon={status.data?.reachable === false ? <WifiOff /> : <ShieldAlert />}
            title={
              mode === "restricted"
                ? "This website may not work inside the app"
                : status.data?.reachable === false
                  ? "Couldn't reach this website"
                  : "Open this app on Android"
            }
            body={
              native
                ? "Try the Android in-app browser. Some websites may still restrict access or need a public deployment link."
                : status.data?.reachable === false
                  ? "This link is unavailable. If it is a Google AI Studio preview, deploy it publicly and update its link in the admin panel."
                  : "This site's security policy prevents loading inside a web page. The RaavanKingX Android app uses a separate internal browser instead. Website login or access restrictions may still apply."
            }
            onHome={() => navigate({ to: "/" })}
          >
            {native ? (
              <Button variant="open" onClick={openNative}>
                Open in app browser
              </Button>
            ) : (
              <>
                {status.data?.reachable === false && (
                  <Button variant="neon" onClick={() => status.refetch()}>
                    <RotateCw /> Retry
                  </Button>
                )}
                {status.data?.reachable && status.data.embeddable && (
                  <Button variant="open" onClick={() => setForced(true)}>
                    Try inside app
                  </Button>
                )}
                {config?.apk_url && isHttpsUrl(config.apk_url) && (
                  <Button asChild variant="open"><a href={config.apk_url} target="_blank" rel="noopener noreferrer">Download Android APK</a></Button>
                )}
                <Button asChild variant="vip">
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink /> Open in new tab
                  </a>
                </Button>
              </>
            )}
          </Fallback>
        )}
      </div>
    </div>
  );
}

function ToolBtn({ label, children, disabled, onClick }: { label: string; children: React.ReactNode; disabled?: boolean; onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-9 shrink-0 place-items-center rounded-xl text-foreground transition-colors hover:bg-accent disabled:opacity-30 [&_svg]:size-5"
    >
      {children}
    </Button>
  );
}

function Fallback({ icon, title, body, children, onHome }: { icon: React.ReactNode; title: string; body: string; children?: React.ReactNode; onHome: () => void }) {
  return (
    <div className="grid h-full place-items-center p-6">
      <div className="max-w-sm text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl neon-border text-vip [&_svg]:size-7">{icon}</div>
        <h1 className="mt-4 font-display text-lg font-black text-foreground">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{body}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {children}
          <Button variant="ghost" onClick={onHome}>
            Back to apps
          </Button>
        </div>
      </div>
    </div>
  );
}
