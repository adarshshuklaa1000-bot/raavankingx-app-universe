import { supabase } from "@/integrations/supabase/client";

/** Writes one admin activity entry; failures never block the admin's action. */
export async function logAction(action: string, target: string, details?: string) {
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return;
  await supabase.from("admin_logs").insert({
    admin_uid: user.id,
    admin_email: user.email ?? null,
    action,
    target,
    details: details ?? null,
  });
}

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;
const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Uploads an image to the private media storage and returns a long-lived secure link
 * that visitors can load. Only admins can upload (enforced by storage policies).
 */
export async function uploadImage(file: File, folder: string): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
  if (file.size > MAX_BYTES) throw new Error("Image must be 5 MB or smaller.");
  const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw error;
  const { data, error: signError } = await supabase.storage.from("media").createSignedUrl(path, TEN_YEARS);
  if (signError || !data) throw signError ?? new Error("Could not create image link.");
  return data.signedUrl;
}
