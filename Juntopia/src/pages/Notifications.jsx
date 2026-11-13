import { useCallback } from "react";
import { api } from "../lib/api.js";
import { formatDate } from "../lib/domain.js";
import { useAction, useQuery, useRealtime } from "../hooks/useQuery.js";
import { ActionStatus, Feedback } from "../components/Feedback.jsx";
export function Notifications({ userId }) {
  const query = useQuery(
    useCallback(
      () => api.list("notifications", { filters: { user_id: userId } }),
      [userId],
    ),
  );
  const action = useAction();
  useRealtime("notifications", "user_id", userId, query.reload);
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">SEÑALES DEL REFUGIO</p>
          <h1>Notificaciones</h1>
        </div>
        <button
          disabled={action.busy}
          onClick={() =>
            action.run(async () => {
              await api.update(
                "notifications",
                { is_read: true },
                { user_id: userId, is_read: false },
              );
              query.reload();
            }, "Notificaciones marcadas como leídas.")
          }
        >
          Marcar todas como leídas
        </button>
      </div>
      <ActionStatus action={action} />
      <Feedback
        query={query}
        empty="Todo está tranquilo. Tus invitaciones, solicitudes y mensajes aparecerán acá."
      >
        {(rows) => (
          <div className="panel">
            {rows.map((n) => (
              <div
                key={n.id}
                className={`list-row notification ${n.is_read ? "" : "unread"}`}
              >
                <a
                  href={`#/${n.destination}`}
                  onClick={() =>
                    action.run(async () => {
                      await api.update(
                        "notifications",
                        { is_read: true },
                        { id: n.id },
                      );
                      query.reload();
                    }, "")
                  }
                >
                  <strong>{n.title}</strong>
                  <small>{formatDate(n.created_at)}</small>
                </a>
                {!n.is_read && <span className="badge">Nueva</span>}
              </div>
            ))}
          </div>
        )}
      </Feedback>
    </>
  );
}
