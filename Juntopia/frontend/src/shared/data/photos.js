import { request } from "./http.js";
const cache = new Map();
export const photos = {
  async upload(file) {
    return request("/account/photo", {
      method: "POST",
      body: file,
      binary: true,
      contentType: file.type,
    });
  },
  async url(path) {
    const old = cache.get(path);
    if (old && old.until > Date.now()) return old.promise;
    const promise = request("/account/photo/signed", {
      method: "POST",
      body: { path },
    }).catch((error) => {
      cache.delete(path);
      throw error;
    });
    cache.set(path, { until: Date.now() + 240000, promise });
    return promise;
  },
};
// Resize locally to reduce transfer size and remove original camera metadata.
export async function preparePhoto(file) {
  if (
    !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    file.size > 10 * 1024 * 1024
  )
    throw new Error("Elegí una foto JPG, PNG o WebP de menos de 10 MB.");
  const bitmap = await createImageBitmap(file);
  try {
    const side = Math.min(bitmap.width, bitmap.height);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 512;
    const context = canvas.getContext("2d");
    context.drawImage(
      bitmap,
      (bitmap.width - side) / 2,
      (bitmap.height - side) / 2,
      side,
      side,
      0,
      0,
      512,
      512,
    );
    return await new Promise((resolve, reject) =>
      canvas.toBlob(
        (blob) =>
          blob
            ? resolve(blob)
            : reject(new Error("No pudimos preparar la imagen.")),
        "image/jpeg",
        0.88,
      ),
    );
  } finally {
    bitmap.close();
  }
}
