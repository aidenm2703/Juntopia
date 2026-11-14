import { randomUUID } from "node:crypto";
import { ApiError } from "../../shared/errors.js";
import { createRepository } from "../../database/repositories/resource.repository.js";
const types = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };
export function validateImage(buffer, type) {
  if (!types[type])
    throw new ApiError(
      415,
      "INVALID_IMAGE_TYPE",
      "Elegí una imagen JPG, PNG o WebP.",
    );
  const png = buffer
    .subarray(0, 8)
    .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const jpg =
    buffer.length >= 3 &&
    buffer[0] === 255 &&
    buffer[1] === 216 &&
    buffer[2] === 255;
  const webp =
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP";
  if (!{ "image/png": png, "image/jpeg": jpg, "image/webp": webp }[type])
    throw new ApiError(
      400,
      "INVALID_IMAGE",
      "El contenido no corresponde al formato indicado.",
    );
}
export function createStorageService({ db, user }) {
  const { unwrap } = createRepository(db),
    bucket = db.storage.from("creator-works");
  return {
    async upload(buffer, type) {
      validateImage(buffer, type);
      const path = `${user.id}/${randomUUID()}.${types[type]}`;
      await unwrap(
        bucket.upload(path, buffer, { contentType: type, upsert: false }),
      );
      return path;
    },
    async signed(path) {
      if (typeof path !== "string" || path.length > 300 || path.includes(".."))
        throw new ApiError(400, "INVALID_PATH", "Ruta no válida.");
      const { data, error } = await bucket.createSignedUrl(path, 60);
      if (error)
        throw new ApiError(404, "FILE_UNAVAILABLE", "Archivo no disponible.");
      return data.signedUrl;
    },
    async remove(path) {
      if (
        typeof path !== "string" ||
        !path.startsWith(user.id + "/") ||
        path.includes("..")
      )
        throw new ApiError(
          403,
          "OWNER_MISMATCH",
          "No podés retirar archivos de otra cuenta.",
        );
      return unwrap(bucket.remove([path]));
    },
  };
}
