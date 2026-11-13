import { useCallback, useState } from "react";
import { api } from "../../../shared/data/api.js";
import { useAction, useQuery } from "../../../shared/hooks/useQuery.js";
import { ActionStatus } from "../../../shared/components/Feedback.jsx";
import {
  categories,
  partyStates,
  localDateInput,
} from "../../../shared/domain/index.js";
import { navigate } from "../../../app/router.js";
export function PartyForm({ contentId, initial, done }) {
  const [defaultStart] = useState(() =>
    localDateInput(initial?.starts_at || Date.now() + 3600000),
  );
  const action = useAction();
  const contents = useQuery(useCallback(() => api.list("content_items"), []));
  const [mode, setMode] = useState(initial?.mode || "internal");
  async function submit(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const values = Object.fromEntries(form);
    values.starts_at = new Date(values.starts_at).toISOString();
    values.duration_minutes = Number(values.duration_minutes);
    values.capacity = Number(values.capacity);
    values.content_id = values.content_id || null;
    values.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const result = await action.run(
      () =>
        initial
          ? api.update("parties", values, { id: initial.id })
          : api.insert("parties", values),
      "Plan guardado.",
    );
    if (result?.ok) {
      if (done) done();
      else navigate(`parties/${result.value.id}`);
    }
  }
  return (
    <section className="panel party-form">
      <a href="#/parties">← Volver a Parties</a>
      <p className="eyebrow">HAGAMOS ALGO JUNTOS</p>
      <h1>{initial ? "Editar el plan" : "Un nuevo punto de encuentro."}</h1>
      <form onSubmit={submit}>
        <div className="form-grid">
          <label>
            Nombre del plan
            <input
              name="title"
              maxLength={120}
              required
              defaultValue={initial?.title}
            />
          </label>
          <label>
            Categoría
            <select
              name="category"
              defaultValue={initial?.category || "Libros"}
            >
              {categories.map((c) => (
                <option key={c.name}>{c.name}</option>
              ))}
            </select>
          </label>
        </div>
        <label>
          ¿Qué vamos a hacer?
          <textarea
            name="description"
            maxLength={2000}
            defaultValue={initial?.description}
          />
        </label>
        <div className="form-grid">
          <label>
            Fecha y hora · tu zona local
            <input
              name="starts_at"
              type="datetime-local"
              required
              defaultValue={defaultStart}
            />
          </label>
          <label>
            Duración en minutos
            <input
              name="duration_minutes"
              type="number"
              min={15}
              max={720}
              defaultValue={initial?.duration_minutes || 60}
              required
            />
          </label>
          <label>
            Lugares · incluye al anfitrión
            <input
              name="capacity"
              type="number"
              min={2}
              max={100}
              defaultValue={initial?.capacity || 8}
              required
            />
          </label>
          <label>
            Privacidad
            <select name="privacy" defaultValue={initial?.privacy || "public"}>
              <option value="public">Miembros de Juntopia</option>
              <option value="friends">Mis amigos</option>
              <option value="invitation">Sólo por invitación</option>
            </select>
          </label>
          <label>
            Contenido vinculado
            <select
              name="content_id"
              defaultValue={initial?.content_id || contentId || ""}
            >
              <option value="">Sin contenido específico</option>
              {contents.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Modalidad
            <select
              name="mode"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
            >
              <option value="internal">Conversar o crear en Juntopia</option>
              <option value="external">Proveedor externo coordinado</option>
            </select>
          </label>
        </div>
        <label>
          Enlace al proveedor oficial
          <input
            name="official_url"
            type="url"
            pattern="https://.*"
            maxLength={2000}
            required={mode === "external"}
            defaultValue={initial?.official_url || ""}
          />
        </label>
        {mode === "external" && (
          <p className="notice">
            Cada persona abre su proveedor autorizado. La sala ofrece
            conversación y coordinación; no sincroniza ni retransmite video o
            audio.
          </p>
        )}
        <label>
          Reglas de la sala
          <textarea
            name="rules"
            maxLength={1000}
            defaultValue={
              initial?.rules || "Respeto, cuidado y contenido autorizado."
            }
          />
        </label>
        {initial && (
          <label>
            Estado
            <select name="status" defaultValue={initial.status}>
              {Object.entries(partyStates).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        )}
        <p className="muted">
          Zona: {Intl.DateTimeFormat().resolvedOptions().timeZone}. La fecha se
          guarda en UTC y cada persona la ve en su horario local.
        </p>
        <button className="primary" disabled={action.busy}>
          {action.busy
            ? "Guardando…"
            : initial
              ? "Guardar cambios"
              : "Crear mi Party"}
        </button>
        <ActionStatus action={action} />
      </form>
    </section>
  );
}
