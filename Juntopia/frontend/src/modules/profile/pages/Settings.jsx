import { useCallback, useState } from "react";
import { api } from "../../../shared/data/api.js";
import { useQuery, useAction } from "../../../shared/hooks/useQuery.js";
import {
  ActionStatus,
  Feedback,
} from "../../../shared/components/Feedback.jsx";
import { Auth } from "../../auth/pages/Auth.jsx";
export function Settings({ userId, theme, setTheme }) {
  const query = useQuery(
    useCallback(async () => {
      const rows = await api.list("user_settings", {
        filters: { user_id: userId },
        order: null,
      });
      return (
        rows[0] || {
          theme,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }
      );
    }, [userId, theme]),
  );
  const [password, setPassword] = useState(false);
  const action = useAction();
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">A TU MANERA</p>
          <h1>Configuración</h1>
        </div>
      </div>
      <Feedback query={query}>
        {(settings) => (
          <form
            className="panel"
            onSubmit={(e) => {
              e.preventDefault();
              const values = Object.fromEntries(new FormData(e.currentTarget));
              action.run(async () => {
                await api.upsert(
                  "user_settings",
                  { user_id: userId, ...values },
                  "user_id",
                );
                setTheme(values.theme);
                query.reload();
              }, "Preferencias guardadas en tu cuenta.");
            }}
          >
            <label>
              Apariencia
              <select name="theme" defaultValue={settings.theme}>
                <option value="system">Sistema</option>
                <option value="dark">Bosque oscuro</option>
                <option value="light">Bosque claro</option>
              </select>
            </label>
            <label>
              Zona horaria preferida
              <input
                name="timezone"
                defaultValue={settings.timezone}
                list="timezones"
                required
                maxLength={80}
              />
              <datalist id="timezones">
                {[
                  "America/Costa_Rica",
                  "America/Mexico_City",
                  "America/Bogota",
                  "America/Argentina/Buenos_Aires",
                  "America/New_York",
                  "Europe/Madrid",
                  "UTC",
                ].map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </label>
            <p className="fine-print">
              Las Parties muestran el horario local de tu dispositivo. Guardamos
              tu zona preferida para las siguientes sesiones y recordatorios.
            </p>
            <button className="primary" disabled={action.busy}>
              Guardar preferencias
            </button>
            <ActionStatus action={action} />
          </form>
        )}
      </Feedback>
      <section className="panel">
        <h2>Acceso y privacidad</h2>
        <button
          disabled={action.busy}
          onClick={() =>
            action.run(async () => {
              const data = await api.exportData(userId);
              const url = URL.createObjectURL(
                new Blob([JSON.stringify(data, null, 2)], {
                  type: "application/json",
                }),
              );
              const a = document.createElement("a");
              a.href = url;
              a.download = "mis-datos-juntopia.json";
              a.click();
              setTimeout(() => URL.revokeObjectURL(url), 1000);
            }, "Descarga preparada. El archivo contiene datos privados: guardalo en un lugar seguro.")
          }
        >
          Descargar mis datos
        </button>
        <button onClick={() => setPassword(!password)} aria-expanded={password}>
          Cambiar contraseña
        </button>
        <p>
          <a href="#/policies">Leer reglas y privacidad de la beta →</a>
        </p>
        <p>
          Podés ocultar tu tarjeta desde Mi perfil y gestionar los bloqueos
          desde Amigos.
        </p>
        <p className="fine-print">
          La eliminación completa de cuenta requiere un proceso administrativo
          de Supabase. No se ofrece un botón de borrado sin un backend que pueda
          revocar sesiones y verificar la identidad.
        </p>
      </section>
      {password && <Auth mode="password" close={() => setPassword(false)} />}
    </>
  );
}
