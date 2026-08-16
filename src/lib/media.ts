import { supabase } from "@/integrations/supabase/client";

/** Stable, publicly reachable URL for a file stored in the private media bucket. */
export function mediaUrl(path: string) {
  return `/api/public/media/${path.split("/").map(encodeURIComponent).join("/")}`;
}

/** Uploads a file to the media bucket and returns the URL to store in the database. */
export async function uploadMedia(file: File, folder = "uploads") {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(error.message);
  return mediaUrl(path);
}