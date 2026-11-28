import { Bell, Check, ExternalLink, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SmartImage } from "./SmartImage";
import type { Announcement, JoinGateSettings, SocialPlatform } from "@/services/types";
import { canContinue, popupButtons, popupTokens } from "@/services/popups";
import { isHttpsUrl } from "@/services/url";

export function JoinPanel({ settings, platforms, visited, onVisit, onContinue }: {
  settings: JoinGateSettings; platforms: SocialPlatform[]; visited: string[];
  onVisit: (platform: SocialPlatform) => void; onContinue: () => void;
}) {
  const first = platforms[0];
  return <div className="popup-panel join-panel">
    <div className="mx-auto grid size-20 place-items-center rounded-full border-2 border-[var(--popup-border)]">
      {first?.platform_icon ? <SmartImage src={first.platform_icon} alt={first.platform_name} className="size-16 rounded-full" /> : <Users className="size-9 text-[var(--popup-join)]" />}
    </div>
    <h2 className="break-words font-display text-2xl font-extrabold">{settings.heading || first?.title || first?.platform_name}</h2>
    {!!settings.description && <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-[var(--popup-muted)]">{settings.description}</p>}
    <div className="space-y-5">
      {platforms.map((p) => <div key={p.id} className="space-y-2" style={popupTokens({ "--popup-join": p.brand_color })}>
        {platforms.length > 1 && <div className="flex items-center justify-center gap-2">
          {p.platform_icon && <SmartImage src={p.platform_icon} alt="" className="size-8 rounded-full" />}
          <h3 className="break-words font-bold">{p.title || p.platform_name}</h3>
        </div>}
        {!!p.description && <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-[var(--popup-muted)]">{p.description}</p>}
        <Button type="button" className="popup-join w-full" onClick={() => onVisit(p)}>
          {visited.includes(p.id) ? <Check /> : <ExternalLink />}<span className="min-w-0 whitespace-normal break-words">{p.button_text || p.platform_name}</span>
        </Button>
      </div>)}
    </div>
    <Button type="button" className="popup-continue w-full" disabled={!canContinue(settings.join_mode, platforms, visited)} onClick={onContinue}>
      <span className="whitespace-normal break-words">{settings.continue_button_text}</span>
    </Button>
  </div>;
}

export function AnnouncementPanel({ announcement: a, onAction }: { announcement: Announcement; onAction: (url: string, title: string) => void }) {
  const buttons = popupButtons(a.buttons_configuration).filter((b) => b.enabled && b.text.trim() && isHttpsUrl(b.url));
  return <div className="popup-panel announcement-panel" style={popupTokens({ "--popup-border": a.border_color, "--popup-badge": a.badge_color })}>
    {a.badge_text && <span className="mx-auto max-w-full break-words rounded px-3 py-1 text-sm font-bold text-[var(--popup-action-text)] bg-[var(--popup-badge)]">{a.badge_text}</span>}
    <Bell className="mx-auto size-9 text-[var(--popup-badge)]" />
    <h2 className="whitespace-pre-wrap break-words font-display text-2xl font-extrabold">{a.title}</h2>
    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-[var(--popup-muted)]">{a.body}</p>
    {!!buttons.length && <div className="flex flex-col gap-3">
      {buttons.map((b, i) => <Button key={i} type="button" className="popup-action w-full" style={popupTokens({ "--popup-action-bg": b.background_color, "--popup-action-text": b.text_color })} onClick={() => onAction(b.url, b.text)}>
        <span className="whitespace-normal break-words">{b.text}</span><ExternalLink />
      </Button>)}
    </div>}
  </div>;
}