import { queryOptions, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type {
  Announcement,
  AppConfig,
  AppItem,
  Banner,
  Category,
  OwnerProfile,
  UpcomingApp,
  SocialPlatform,
  JoinGateSettings,
} from "./types";

/*
 * Content reads. RLS returns only published rows to visitors and every row to admins,
 * so public views also filter on is_published. One shared cache per table keeps a single
 * realtime listener (LiveSync) able to refresh every screen.
 */

const byOrder = <T extends { display_order: number; created_at?: string }>(a: T, b: T) =>
  a.display_order - b.display_order || (a.created_at ?? "").localeCompare(b.created_at ?? "");

export const appsQuery = queryOptions({
  queryKey: ["apps"],
  queryFn: async (): Promise<AppItem[]> => {
    const { data, error } = await supabase.from("apps").select("*").limit(1000);
    if (error) throw error;
    return [...data].sort(byOrder);
  },
});

export const upcomingQuery = queryOptions({
  queryKey: ["upcoming_apps"],
  queryFn: async (): Promise<UpcomingApp[]> => {
    const { data, error } = await supabase.from("upcoming_apps").select("*").limit(1000);
    if (error) throw error;
    return [...data].sort(byOrder);
  },
});

export const bannersQuery = queryOptions({
  queryKey: ["banners"],
  queryFn: async (): Promise<Banner[]> => {
    const { data, error } = await supabase.from("banners").select("*");
    if (error) throw error;
    return [...data].sort(byOrder);
  },
});

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async (): Promise<Category[]> => {
    const { data, error } = await supabase.from("categories").select("*");
    if (error) throw error;
    return [...data].sort(byOrder);
  },
});

export const announcementsQuery = queryOptions({
  queryKey: ["announcements"],
  queryFn: async (): Promise<Announcement[]> => {
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const configQuery = queryOptions({
  queryKey: ["app_config"],
  queryFn: async (): Promise<AppConfig | null> => {
    const { data, error } = await supabase.from("app_config").select("*").eq("id", "global").maybeSingle();
    if (error) throw error;
    return data;
  },
});

export const ownerQuery = queryOptions({
  queryKey: ["owner_profile"],
  queryFn: async (): Promise<OwnerProfile | null> => {
    const { data, error } = await supabase.from("owner_profile").select("*").eq("id", "main").maybeSingle();
    if (error) throw error;
    return data;
  },
});

export const useConfig = () => useQuery(configQuery);

export const socialPlatformsQuery = queryOptions({
  queryKey: ["social_platforms"],
  queryFn: async (): Promise<SocialPlatform[]> => {
    const { data, error } = await supabase.from("social_platforms").select("*").order("display_order");
    if (error) throw error;
    return data;
  },
  refetchInterval: 15000,
});
export const joinGateQuery = queryOptions({
  queryKey: ["join_gate_settings"],
  queryFn: async (): Promise<JoinGateSettings | null> => {
    const { data, error } = await supabase.from("join_gate_settings").select("*").eq("id", "global").maybeSingle();
    if (error) throw error;
    return data;
  },
  refetchInterval: 15000,
});

/** Announcements visible right now (published, started, not expired). */
export function activeAnnouncements(list: Announcement[], now = Date.now()): Announcement[] {
  return list.filter(
    (a) =>
      a.is_published &&
      a.enabled &&
      (!a.starts_at || new Date(a.starts_at).getTime() <= now) &&
      (!a.expires_at || new Date(a.expires_at).getTime() > now),
  );
}

export const DEFAULT_LOGO = "/icons/icon-192.png";
