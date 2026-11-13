import { useCallback } from "react";
import { api } from "../lib/api.js";
import { useQuery, useAction } from "../hooks/useQuery.js";
import { ActionStatus, Feedback } from "../components/Feedback.jsx";
import { formatDate } from "../lib/domain.js";
export function Moderation() {
  const query = useQuery(
    useCallback(async () => {
      const allowed = await api.rpc("is_moderator");
      if (!allowed) return { allowed: false, reports: [] };
      return { allowed: true, reports: await api.list("reports") };
    }, []),
  );
  const action = useAction();
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">CUIDEMOS EL REFUGIO</p>
          <h1>Moderación</h1>
        </div>
      </div>
      <ActionStatus action={action} />
      <Feedback query={query}>
        {({ allowed, reports }) =>
          allowed ? (
            <section className="panel">
              {reports.length ? (
                reports.map((r) => (
                  <article className="review" key={r.id}>
                    <div className="tag-list">
                      <span>{r.subject_type}</span>
                      <span>{r.status}</span>
                    </div>
                    <p>{r.reason}</p>
                    <code>{r.subject_id}</code>
                    <small>{formatDate(r.created_at)}</small>
                    <div className="actions">
                      {["reviewed", "dismissed", "remove"].map((decision) => (
                        <button
                          key={decision}
                          disabled={action.busy}
                          onClick={() => {
                            if (
                              decision === "remove" &&
                              !window.confirm(
                                "¿Retirar el contenido reportado? Quedará registrado en la auditoría.",
                              )
                            )
                              return;
                            action.run(async () => {
                              await api.rpc("moderate_report", {
                                target: r.id,
                                decision,
                              });
                              query.reload();
                            }, "Decisión registrada.");
                          }}
                        >
                          {
                            {
                              reviewed: "Marcar revisado",
                              dismissed: "Desestimar",
                              remove: "Retirar contenido",
                            }[decision]
                          }
                        </button>
                      ))}
                    </div>
                  </article>
                ))
              ) : (
                <p>No hay reportes pendientes.</p>
              )}
            </section>
          ) : (
            <p className="empty">
              Sólo las personas designadas como moderadoras pueden acceder a
              esta sección.
            </p>
          )
        }
      </Feedback>
    </>
  );
}
