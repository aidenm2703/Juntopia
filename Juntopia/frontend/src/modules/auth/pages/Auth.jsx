import { useState } from "react";
import { supabase } from "../../../shared/data/client.js";
import { api } from "../../../shared/data/api.js";
import { authErrorMessage } from "../services/authErrors.js";
import { request, publicRequest } from "../../../shared/data/http.js";
import {
  passwordHint,
  passwordPattern,
  validPassword,
} from "../services/passwordPolicy.js";
import { authRedirectUrl } from "../services/emailLinks.js";
import { EmailLinkForm } from "../components/EmailLinkForm.jsx";
export function Auth({ mode, close }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  async function resendConfirmation(event) {
    const emailInput = event.currentTarget.form.elements.email;
    if (!emailInput.reportValidity() || !supabase || busy) return;
    setBusy(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: emailInput.value.trim(),
        options: {
          emailRedirectTo: authRedirectUrl(
            window.location,
            import.meta.env.VITE_AUTH_REDIRECT_URL,
          ),
        },
      });
      if (error) throw error;
      setMessage(
        "Si la cuenta está pendiente de confirmación, recibirás un enlace nuevo. Revisá spam y usá únicamente el último correo. Si ya está confirmada, ingresá o recuperá tu contraseña.",
      );
    } catch (error) {
      setMessage(authErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  async function submit(event) {
    event.preventDefault();
    if (!supabase || busy) return;
    const form = new FormData(event.currentTarget);
    if (mode === "register" && form.get("accepted") !== "on") return;
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    if (["register", "password"].includes(mode) && !validPassword(password)) {
      setMessage(passwordHint);
      return;
    }
    if (mode === "password" && password !== form.get("confirm")) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const redirectTo = authRedirectUrl(
        window.location,
        import.meta.env.VITE_AUTH_REDIRECT_URL,
      );
      let result;
      if (mode === "login")
        result = await supabase.auth.signInWithPassword({ email, password });
      else if (mode === "register") {
        const data = await publicRequest("/auth/register", {
          email,
          password,
          redirectTo,
          accepted: true,
        });
        if (data.session) {
          const imported = await supabase.auth.setSession(data.session);
          if (imported.error) throw imported.error;
        }
        result = { data, error: null };
      } else if (mode === "reset")
        result = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo,
        });
      else {
        await request("/auth/password", { method: "POST", body: { password } });
        result = { data: {}, error: null };
      }
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
      setMessage(authErrorMessage(error));
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
            Contraseña
            {mode !== "login" && " · mínimo 8 caracteres y una mayúscula"}
            <input
              name="password"
              type="password"
              minLength={mode === "login" ? 1 : 8}
              pattern={mode === "login" ? undefined : passwordPattern}
              title={mode === "login" ? undefined : passwordHint}
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
              minLength={8}
              pattern={passwordPattern}
              title={passwordHint}
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
        {sent && (
          <button
            type="button"
            className="text-button"
            onClick={() => {
              setSent(false);
              setMessage("");
            }}
          >
            Volver a enviar un enlace
          </button>
        )}
        {["register", "login"].includes(mode) && (
          <button
            type="button"
            className="text-button"
            disabled={busy || !supabase}
            onClick={resendConfirmation}
          >
            Reenviar confirmación de correo
          </button>
        )}
      </form>
      {mode === "login" && (
        <div className="auth-links">
          <a href="#/reset">Olvidé mi contraseña</a>
          <a href="#/register">Crear una cuenta →</a>
        </div>
      )}
      {mode === "register" && <a href="#/login">Ya tengo cuenta →</a>}
      {mode !== "password" && <EmailLinkForm close={close} />}
    </section>
  );
}
