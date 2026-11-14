import { useCallback, useState } from "react";
import { api } from "../../../shared/data/api.js";
import {
  useQuery,
  useAction,
  useRealtime,
} from "../../../shared/hooks/useQuery.js";
import {
  ActionStatus,
  Feedback,
  ReportButton,
} from "../../../shared/components/Feedback.jsx";
import { Avatar } from "../../../shared/components/Avatar.jsx";
import { navigate } from "../../../app/router.js";
export function Friends({ userId }) {
  const [search, setSearch] = useState("");
  const query = useQuery(
    useCallback(async () => {
      const [cards, friendships, blocks] = await Promise.all([
        api.list("member_cards", { order: "display_name", ascending: true }),
        api.list("friendships"),
        api.list("blocks"),
      ]);
      return { cards, friendships, blocks };
    }, []),
  );
  const action = useAction();
  useRealtime("friendships", null, userId, query.reload);
  async function openChat(other) {
    await action.run(async () => {
      const rows = await api.list("conversations");
      const found = rows.find((c) => [c.member_a, c.member_b].includes(other));
      if (found) navigate(`messages/${found.id}`);
      else {
        const created = await api.insert("conversations", { member_b: other });
        navigate(`messages/${created.id}`);
      }
    }, "");
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">DISTINTOS CAMINOS, ALGO EN COMÚN</p>
          <h1>Amigos</h1>
          <p>
            Tu tarjeta está oculta por defecto. Activala en Mi perfil para que
            otras personas puedan encontrarte.
          </p>
        </div>
      </div>
      <label>
        <span className="sr-only">Buscar personas</span>
        <input
          type="search"
          placeholder="Buscar por nombre o identificador…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>
      <ActionStatus action={action} />
      <Feedback query={query}>
        {({ cards, friendships, blocks }) => (
          <>
            <section className="panel">
              <h2>Solicitudes de amistad</h2>
              {friendships
                .filter(
                  (f) => f.status === "pending" && f.addressee_id === userId,
                )
                .map((f) => (
                  <div className="list-row" key={f.id}>
                    <span>
                      {cards.find((c) => c.id === f.requester_id)
                        ?.display_name || "Miembro de Juntopia"}
                    </span>
                    <button
                      disabled={action.busy}
                      onClick={() =>
                        action.run(async () => {
                          await api.update(
                            "friendships",
                            { status: "accepted" },
                            { id: f.id },
                          );
                          query.reload();
                        }, "Amistad aceptada.")
                      }
                    >
                      Aceptar
                    </button>
                    <button
                      disabled={action.busy}
                      onClick={() =>
                        action.run(async () => {
                          await api.update(
                            "friendships",
                            { status: "rejected" },
                            { id: f.id },
                          );
                          query.reload();
                        }, "Solicitud rechazada.")
                      }
                    >
                      Rechazar
                    </button>
                  </div>
                ))}
              {!friendships.some(
                (f) => f.status === "pending" && f.addressee_id === userId,
              ) && <p>No tenés solicitudes pendientes.</p>}
            </section>
            <div className="people-grid">
              {cards
                .filter(
                  (c) =>
                    c.id !== userId &&
                    `${c.display_name} ${c.username}`
                      .toLowerCase()
                      .includes(search.toLowerCase()),
                )
                .map((card) => {
                  const friendship = friendships.find((f) =>
                    [f.requester_id, f.addressee_id].includes(card.id),
                  );
                  const accepted = friendship?.status === "accepted";
                  return (
                    <article className="panel person-card" key={card.id}>
                      <div className="avatar-preview">
                        <Avatar
                          base={card.avatar_base}
                          color={card.avatar_color}
                        />
                      </div>
                      <h2>{card.display_name}</h2>
                      <small>@{card.username}</small>
                      <p>{card.bio || "Un nuevo camino por conocer."}</p>
                      <div className="actions">
                        {accepted ? (
                          <>
                            <span className="badge">Amigos</span>
                            <button
                              disabled={action.busy}
                              onClick={() => openChat(card.id)}
                            >
                              Conversar →
                            </button>
                          </>
                        ) : friendship?.status === "pending" ? (
                          <span className="badge">Solicitud pendiente</span>
                        ) : (
                          !friendship && (
                            <button
                              disabled={action.busy}
                              onClick={() =>
                                action.run(async () => {
                                  await api.insert("friendships", {
                                    addressee_id: card.id,
                                  });
                                  query.reload();
                                }, "Solicitud enviada.")
                              }
                            >
                              Agregar amistad
                            </button>
                          )
                        )}
                        {friendship && (
                          <button
                            className="text-button"
                            disabled={action.busy}
                            onClick={() =>
                              action.run(async () => {
                                await api.remove("friendships", {
                                  id: friendship.id,
                                });
                                query.reload();
                              }, "Vínculo retirado.")
                            }
                          >
                            {friendship.status === "accepted"
                              ? "Retirar amistad"
                              : "Retirar solicitud"}
                          </button>
                        )}
                        <button
                          className="text-button danger"
                          disabled={action.busy}
                          onClick={() => {
                            if (
                              window.confirm(
                                `¿Bloquear a ${card.display_name}? No podrán conversar ni acceder a los planes del otro.`,
                              )
                            )
                              action.run(async () => {
                                await api.insert("blocks", {
                                  blocked_id: card.id,
                                });
                                query.reload();
                              }, "Persona bloqueada.");
                          }}
                        >
                          Bloquear
                        </button>
                      </div>
                      <ReportButton table="member_cards" id={card.id} />
                    </article>
                  );
                })}
            </div>
            {cards.filter((c) => c.id !== userId).length === 0 && (
              <p className="empty">
                Todavía no hay personas visibles. Cada quien decide cuándo
                compartir su tarjeta.
              </p>
            )}
            <details className="panel">
              <summary>Personas bloqueadas · {blocks.length}</summary>
              {blocks.map((b) => (
                <div className="list-row" key={b.blocked_id}>
                  <span>Miembro {b.blocked_id.slice(0, 8)}</span>
                  <button
                    disabled={action.busy}
                    onClick={() =>
                      action.run(async () => {
                        await api.remove("blocks", {
                          blocker_id: userId,
                          blocked_id: b.blocked_id,
                        });
                        query.reload();
                      }, "Bloqueo retirado.")
                    }
                  >
                    Desbloquear
                  </button>
                </div>
              ))}
            </details>
          </>
        )}
      </Feedback>
    </>
  );
}
