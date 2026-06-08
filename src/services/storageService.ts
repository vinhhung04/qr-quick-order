import { supabase } from "../lib/supabase";

const MENU_IMAGES_BUCKET = "menu-images";

/**
 * Uploads an image file to the public `menu-images` Supabase Storage bucket
 * and returns its public URL. The filename is randomized to avoid collisions.
 */
export async function uploadMenuImage(file: File): Promise<string> {
  const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `${crypto.randomUUID()}.${fileExt}`;

  const { error } = await supabase.storage.from(MENU_IMAGES_BUCKET).upload(fileName, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    console.error("uploadMenuImage failed:", error.message);
    throw new Error("Không thể tải ảnh lên. Vui lòng thử lại.");
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(MENU_IMAGES_BUCKET).getPublicUrl(fileName);

  return publicUrl;
}
