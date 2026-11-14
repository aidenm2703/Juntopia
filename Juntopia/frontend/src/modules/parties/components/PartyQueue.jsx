import { useCallback } from "react";
import { api } from "../../../shared/data/api.js";
import {
  useAction,
  useQuery,
  useRealtime,
} from "../../../shared/hooks/useQuery.js";
import {
  Feedback,
  ActionStatus,
} from "../../../shared/components/Feedback.jsx";
export function PartyQueue({ partyId, userId, host, active }) {
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
