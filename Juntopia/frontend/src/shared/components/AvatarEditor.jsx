import { Avatar } from "./Avatar.jsx";
import { avatarNames } from "../domain/profile.js";
import { useState } from "react";
import { photos, preparePhoto } from "../data/photos.js";
import { errorMessage } from "../domain/index.js";
export function AvatarEditor({ profile, change }) {
  const [uploading, setUploading] = useState(false),
    [message, setMessage] = useState("");
  const options = profile.avatar_options || {
    hair: "#302b27",
    outfit: "#485b37",
    accessory: "none",
  };
  return (
    <>
      <h2>Tu imagen</h2>
      <div className="photo-editor">
        <div className="avatar-preview">
          <Avatar
            base={profile.avatar_base}
            color={profile.avatar_color}
            options={options}
          />
        </div>
        <div>
          <p>Elegí un personaje o usá una foto tuya.</p>
          <label className="button-link">
            {uploading ? "Preparando tu foto…" : "Subir mi foto"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={uploading}
              onChange={async (event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (!file) return;
                setUploading(true);
                setMessage("");
                try {
                  const image = await preparePhoto(file);
                  const path = await photos.upload(image);
                  change({
                    ...profile,
                    avatar_options: { ...options, mode: "photo", photo: path },
                  });
                  setMessage("Foto lista. Guardá tu perfil para usarla.");
                } catch (error) {
                  setMessage(
                    error.message?.startsWith("Elegí una foto")
                      ? error.message
                      : errorMessage(error),
                  );
                } finally {
                  setUploading(false);
                }
              }}
            />
          </label>
          {options.photo && (
            <button
              type="button"
              onClick={() =>
                change({
                  ...profile,
                  avatar_options: {
                    ...options,
                    mode: options.mode === "photo" ? "character" : "photo",
                  },
                })
              }
            >
              {options.mode === "photo" ? "Usar personaje" : "Usar mi foto"}
            </button>
          )}
          <p className="fine-print">
            Recortamos el centro de la foto. Se verá según los permisos de tu
            tarjeta. JPG, PNG o WebP, hasta 10 MB.
          </p>
          <p role="status">{message}</p>
        </div>
      </div>
      <div className="avatar-grid">
        {avatarNames.map((name, base) => (
          <button
            type="button"
            key={name}
            aria-pressed={
              options.mode !== "photo" && profile.avatar_base === base
            }
            onClick={() =>
              change({
                ...profile,
                avatar_base: base,
                avatar_options: { ...options, mode: "character" },
              })
            }
          >
            <Avatar
              base={base}
              color={profile.avatar_color}
              options={{ ...options, mode: "character" }}
            />
            {name}
          </button>
        ))}
      </div>
      <div className="form-grid">
        <label>
          Fondo
          <input
            type="color"
            value={profile.avatar_color}
            onChange={(e) =>
              change({ ...profile, avatar_color: e.target.value })
            }
          />
        </label>
        <label>
          Cabello
          <input
            type="color"
            value={options.hair}
            onChange={(e) =>
              change({
                ...profile,
                avatar_options: { ...options, hair: e.target.value },
              })
            }
          />
        </label>
        <label>
          Ropa
          <input
            type="color"
            value={options.outfit}
            onChange={(e) =>
              change({
                ...profile,
                avatar_options: { ...options, outfit: e.target.value },
              })
            }
          />
        </label>
        <label>
          Accesorio
          <select
            value={options.accessory}
            onChange={(e) =>
              change({
                ...profile,
                avatar_options: { ...options, accessory: e.target.value },
              })
            }
          >
            <option value="none">Sin accesorio</option>
            <option value="glasses">Anteojos</option>
            <option value="leaf">Una hojita</option>
            <option value="headphones">Auriculares</option>
          </select>
        </label>
      </div>
    </>
  );
}
