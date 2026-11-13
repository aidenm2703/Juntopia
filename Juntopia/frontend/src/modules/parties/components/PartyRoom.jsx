import { useCallback, useState } from "react";
import { api } from "../../../shared/data/api.js";
import {
  useAction,
  useQuery,
  useRealtime,
} from "../../../shared/hooks/useQuery.js";
import {
  Feedback,
  ActionStatus,
  ReportButton,
} from "../../../shared/components/Feedback.jsx";
import {
  formatDate,
  partyStates,
  rsvpLabels,
  downloadCalendar,
} from "../../../shared/domain/index.js";
import { OfficialLink } from "../../catalog/index.js";
import { Chat } from "../../../shared/components/Chat.jsx";
import { Countdown, PartyPresence } from "./PartyPresence.jsx";
import { PartyForm } from "./PartyForm.jsx";
import { PartyQueue } from "./PartyQueue.jsx";
export function PartyRoom({ id, userId }) {
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
