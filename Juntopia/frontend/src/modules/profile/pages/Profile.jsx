import { useCallback, useState } from "react";
import { api } from "../../../shared/data/api.js";
import { saveProfile, interests } from "../services/profileService.js";
import { useQuery, useAction } from "../../../shared/hooks/useQuery.js";
import { AvatarEditor } from "../../../shared/components/AvatarEditor.jsx";
import {
  ActionStatus,
  Feedback,
} from "../../../shared/components/Feedback.jsx";
export function Profile({ profile, refresh }) {
  const query = useQuery(
    useCallback(() => api.one("member_cards", profile.id), [profile.id]),
  );
  return (
    <Feedback
      query={{
        ...query,
        data: query.data || (!query.loading && !query.error ? {} : null),
      }}
    >
      {(card) => (
        <ProfileForm
          key={profile.id}
          initial={profile}
          card={card}
          refresh={refresh}
        />
      )}
    </Feedback>
  );
}
function ProfileForm({ initial, card, refresh }) {
  const [profile, setProfile] = useState(initial);
  const [visible, setVisible] = useState(card.discoverable || false);
  const action = useAction();
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">ESTE LUGAR TAMBIÉN SOS VOS</p>
          <h1>Mi perfil</h1>
          <p>
            Tu tarjeta compartida y tu biblioteca tienen controles separados.
          </p>
        </div>
      </div>
      <form
        className="panel profile-form"
        onSubmit={(e) => {
          e.preventDefault();
          action.run(async () => {
            await saveProfile(
              { ...profile, onboarding_complete: true },
              visible,
            );
            refresh();
          }, "Perfil actualizado.");
        }}
      >
        <AvatarEditor profile={profile} change={setProfile} />
        <div className="form-grid">
          <label>
            Nombre visible
            <input
              value={profile.display_name}
              required
              maxLength={50}
              onChange={(e) =>
                setProfile({ ...profile, display_name: e.target.value })
              }
            />
          </label>
          <label>
            Identificador
            <input
              value={profile.username}
              required
              pattern="[a-z0-9_]{3,24}"
              maxLength={24}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  username: e.target.value.toLowerCase(),
                })
              }
            />
          </label>
        </div>
        <label>
          Algo sobre vos
          <textarea
            value={profile.bio}
            maxLength={280}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          />
        </label>
        <h2>Lo que te mueve</h2>
        <div className="chips">
          {interests.map((item) => (
            <button
              type="button"
              key={item}
              aria-pressed={profile.interests.includes(item)}
              onClick={() =>
                setProfile({
                  ...profile,
                  interests: profile.interests.includes(item)
                    ? profile.interests.filter((i) => i !== item)
                    : [...profile.interests, item],
                })
              }
            >
              {item}
            </button>
          ))}
        </div>
        <label className="check">
          <input
            type="checkbox"
            checked={visible}
            onChange={(e) => setVisible(e.target.checked)}
          />
          Mostrar mi tarjeta a miembros registrados para que puedan encontrarme
          y enviarme solicitudes de amistad.
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={profile.activity_visible}
            onChange={(e) =>
              setProfile({ ...profile, activity_visible: e.target.checked })
            }
          />
          Mostrar mi presencia a otros participantes mientras estoy dentro de
          una Party.
        </label>
        <p className="fine-print">
          La tarjeta incluye nombre, identificador, biografía y avatar. Tu
          biblioteca y tus conversaciones siguen siendo privadas. Tus amistades
          pueden ver tu tarjeta aunque esté oculta del directorio.
        </p>
        <button className="primary" disabled={action.busy}>
          Guardar mi perfil
        </button>
        <ActionStatus action={action} />
      </form>
    </>
  );
}
