import { useState } from "react";
import { supabase } from "../../../shared/data/client.js";
import { api } from "../../../shared/data/api.js";
import { errorMessage } from "../../../shared/domain/index.js";
export function Auth({ mode, close }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  async function submit(event) {
    event.preventDefault();
    if (!supabase || busy) return;
    const form = new FormData(event.currentTarget);
    if (mode === "register" && form.get("accepted") !== "on") return;
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    if (mode === "password" && password !== form.get("confirm")) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const redirectTo = window.location.origin + window.location.pathname;
      let result;
      if (mode === "login")
        result = await supabase.auth.signInWithPassword({ email, password });
      else if (mode === "register")
        result = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectTo },
        });
      else if (mode === "reset")
        result = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo,
        });
      else result = await supabase.auth.updateUser({ password });
      if (result.error) throw result.error;
      if (mode === "register" && result.data.session)
        await api.rpc("accept_policy");
      if (mode === "login" || mode === "password" || result.data?.session)
        close();
      else {
        setSent(true);
        setMessage(
          mode === "register"
            ? "Si el registro está disponible para tu correo, recibirás un enlace de confirmación. Revisá también la carpeta de spam."
            : "Si existe una cuenta con ese correo, recibirás un enlace para elegir una nueva contraseña.",
        );
      }
    } catch (error) {
      setMessage(
        error.code === "invalid_credentials"
          ? "El correo o la contraseña no son correctos."
          : error.code === "email_not_confirmed"
            ? "Confirmá tu correo antes de ingresar."
            : error.code === "over_email_send_rate_limit"
              ? "Se alcanzó el límite de correos de acceso. Esperá e intentá de nuevo."
              : errorMessage(error),
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="auth panel" aria-labelledby="auth-title">
      <button className="text-button" onClick={close}>
        ← Volver
      </button>
      <p className="eyebrow">TU LUGAR TE ESPERA</p>
      <h1 id="auth-title">
        {
          {
            login: "Qué bueno verte.",
            register: "Empezá tu camino.",
            reset: "Recuperá tu cuenta.",
            password: "Una nueva contraseña.",
          }[mode]
        }
      </h1>
      <form onSubmit={submit}>
        {mode !== "password" && (
          <label>
            Correo electrónico
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
            />
          </label>
        )}
        {mode !== "reset" && (
          <label>
            Contraseña{mode !== "login" && " · mínimo 12 caracteres"}
            <input
              name="password"
              type="password"
              minLength={mode === "login" ? 1 : 12}
              maxLength={128}
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              required
            />
          </label>
        )}
        {mode === "password" && (
          <label>
            Repetir contraseña
            <input
              name="confirm"
              type="password"
              minLength={12}
              autoComplete="new-password"
              required
            />
          </label>
        )}
        {mode === "register" && (
          <label className="check">
            <input name="accepted" type="checkbox" required />
            <span>
              Leí y acepto las{" "}
              <a href="#/policies" target="_blank" rel="noopener noreferrer">
                reglas y privacidad de la beta
              </a>
              .
            </span>
          </label>
        )}
        {!supabase && (
          <p className="notice">
            Falta configurar la URL y la clave publicable de Supabase.
          </p>
        )}
        <button className="primary" disabled={busy || !supabase || sent}>
          {busy
            ? "Un momento…"
            : {
                login: "Ingresar",
                register: "Crear mi cuenta",
                reset: "Enviar enlace de recuperación",
                password: "Guardar contraseña",
              }[mode]}
        </button>
        <p role="status" aria-live="polite">
          {message}
        </p>
      </form>
      {mode === "login" && (
        <div className="auth-links">
          <a href="#/reset">Olvidé mi contraseña</a>
          <a href="#/register">Crear una cuenta →</a>
        </div>
      )}
      {mode === "register" && <a href="#/login">Ya tengo cuenta →</a>}
    </section>
  );
}
