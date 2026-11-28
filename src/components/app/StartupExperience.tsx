import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { DEFAULT_LOGO, announcementsQuery, joinGateQuery, socialPlatformsQuery } from "@/services/content";
import type { AppConfig } from "@/services/types";
import { useOpenApp } from "@/webview/use-open-app";
import { SmartImage } from "./SmartImage";
import { AnnouncementPanel, JoinPanel } from "./PopupPanels";
import { canContinue, eligiblePopups, enabledPlatforms, sessionList } from "@/services/popups";

export function StartupExperience({ config }: { config: AppConfig | null | undefined }) {
  const [phase, setPhase] = useState<"loading" | "join" | "done">("loading");
  const openApp = useOpenApp();
  const settings = useQuery(joinGateQuery);
  const social = useQuery(socialPlatformsQuery);
  const notices = useQuery({ ...announcementsQuery, refetchInterval: 15000 });
  const [visited, setVisited] = useState<string[]>([]);
  const [seen, setSeen] = useState<string[]>([]);
  const [gateDone, setGateDone] = useState(false);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    setVisited(sessionList("rkx-join-visited"));
    setSeen(sessionList("rkx-announcements-seen"));
    setGateDone(sessionStorage.getItem("rkx-join-complete") === "1");
    const timer = window.setInterval(() => setNow(Date.now()), 15000);
    return () => window.clearInterval(timer);
  }, []);
  const platforms = enabledPlatforms(social.data ?? []);
  const ready = !settings.isPending && !social.isPending && !notices.isPending;
  const showGate = phase !== "loading" && ready && !gateDone && !!settings.data?.enabled && platforms.length > 0;
  const announcement = phase !== "loading" && ready && !showGate ? eligiblePopups(notices.data ?? [], seen, now)[0] : undefined;
  const dismissAnnouncement = () => {
    if (!announcement) return;
    const next = [...seen, announcement.id];
    sessionStorage.setItem("rkx-announcements-seen", JSON.stringify(next));
    setSeen(next);
  };
  const finishGate = () => {
    if (!settings.data || !canContinue(settings.data.join_mode, platforms, visited)) return;
    sessionStorage.setItem("rkx-join-complete", "1");
    setGateDone(true);
  };
  useEffect(() => {
    const onBack = () => {
      if (showGate) finishGate();
      else if (announcement?.show_close_button) dismissAnnouncement();
    };
    window.addEventListener("rkx-popup-back", onBack);
    return () => window.removeEventListener("rkx-popup-back", onBack);
  }, [showGate, announcement, visited, settings.data]);

  useEffect(() => {
    if (!config || phase !== "loading") return;
    if (sessionStorage.getItem("rkx-startup")) {
      setPhase("join");
      return;
    }
    const timer = window.setTimeout(() => {
      sessionStorage.setItem("rkx-startup", "1");
      setPhase("join");
    }, config.splash_enabled ? 2200 : 0);
    return () => window.clearTimeout(timer);
  }, [config, phase]);

  // A failed settings read must not leave a permanent startup overlay.
  useEffect(() => {
    const timer = window.setTimeout(() => setPhase((p) => p === "loading" ? "join" : p), 6000);
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

  return <Dialog open={showGate || !!announcement} onOpenChange={(open) => {
    if (!open && !showGate && announcement?.show_close_button) dismissAnnouncement();
  }}>
    <DialogContent data-startup-popup="true" className="popup-dialog" overlayClassName="popup-overlay" showCloseButton={!showGate && !!announcement?.show_close_button}
      aria-describedby={undefined} onPointerDownOutside={(e) => e.preventDefault()}
      onEscapeKeyDown={(e) => { if (showGate || !announcement?.show_close_button) e.preventDefault(); }}>
      <DialogTitle className="sr-only">{showGate ? settings.data?.heading || platforms[0]?.title || platforms[0]?.platform_name : announcement?.title}</DialogTitle>
      {showGate && settings.data && <JoinPanel settings={settings.data} platforms={platforms} visited={visited} onContinue={finishGate} onVisit={(p) => {
        const next = [...new Set([...visited, p.id])];
        sessionStorage.setItem("rkx-join-visited", JSON.stringify(next));
        setVisited(next);
        void openApp({ url: p.destination_url, title: p.platform_name, externalOnWeb: true });
      }} />}
      {announcement && <AnnouncementPanel announcement={announcement} onAction={(url, title) => {
        dismissAnnouncement();
        void openApp({ url, title, externalOnWeb: true });
      }} />}
    </DialogContent>
  </Dialog>;
}