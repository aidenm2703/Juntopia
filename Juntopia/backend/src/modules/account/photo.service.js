import { randomUUID } from "node:crypto";
import { validateImage } from "../creators/storage.service.js";
import { ApiError, databaseError } from "../../shared/errors.js";
export function createPhotoService({ db, user }) {
  const bucket = db.storage.from("profile-photos");
  const validPath = (path) =>
    typeof path === "string" &&
    /^[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|png|webp)$/.test(path);
  return {
    async upload(buffer, type) {
      if (buffer.length > 2097152)
        throw new ApiError(
          413,
          "PHOTO_TOO_LARGE",
          "La foto debe pesar menos de 2 MB.",
        );
      validateImage(buffer, type);
      const extension = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
      }[type];
      const path = `${user.id}/${randomUUID()}.${extension}`;
      const { error } = await bucket.upload(path, buffer, {
        contentType: type,
        upsert: false,
      });
      if (error) throw databaseError(error);
      return path;
    },
    async signed(path) {
      if (!validPath(path))
        throw new ApiError(400, "INVALID_PHOTO", "Foto no válida.");
      const { data, error } = await bucket.createSignedUrl(path, 300);
      if (error)
        throw new ApiError(
          404,
          "PHOTO_UNAVAILABLE",
          "La foto no está disponible.",
        );
      return data.signedUrl;
    },
    async remove(path) {
      if (!validPath(path) || !path.startsWith(user.id + "/"))
        throw new ApiError(
          403,
          "OWNER_MISMATCH",
          "No podés retirar la foto de otra cuenta.",
        );
      const { error } = await bucket.remove([path]);
      if (error) throw databaseError(error);
      return { removed: true };
    },
  };
}
