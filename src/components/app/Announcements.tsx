import { Megaphone, Siren } from "lucide-react";
import type { Announcement } from "@/services/types";
import { useOpenApp } from "@/webview/use-open-app";
import { cn } from "@/lib/utils";

export function Announcements({ items }: { items: Announcement[] }) {
  const openApp = useOpenApp();
  if (items.length === 0) return null;
  return (
    <section aria-label="Notices" className="mx-auto max-w-6xl space-y-2 px-4 pt-4">
      {items.map((a) => {
        const urgent = a.priority === "urgent";
        const Icon = urgent ? Siren : Megaphone;
        const content = (
          <>
            <Icon className={cn("mt-0.5 size-5 shrink-0", urgent ? "text-destructive" : "text-neon")} />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 font-display text-sm font-bold text-foreground">
                {a.is_blinking && <span className="size-2 rounded-full bg-vip animate-blink" aria-hidden />}
                <span className={cn(a.is_blinking && "animate-pulse")}>{a.title}</span>
              </p>
              {a.body && <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{a.body}</p>}
            </div>
          </>
        );
        const cls = cn(
          "flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left",
          urgent ? "border-destructive/60 bg-destructive/10" : "border-border bg-secondary/70",
        );
        return a.action_url ? (
          <button key={a.id} type="button" className={cls} onClick={() => openApp({ url: a.action_url!, title: a.title })}>
            {content}
          </button>
        ) : (
          <div key={a.id} className={cls}>
            {content}
          </div>
        );
      })}
    </section>
  );
}
