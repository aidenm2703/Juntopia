import { useCallback, useState } from "react";
import { api } from "../lib/api.js";
import {
  categories,
  formatDate,
  partyStates,
  localDateInput,
  rsvpLabels,
  downloadCalendar,
} from "../lib/domain.js";
import { useQuery, useAction, useRealtime } from "../hooks/useQuery.js";
import {
  ActionStatus,
  Feedback,
  ReportButton,
} from "../components/Feedback.jsx";
import { OfficialLink } from "../components/ContentCard.jsx";
import { Chat } from "../components/Chat.jsx";
import { Countdown, PartyPresence } from "../components/PartyPresence.jsx";
import { navigate } from "../hooks/useRoute.js";
export function Parties({
  userId,
  id,
  contentId,
  creating = false,
  agenda = false,
}) {
  const [filter, setFilter] = useState("upcoming");
  const query = useQuery(
    useCallback(async () => {
      const [parties, attendees] = await Promise.all([
        api.list("parties", { order: "starts_at", ascending: true }),
        api.list("party_attendees", { filters: { user_id: userId } }),
      ]);
      return { parties, attendees };
    }, [userId]),
  );
  useRealtime("parties", null, userId, query.reload);
  if (creating) return <PartyForm contentId={contentId} />;
  if (id) return <PartyRoom id={id} userId={userId} />;
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">UN PLAN ES MEJOR EN COMPAÑÍA</p>
          <h1>{agenda ? "Mi agenda" : "Parties"}</h1>
          <p>
            {agenda
              ? "Los encuentros que organizás y a los que te sumaste."
              : "Escuchar, leer, jugar, dibujar. Elegí cómo encontrarnos."}
          </p>
        </div>
        <a className="button-link primary" href="#/parties/new">
          ＋ Crear una Party
        </a>
      </div>
      <div className="chips">
        <button
          aria-pressed={filter === "upcoming"}
          onClick={() => setFilter("upcoming")}
        >
          Próximos encuentros
        </button>
        <button
          aria-pressed={filter === "all"}
          onClick={() => setFilter("all")}
        >
          Todos los planes
        </button>
      </div>
      <Feedback query={query}>
        {({ parties, attendees }) => {
          const rows = parties.filter(
            (p) =>
              (!agenda ||
                p.host_id === userId ||
                attendees.some(
                  (a) => a.party_id === p.id && a.rsvp !== "declined",
                )) &&
              (filter === "all" ||
                (["scheduled", "live"].includes(p.status) &&
                  new Date(p.starts_at).getTime() + p.duration_minutes * 60000 >
                    Date.now())),
          );
          return rows.length ? (
            <div className="party-grid">
              {rows.map((p) => (
                <PartyCard
                  key={p.id}
                  party={p}
                  rsvp={attendees.find((a) => a.party_id === p.id)?.rsvp}
                />
              ))}
            </div>
          ) : (
            <section className="panel empty">
              <h2>Hay espacio para un nuevo plan.</h2>
              <p>
                {agenda
                  ? "Cuando crees o te sumes a una Party, aparecerá acá."
                  : "Todavía no hay encuentros disponibles. Podés organizar el primero."}
              </p>
              <a href="#/parties/new">Crear un encuentro →</a>
            </section>
          );
        }}
      </Feedback>
    </>
  );
}
export function PartyCard({ party, rsvp }) {
  const category = categories.find((c) => c.name === party.category);
  return (
    <a
      href={`#/parties/${party.id}`}
      className="party-card panel"
      style={{ "--accent": category?.color }}
    >
      <div className="party-card-art" aria-hidden="true">
        {category?.icon}
      </div>
      <div className="party-card-body">
        <div className="tag-list">
          <span>{partyStates[party.status]}</span>
          <span>{party.category}</span>
        </div>
        <h2>{party.title}</h2>
        <p>{formatDate(party.starts_at)}</p>
        <small>
          {party.duration_minutes} min · {party.capacity} lugares ·{" "}
          {party.privacy === "public"
            ? "Pública"
            : party.privacy === "friends"
              ? "Amigos"
              : "Por invitación"}
        </small>
        {rsvp && <p className="badge">{rsvpLabels[rsvp]}</p>}
        <strong>Ver el plan →</strong>
      </div>
    </a>
  );
}
function PartyForm({ contentId, initial, done }) {
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
function PartyRoom({ id, userId }) {
  const [editing, setEditing] = useState(false);
  const query = useQuery(
    useCallback(async () => {
      const [party, attendees, cards, invites, bans] = await Promise.all([
        api.one("parties", id),
        api.list("party_attendees", { filters: { party_id: id } }),
        api.list("member_cards", { order: "display_name" }),
        api.list("party_invites", { filters: { party_id: id }, order: null }),
        api.list("party_bans", { filters: { party_id: id }, order: null }),
      ]);
      return party
        ? {
            party,
            attendees: attendees.filter(
              (a) => !bans.some((b) => b.user_id === a.user_id),
            ),
            cards,
            invites,
            bans,
          }
        : null;
    }, [id]),
  );
  const action = useAction();
  useRealtime("party_attendees", "party_id", id, query.reload);
  useRealtime("parties", "id", id, query.reload);
  return (
    <Feedback
      query={query}
      empty="Este plan no está disponible o requiere una invitación."
    >
      {({ party, attendees, cards, invites, bans }) => {
        const host = party.host_id === userId;
        const own = attendees.find((a) => a.user_id === userId);
        const active = ["scheduled", "live"].includes(party.status);
        const participates = host || own?.rsvp === "going";
        if (editing && host)
          return (
            <PartyForm
              initial={party}
              done={() => {
                setEditing(false);
                query.reload();
              }}
            />
          );
        return (
          <>
            <a href="#/parties">← Todos los encuentros</a>
            <section className="panel party-room-hero">
              <div className="tag-list">
                <span>{party.category}</span>
                <span>{partyStates[party.status]}</span>
              </div>
              <h1>{party.title}</h1>
              <Countdown startsAt={party.starts_at} status={party.status} />
              <p className="preserve-lines">{party.description}</p>
              <p>
                {formatDate(party.starts_at)} · {party.duration_minutes} min
              </p>
              <small>
                Zona del anfitrión: {party.timezone} ·{" "}
                {attendees.filter((a) => a.rsvp === "going").length + 1}/
                {party.capacity} lugares
              </small>
              <div className="actions">
                {!host &&
                  active &&
                  ["going", "maybe", "declined"].map((answer) => (
                    <button
                      key={answer}
                      className={own?.rsvp === answer ? "primary" : ""}
                      disabled={action.busy}
                      onClick={() =>
                        action.run(async () => {
                          const assigned = await api.rpc("set_party_rsvp", {
                            target: id,
                            answer,
                          });
                          query.reload();
                          return assigned;
                        }, "Respuesta guardada. Si no quedan cupos, entrarás en lista de espera.")
                      }
                    >
                      {rsvpLabels[answer]}
                    </button>
                  ))}
                {own?.rsvp === "waitlist" && (
                  <span className="badge">
                    Estás en lista de espera. Podés volver a intentar si se
                    libera un lugar.
                  </span>
                )}
                <button onClick={() => downloadCalendar(party)}>
                  Agregar a mi calendario ↓
                </button>
                {host && (
                  <button onClick={() => setEditing(true)}>Editar plan</button>
                )}
              </div>
              {party.mode === "external" && (
                <div className="notice">
                  <p>
                    Actividad externa coordinada. Cada persona utiliza su cuenta
                    y proveedor; no hay retransmisión ni sincronización
                    automática.
                  </p>
                  <OfficialLink url={party.official_url} />
                </div>
              )}
              <details>
                <summary>Reglas del encuentro</summary>
                <p className="preserve-lines">{party.rules}</p>
              </details>
            </section>
            <ActionStatus action={action} />
            {participates && active && (
              <PartyPresence partyId={id} cards={cards} />
            )}
            <div className="room-layout">
              <div>
                {participates ? (
                  <Chat
                    table="party_messages"
                    parentColumn="party_id"
                    parentId={id}
                    userId={userId}
                    enabled={active}
                    title="La conversación del encuentro"
                  />
                ) : (
                  <section className="panel empty">
                    <h2>La conversación está dentro.</h2>
                    <p>
                      Confirmá que vas para entrar al chat. Los mensajes sólo
                      son visibles para participantes.
                    </p>
                  </section>
                )}
                {participates && (
                  <PartyQueue
                    partyId={id}
                    userId={userId}
                    host={host}
                    active={active}
                  />
                )}
              </div>
              <aside>
                <section className="panel">
                  <h2>Nos encontramos acá</h2>
                  <p>
                    Anfitrión:{" "}
                    {host
                      ? "vos"
                      : cards.find((c) => c.id === party.host_id)
                          ?.display_name || "Miembro"}
                  </p>
                  {attendees.map((a) => (
                    <div className="list-row" key={a.user_id}>
                      <div>
                        <strong>
                          {a.user_id === userId
                            ? "Vos"
                            : cards.find((c) => c.id === a.user_id)
                                ?.display_name || "Miembro"}
                        </strong>
                        <small>{rsvpLabels[a.rsvp]}</small>
                      </div>
                      {host && (
                        <button
                          className="text-button danger"
                          disabled={action.busy}
                          onClick={() =>
                            action.run(async () => {
                              await api.insert("party_bans", {
                                party_id: id,
                                user_id: a.user_id,
                              });
                              query.reload();
                            }, "Participante expulsado de la sala.")
                          }
                        >
                          Expulsar
                        </button>
                      )}
                    </div>
                  ))}
                  {!attendees.length && (
                    <p>Vos podés ser la primera compañía.</p>
                  )}
                </section>
                {host && (
                  <section className="panel">
                    <h2>Invitar a alguien</h2>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const user_id = new FormData(e.currentTarget).get(
                          "user_id",
                        );
                        action.run(async () => {
                          await api.insert("party_invites", {
                            party_id: id,
                            user_id,
                          });
                          query.reload();
                        }, "Invitación enviada.");
                      }}
                    >
                      <label>
                        Persona
                        <select name="user_id" required>
                          <option value="">Elegí una persona</option>
                          {cards
                            .filter(
                              (c) =>
                                c.id !== userId &&
                                !invites.some((i) => i.user_id === c.id),
                            )
                            .map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.display_name} · @{c.username}
                              </option>
                            ))}
                        </select>
                      </label>
                      <button disabled={action.busy}>Invitar</button>
                    </form>
                    {invites.map((i) => (
                      <div className="list-row" key={i.user_id}>
                        <small>
                          {cards.find((c) => c.id === i.user_id)
                            ?.display_name || "Miembro"}{" "}
                          · invitado
                        </small>
                        <button
                          className="text-button"
                          onClick={() =>
                            action.run(async () => {
                              await api.remove("party_invites", {
                                party_id: id,
                                user_id: i.user_id,
                              });
                              query.reload();
                            })
                          }
                        >
                          Retirar
                        </button>
                      </div>
                    ))}
                    {!!bans.length && (
                      <details>
                        <summary>Expulsados · {bans.length}</summary>
                        {bans.map((b) => (
                          <div className="list-row" key={b.user_id}>
                            <small>Miembro {b.user_id.slice(0, 8)}</small>
                            <button
                              onClick={() =>
                                action.run(async () => {
                                  await api.remove("party_bans", {
                                    party_id: id,
                                    user_id: b.user_id,
                                  });
                                  query.reload();
                                }, "Expulsión retirada.")
                              }
                            >
                              Readmitir
                            </button>
                          </div>
                        ))}
                      </details>
                    )}
                  </section>
                )}
                <ReportButton table="parties" id={id} />
              </aside>
            </div>
          </>
        );
      }}
    </Feedback>
  );
}
function PartyQueue({ partyId, userId, host, active }) {
  const query = useQuery(
    useCallback(async () => {
      const [queue, contents, votes] = await Promise.all([
        api.list("party_queue", {
          filters: { party_id: partyId },
          select: "*, content_items(*)",
          ascending: true,
        }),
        api.list("content_items"),
        api.list("party_votes", { order: null }),
      ]);
      return { queue, contents, votes };
    }, [partyId]),
  );
  const action = useAction();
  useRealtime("party_queue", "party_id", partyId, query.reload);
  useRealtime("party_votes", null, partyId, query.reload);
  return (
    <section className="panel">
      <h2>¿Qué compartimos después?</h2>
      <p>
        Propuestas y votos de la sala. Abrí cada obra en su proveedor oficial.
      </p>
      <Feedback query={query}>
        {({ queue, contents, votes }) => (
          <>
            {active && (
              <form
                className="inline-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  const content_id = new FormData(e.currentTarget).get(
                    "content_id",
                  );
                  action.run(async () => {
                    await api.insert("party_queue", {
                      party_id: partyId,
                      content_id,
                    });
                    query.reload();
                  }, "Propuesta agregada.");
                }}
              >
                <label>
                  <span className="sr-only">Contenido para proponer</span>
                  <select name="content_id" required>
                    <option value="">Elegí un contenido</option>
                    {contents
                      .filter((c) => !queue.some((q) => q.content_id === c.id))
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                  </select>
                </label>
                <button disabled={action.busy}>Proponer</button>
              </form>
            )}
            {queue.map((q) => {
              const own = votes.some(
                (v) => v.queue_id === q.id && v.user_id === userId,
              );
              return (
                <div className="list-row" key={q.id}>
                  <div>
                    <a href={`#/content/${q.content_id}`}>
                      {q.content_items?.title || "Contenido no disponible"}
                    </a>
                    <small>
                      {votes.filter((v) => v.queue_id === q.id).length} votos
                    </small>
                  </div>
                  <button
                    aria-pressed={own}
                    disabled={!active || action.busy}
                    onClick={() =>
                      action.run(async () => {
                        if (own)
                          await api.remove("party_votes", {
                            queue_id: q.id,
                            user_id: userId,
                          });
                        else
                          await api.insert("party_votes", { queue_id: q.id });
                        query.reload();
                      }, "Voto guardado.")
                    }
                  >
                    {own ? "Retirar voto" : "Votar"}
                  </button>
                  {(host || q.user_id === userId) && (
                    <button
                      className="text-button"
                      disabled={action.busy}
                      onClick={() =>
                        action.run(async () => {
                          await api.remove("party_queue", { id: q.id });
                          query.reload();
                        })
                      }
                    >
                      Retirar
                    </button>
                  )}
                </div>
              );
            })}
            {!queue.length && <p>La lista está abierta a nuevas ideas.</p>}
          </>
        )}
      </Feedback>
      <ActionStatus action={action} />
    </section>
  );
}
