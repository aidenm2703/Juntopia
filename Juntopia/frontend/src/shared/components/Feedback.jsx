import { useState } from "react";
import { api } from "../data/api.js";
import { useAction } from "../hooks/useQuery.js";
export function Feedback({
  query,
  children,
  empty = "Todavía no hay nada por aquí.",
}) {
  if (query.loading && !query.data)
    return (
      <p className="empty" role="status">
        Abriendo el refugio…
      </p>
    );
  if (query.error)
    return (
      <div className="empty">
        <p role="alert">{query.error}</p>
        <button onClick={query.reload}>Reintentar</button>
      </div>
    );
  if (!query.data || (Array.isArray(query.data) && !query.data.length))
    return <p className="empty">{empty}</p>;
  return children(query.data);
}
export function ActionStatus({ action }) {
  return (
    <p className="action-status" role="status" aria-live="polite">
      {action.message}
    </p>
  );
}
export function ReportButton({ table, id }) {
  const [open, setOpen] = useState(false);
  const action = useAction();
  return (
    <div className="report">
      <button
        className="text-button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        Reportar
      </button>
      {open && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const reason = new FormData(e.currentTarget).get("reason");
            const result = await action.run(
              () => api.report(table, id, reason),
              "Recibimos el reporte. Gracias por cuidar este espacio.",
            );
            if (result?.ok) setOpen(false);
          }}
        >
          <label>
            ¿Qué ocurrió?
            <textarea name="reason" minLength={5} maxLength={1000} required />
          </label>
          <button disabled={action.busy}>Enviar reporte</button>
        </form>
      )}
      <ActionStatus action={action} />
    </div>
  );
}
