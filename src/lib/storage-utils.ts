import { supabase } from "@/integrations/supabase/client";

/**
 * Resolve a kop-logos storage path to a signed URL (1 hour expiry).
 * Returns null if the path is empty or signing fails.
 */
export async function getLogoSignedUrl(path: string): Promise<string | null> {
  if (!path) return null;
  const { data, error } = await supabase.storage
    .from("kop-logos")
    .createSignedUrl(path, 3600);
  if (error) {
    console.error("[storage] signed URL error:", error);
    return null;
  }
  return data.signedUrl;
}
