import { supabase } from "./client.js";
import { result } from "./result.js";
export const storage = {
  async upload(userId, file) {
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    )
      throw new Error("La imagen debe ser JPG, PNG o WebP de hasta 5 MB.");
    const ext = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    }[file.type];
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    await result(
      supabase.storage
        .from("creator-works")
        .upload(path, file, { contentType: file.type, upsert: false }),
    );
    return path;
  },
  async asset(path) {
    const data = await result(
      supabase.storage.from("creator-works").createSignedUrl(path, 60),
    );
    return data.signedUrl;
  },
  removeAsset(path) {
    return result(supabase.storage.from("creator-works").remove([path]));
  },
};
