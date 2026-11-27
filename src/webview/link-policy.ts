import { hostMatches, hostOf } from "@/services/url";

const SOCIAL_DOMAINS = [
  "t.me", "telegram.me", "telegram.org", "instagram.com", "facebook.com", "fb.com", "fb.watch",
  "youtube.com", "youtu.be", "x.com", "twitter.com", "wa.me", "whatsapp.com", "linkedin.com", "discord.com", "discord.gg",
];

/** Native websites stay internal; known social services need top-level browsing on web. */
export function linkDestination(url: string, native: boolean): "native" | "social" | "viewer" {
  if (native) return "native";
  const host = hostOf(url);
  return host && SOCIAL_DOMAINS.some((domain) => hostMatches(host, domain)) ? "social" : "viewer";
}