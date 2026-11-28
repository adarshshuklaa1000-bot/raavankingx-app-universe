import type { CSSProperties } from "react";
import type { Announcement, JoinGateSettings, SocialPlatform } from "./types";
import { isHttpsUrl } from "./url";

export type PopupButton = { text: string; url: string; background_color: string; text_color: string; enabled: boolean };
export function popupButtons(value: unknown): PopupButton[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 2).filter((b): b is PopupButton => !!b && typeof b === "object" &&
    typeof b.text === "string" && typeof b.url === "string" && typeof b.enabled === "boolean")
    .map((b) => ({ ...b, background_color: color(b.background_color), text_color: color(b.text_color) }));
}
export function color(value: unknown): string {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value) ? value : "";
}
/** Only validated admin colors become scoped semantic token overrides. */
export function popupTokens(values: Record<string, unknown>): CSSProperties {
  return Object.fromEntries(Object.entries(values).filter(([, v]) => color(v))) as CSSProperties;
}
export function enabledPlatforms(list: SocialPlatform[]): SocialPlatform[] {
  return list.filter((p) => p.enabled && isHttpsUrl(p.destination_url)).sort((a, b) => a.display_order - b.display_order);
}
export function canContinue(mode: JoinGateSettings["join_mode"], platforms: SocialPlatform[], visited: string[]): boolean {
  if (!platforms.length) return true;
  return mode === "all" ? platforms.every((p) => visited.includes(p.id)) : platforms.some((p) => visited.includes(p.id));
}
export function eligiblePopups(list: Announcement[], seen: string[], now = Date.now()): Announcement[] {
  return list.filter((a) => a.popup_enabled && a.is_published && a.enabled && !seen.includes(a.id) &&
    (!a.starts_at || Date.parse(a.starts_at) <= now) && (!a.expires_at || Date.parse(a.expires_at) > now))
    .sort((a, b) => Number(b.priority === "urgent") - Number(a.priority === "urgent") || b.created_at.localeCompare(a.created_at));
}
export function sessionList(key: string): string[] {
  try { const v: unknown = JSON.parse(sessionStorage.getItem(key) || "[]"); return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []; }
  catch { return []; }
}