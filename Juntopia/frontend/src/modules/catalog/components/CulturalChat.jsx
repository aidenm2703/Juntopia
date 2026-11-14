import { useState } from "react";
import { request } from "../../../shared/data/http.js";
import { errorMessage } from "../../../shared/domain/index.js";
import { navigate } from "../../../app/router.js";
export function CulturalChat({ category = "" }) {
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [messages, setMessages] = useState([]),
    [error, setError] = useState("");
  async function send(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const message = String(new FormData(form).get("message") || "").trim();
    if (!message || busy) return;
    const history = messages
      .slice(-6)
      .map(({ role, text }) => ({ role, text }));
    setMessages((m) => [...m, { role: "user", text: message }].slice(-20));
    form.reset();
    setBusy(true);
    setError("");
    try {
      const data = await request("/catalog/assistant", {
        method: "POST",
        body: { message, history, category },
      });
      setMessages((m) =>
        [
          ...m,
          {
            role: "assistant",
            text: data.message,
            items: data.items.slice(0, 6),
            notice: data.notice,
          },
        ].slice(-20),
      );
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="cultural-chat">
      <button
        className="chat-toggle primary"
        aria-expanded={open}
        aria-controls="cultural-chat"
        onClick={() => setOpen(!open)}
      >
        {open ? "Cerrar asistente" : "✧ Preguntale a Gemini"}
      </button>
      {open && (
        <section
          id="cultural-chat"
          className="chat-panel panel"
          aria-label="Asistente cultural Gemini"
        >
          <div className="section-heading">
            <h2>Tu próxima buena historia</h2>
            <button onClick={() => setMessages([])} disabled={busy}>
              Limpiar
            </button>
          </div>
          <p className="fine-print">
            Gemini usa tus intereses, favoritos y calificaciones para sugerir.
            El texto de esta conversación se envía a Google y no se guarda en tu
            cuenta.
          </p>
          <div className="chat-messages" role="log" aria-live="polite">
            {!messages.length && (
              <p>
                ¿Una película para esta noche, música como Daddy Yankee o un
                libro corto? Contame qué te gusta.
              </p>
            )}
            {messages.map((m, index) => (
              <article className={`chat-message ${m.role}`} key={index}>
                <strong>{m.role === "user" ? "Vos" : "Gemini"}</strong>
                <p className="preserve-lines">{m.text}</p>
                {m.notice && <p className="fine-print">{m.notice}</p>}
                {m.items?.map((i) => (
                  <button
                    className="chat-suggestion"
                    key={i.id}
                    onClick={() => {
                      navigate(`content/${i.id}`);
                      setOpen(false);
                    }}
                  >
                    <span>{i.category}</span>
                    <strong>{i.title}</strong>
                    <small>{i.author} · Guardar y calificar ↗</small>
                  </button>
                ))}
              </article>
            ))}
            {busy && <p role="status">Gemini está buscando ideas…</p>}
          </div>
          {error && <p role="alert">{error}</p>}
          <form onSubmit={send} className="inline-form">
            <label>
              <span className="sr-only">Qué te gustaría descubrir</span>
              <input
                name="message"
                placeholder="Recomendame algo para…"
                required
                maxLength={1000}
                disabled={busy}
              />
            </label>
            <button className="primary" disabled={busy}>
              Enviar
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
