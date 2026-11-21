import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useConfig, DEFAULT_LOGO } from "@/services/content";
import { SmartImage } from "./SmartImage";

export function Header({ children }: { children?: React.ReactNode }) {
  const { data: config } = useConfig();
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-header-glow pt-safe">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex min-w-0 items-center gap-2.5">
          <SmartImage
            src={config?.app_logo || DEFAULT_LOGO}
            alt=""
            eager
            className="size-10 shrink-0 rounded-xl neon-border"
          />
          <span className="truncate font-display text-xl font-extrabold tracking-wider text-foreground text-glow">
            {config?.app_name ?? "RAAVANKINGX"}
          </span>
        </Link>
        <div
          className="flex shrink-0 items-center gap-2 rounded-full border border-live/50 bg-live/10 px-3 py-1"
          aria-label={online ? "Live and online" : "Offline"}
        >
          <span
            className={
              online ? "size-2 rounded-full bg-live animate-live-pulse" : "size-2 rounded-full bg-muted-foreground"
            }
          />
          <span className="font-mono text-xs font-bold tracking-widest text-live">
            {online ? "LIVE" : "OFFLINE"}
          </span>
        </div>
      </div>
      {children}
    </header>
  );
}
