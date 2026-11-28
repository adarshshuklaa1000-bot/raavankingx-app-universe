import type { Tables } from "@/integrations/supabase/types";

export type AppItem = Tables<"apps">;
export type UpcomingApp = Tables<"upcoming_apps">;
export type Banner = Tables<"banners">;
export type Category = Tables<"categories">;
export type Announcement = Tables<"announcements">;
export type AppConfig = Tables<"app_config">;
export type OwnerProfile = Tables<"owner_profile">;
export type AdminLog = Tables<"admin_logs">;
export type LoginAttempt = Tables<"login_attempts">;
export type SocialPlatform = Tables<"social_platforms">;
export type JoinGateSettings = Tables<"join_gate_settings">;

export type LinkItem = { label: string; url: string };

/** Tables mirrored live into the app; the query key equals the table name. */
export const LIVE_TABLES = [
  "apps",
  "upcoming_apps",
  "banners",
  "categories",
  "announcements",
  "app_config",
  "owner_profile",
  "social_platforms",
  "join_gate_settings",
] as const;
export type LiveTable = (typeof LIVE_TABLES)[number];

export const UPCOMING_STATUS: Record<string, string> = {
  coming_soon: "Coming Soon",
  in_development: "In Development",
  testing: "Testing",
  launching_soon: "Launching Soon",
};

export function asLinks(value: unknown): LinkItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is LinkItem => !!v && typeof v === "object" && "url" in v && "label" in v)
    .map((v) => ({ label: String(v.label), url: String(v.url) }));
}
