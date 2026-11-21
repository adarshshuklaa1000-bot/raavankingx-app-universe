import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Download, MonitorSmartphone, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { AppConfig } from "@/services/types";
import { checkUrl } from "@/services/url-check.functions";
import { isHttpsUrl } from "@/services/url";
import { usePwaInstall } from "@/services/pwa-install";
import { isNativeApp } from "@/webview/native";

function formatSize(bytes: number | null) {
  if (!bytes) return null;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function InstallCard({ config }: { config: AppConfig }) {
  const [native, setNative] = useState(false);
  const pwa = usePwaInstall();
  const check = useServerFn(checkUrl);
  const apkUrl = config.apk_url && isHttpsUrl(config.apk_url) ? config.apk_url : null;

  useEffect(() => setNative(isNativeApp()), []);

  const verify = useQuery({
    queryKey: ["apk-check", apkUrl],
    queryFn: () => check({ data: { url: apkUrl! } }),
    enabled: !!apkUrl && !native,
    staleTime: 10 * 60_000,
  });

  if (native) {
    return config.app_version ? (
      <p className="text-center font-mono text-xs text-muted-foreground">App version {config.app_version}</p>
    ) : null;
  }

  const verified = verify.data?.reachable === true;

  return (
    <section className="rounded-3xl neon-border bg-secondary/70 p-5">
      <h2 className="font-display text-lg font-black tracking-widest text-foreground">GET THE APP</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Install RaavanKingX for the full in-app browser experience.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {apkUrl && (
          <div className="rounded-2xl border border-border bg-background/60 p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="font-display text-sm font-bold">Android APK</span>
              {verify.isLoading ? (
                <span className="font-mono text-[10px] text-muted-foreground">CHECKING…</span>
              ) : verified ? (
                <span className="flex items-center gap-1 font-mono text-[10px] text-live">
                  <CheckCircle2 className="size-3" /> AVAILABLE
                </span>
              ) : (
                <span className="flex items-center gap-1 font-mono text-[10px] text-destructive">
                  <TriangleAlert className="size-3" /> UNAVAILABLE
                </span>
              )}
            </div>
            {verified && (
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {config.app_version && `v${config.app_version}`}
                {config.apk_release_date && ` · ${config.apk_release_date}`}
                {formatSize(verify.data?.sizeBytes ?? null) && ` · ${formatSize(verify.data?.sizeBytes ?? null)}`}
              </p>
            )}
            {verified && config.apk_whats_new && (
              <p className="mt-2 whitespace-pre-line text-xs text-foreground/80">{config.apk_whats_new}</p>
            )}
            <Button asChild={verified} variant="vip" size="sm" className="mt-3 w-full" disabled={!verified}>
              {verified ? (
                <a href={apkUrl} download rel="noopener">
                  <Download /> Download APK
                </a>
              ) : (
                <span>Download not available</span>
              )}
            </Button>
          </div>
        )}

        {config.pwa_install_enabled && (
          <div className="rounded-2xl border border-border bg-background/60 p-4">
            <span className="font-display text-sm font-bold">Install web app</span>
            <p className="mt-1 text-xs text-muted-foreground">
              {pwa.installed
                ? "Already installed on this device."
                : pwa.available
                  ? "Add RaavanKingX to your home screen."
                  : "Use your browser menu → “Add to Home screen” to install."}
            </p>
            <Button
              variant="neon"
              size="sm"
              className="mt-3 w-full"
              disabled={!pwa.available || pwa.installed}
              onClick={() => pwa.install()}
            >
              <MonitorSmartphone /> Install
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
