import { useCallback, useEffect, useRef } from "react";
import { api } from "../lib/api.js";
import { formatDate } from "../lib/domain.js";
import { useAction, useQuery, useRealtime } from "../hooks/useQuery.js";
import { ActionStatus, Feedback, ReportButton } from "./Feedback.jsx";
export function Chat({
  table,
  parentColumn,
  parentId,
  userId,
  enabled = true,
  title = "Conversación",
}) {
  const query = useQuery(
    useCallback(
      () =>
        api.list(table, { filters: { [parentColumn]: parentId }, limit: 100 }),
      [table, parentColumn, parentId],
    ),
  );
  const action = useAction();
  const status = useRealtime(table, parentColumn, parentId, query.reload);
  const end = useRef(null);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest" });
  }, [query.data?.length]);
  return (
    <section className="panel chat-panel">
      <div className="section-heading">
        <h2>{title}</h2>
        <small className="connection-status" role="status">
          {status === "SUBSCRIBED"
            ? "● Conectado"
            : "Reconectando · actualización cada 30 s"}
        </small>
      </div>
      <div className="chat-log" role="log" aria-label={title}>
        <Feedback
          query={query}
          empty="Todavía no hay mensajes. Un hola puede ser un buen comienzo."
        >
          {(rows) =>
            [...rows].reverse().map((m) => (
              <article
                className={`chat-bubble ${m.user_id === userId ? "mine" : ""}`}
                key={m.id}
              >
                <small>
                  {m.user_id === userId ? "Vos" : "Miembro"} ·{" "}
                  {formatDate(m.created_at)}
                </small>
                <p className="preserve-lines">{m.body}</p>
                {m.user_id !== userId && (
                  <ReportButton table={table} id={m.id} />
                )}{" "}
                {m.user_id === userId && (
                  <button
                    className="text-button"
                    disabled={action.busy}
                    onClick={() =>
                      action.run(async () => {
                        await api.remove(table, { id: m.id });
                        query.reload();
                      }, "Mensaje retirado.")
                    }
                  >
                    Retirar
                  </button>
                )}
              </article>
            ))
          }
        </Feedback>
        <div ref={end} />
      </div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const body = String(new FormData(form).get("body")).trim();
          if (!body) return;
          const res = await action.run(
            () => api.insert(table, { [parentColumn]: parentId, body }),
            "Mensaje enviado.",
          );
          if (res?.ok) {
            form.reset();
            query.reload();
          }
        }}
      >
        <label>
          <span className="sr-only">Escribir mensaje</span>
          <textarea
            name="body"
            placeholder={
              enabled ? "Compartí algo…" : "Unite al plan para participar."
            }
            maxLength={2000}
            required
            disabled={!enabled}
          />
        </label>
        <button className="primary" disabled={!enabled || action.busy}>
          Enviar →
        </button>
      </form>
      <ActionStatus action={action} />
      <small className="muted">Se muestran los últimos 100 mensajes.</small>
    </section>
  );
}
