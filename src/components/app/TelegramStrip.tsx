import type { AppConfig } from "@/services/types";
import { useOpenApp } from "@/webview/use-open-app";
import { Button } from "@/components/ui/button";
import { SmartImage } from "./SmartImage";
import { TelegramIcon } from "./TelegramIcon";

export function TelegramStrip({ config }: { config: AppConfig }) {
  const openApp = useOpenApp();
  if (!config.telegram_enabled) return null;
  const msg = config.telegram_message;
  return (
    <section className="mx-auto max-w-6xl px-4 pt-4">
      <div className="flex items-center gap-3 rounded-2xl border border-telegram/50 bg-secondary/80 py-2 pl-4 pr-2">
        <div className="relative min-w-0 flex-1 overflow-hidden" aria-label={msg}>
          <div className="flex w-max animate-marquee gap-12 whitespace-nowrap font-display text-sm font-semibold text-foreground/90">
            <span>{msg}</span>
            <span aria-hidden>{msg}</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {config.telegram_icon ? (
            <SmartImage src={config.telegram_icon} alt="" className="size-7 rounded-full" />
          ) : (
            <span className="grid size-7 place-items-center rounded-full bg-telegram text-background">
              <TelegramIcon className="size-4" />
            </span>
          )}
          <span className="hidden font-display text-xs font-bold tracking-widest text-telegram sm:inline">
            {config.telegram_label}
          </span>
          <Button
            variant="telegram"
            size="sm"
            onClick={() => openApp({ url: config.telegram_url, title: config.telegram_label || "Telegram" })}
          >
            {config.telegram_join_text}
          </Button>
        </div>
      </div>
    </section>
  );
}
