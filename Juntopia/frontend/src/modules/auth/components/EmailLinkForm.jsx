import { useState } from "react";
import { supabase } from "../../../shared/data/client.js";
import {
  consumeEmailLink,
  rememberRecovery,
  recoveryEvent,
} from "../services/emailLinks.js";
export function EmailLinkForm({ close }) {
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  async function submit(event) {
    event.preventDefault();
    if (busy || !supabase) return;
    const form = event.currentTarget,
      value = String(new FormData(form).get("link") || "");
    form.reset();
    setBusy(true);
    setMessage("");
    try {
      const result = await consumeEmailLink(supabase, value, {
        projectUrl: import.meta.env.VITE_SUPABASE_URL,
        appUrl: window.location.origin,
      });
      if (result.recovery) {
        rememberRecovery();
        window.dispatchEvent(new Event(recoveryEvent));
      }
      close();
    } catch {
      setMessage(
        "El enlace no es válido, venció o ya se usó. Pedí otro y copiá el enlace del botón sin abrirlo. Si el correo ya quedó confirmado, podés ingresar normalmente.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <details className="panel">
      <summary>¿El correo abre localhost en otro dispositivo?</summary>
      <p>
        Volvé a Juntopia en este computador. Desde tu correo, copiá el enlace
        del botón sin abrirlo y pegalo acá. También podés pegar la dirección
        completa de la página localhost que no cargó.
      </p>
      <p className="fine-print">
        Usá sólo enlaces de tu propio correo. Contienen acceso a tu cuenta: no
        los compartás con otras personas.
      </p>
      <form onSubmit={submit}>
        <label>
          Enlace privado del correo
          <input
            name="link"
            type="password"
            autoComplete="off"
            spellCheck={false}
            maxLength={20000}
            required
            placeholder="Pegá el enlace completo"
          />
        </label>
        <button disabled={busy || !supabase}>
          {busy ? "Verificando…" : "Usar enlace en este computador"}
        </button>
        <p role="status">{message}</p>
      </form>
    </details>
  );
}
