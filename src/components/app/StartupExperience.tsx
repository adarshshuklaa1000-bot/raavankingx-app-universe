import { useEffect, useState } from "react";
import { ArrowUpRight, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { DEFAULT_LOGO } from "@/services/content";
import type { AppConfig } from "@/services/types";
import { useOpenApp } from "@/webview/use-open-app";
import { SmartImage } from "./SmartImage";
import { TelegramIcon } from "./TelegramIcon";

export function StartupExperience({ config }: { config: AppConfig | null | undefined }) {
  const [phase, setPhase] = useState<"loading" | "join" | "done">("loading");
  const openApp = useOpenApp();

  useEffect(() => {
    if (!config) return;
    if (sessionStorage.getItem("rkx-startup")) {
      setPhase("done");
      return;
    }
    const timer = window.setTimeout(() => {
      sessionStorage.setItem("rkx-startup", "1");
      setPhase(config.telegram_enabled ? "join" : "done");
    }, config.splash_enabled ? 2200 : 0);
    return () => window.clearTimeout(timer);
  }, [config]);

  // A failed settings read must not leave a permanent startup overlay.
  useEffect(() => {
    const timer = window.setTimeout(() => setPhase((p) => p === "loading" ? "done" : p), 6000);
    return () => window.clearTimeout(timer);
  }, []);

  if (phase === "loading") return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background px-6" role="status" aria-label="Loading RaavanKingX">
      <div className="relative grid size-44 place-items-center">
        <span className="startup-orbit absolute inset-0 rounded-full border-2 border-neon/20 border-t-neon border-r-vip" />
        <SmartImage src={config?.splash_image || config?.app_logo || DEFAULT_LOGO} alt="RaavanKingX logo" eager className="startup-logo size-28 rounded-2xl neon-border" />
      </div>
      <p className="mt-7 font-display text-2xl font-black text-glow">RAAVANKINGX</p>
      <div className="mt-5 flex items-center gap-2 font-mono text-xs text-muted-foreground"><LoaderCircle className="size-4 animate-spin text-neon" /> LOADING</div>
      <p className="absolute inset-x-0 bottom-8 pb-safe-credit text-center font-display text-xs text-muted-foreground">Powered by <span className="font-bold text-neon">RaavanKingX</span></p>
    </div>
  );

  return (
    <Dialog open={phase === "join" && !!config?.telegram_enabled} onOpenChange={(open) => { if (!open) setPhase("done"); }}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-lg border-telegram/60 bg-secondary p-7 text-center shadow-[var(--shadow-neon)]">
        <span className="mx-auto grid size-20 place-items-center rounded-full border border-telegram/50 bg-telegram/10 text-telegram">
          {config?.telegram_icon ? <SmartImage src={config.telegram_icon} alt="" className="size-14 rounded-full" /> : <TelegramIcon className="size-10" />}
        </span>
        <p className="font-mono text-xs font-bold text-vip">RAAVANKINGX COMMUNITY</p>
        <DialogTitle className="font-display text-2xl font-black text-foreground">{config?.telegram_label || "TELEGRAM"}</DialogTitle>
        <DialogDescription className="leading-relaxed text-muted-foreground">{config?.telegram_message}</DialogDescription>
        <Button variant="telegram" size="lg" className="mt-2 w-full" onClick={() => {
          setPhase("done");
          if (config) void openApp({ url: config.telegram_url, title: config.telegram_label || "Telegram" });
        }}>{config?.telegram_join_text || "JOIN NOW"}<ArrowUpRight /></Button>
        <Button variant="ghost" className="text-muted-foreground" onClick={() => setPhase("done")}>Not now</Button>
      </DialogContent>
    </Dialog>
  );
}