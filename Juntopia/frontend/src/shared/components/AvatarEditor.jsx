import { Avatar } from "./Avatar.jsx";
import { avatarNames } from "../domain/profile.js";
export function AvatarEditor({ profile, change }) {
  const options = profile.avatar_options || {
    hair: "#302b27",
    outfit: "#485b37",
    accessory: "none",
  };
  return (
    <>
      <div className="avatar-grid">
        {avatarNames.map((name, base) => (
          <button
            type="button"
            key={name}
            aria-pressed={profile.avatar_base === base}
            onClick={() => change({ ...profile, avatar_base: base })}
          >
            <Avatar
              base={base}
              color={profile.avatar_color}
              options={options}
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
