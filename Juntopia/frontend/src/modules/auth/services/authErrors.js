import { errorMessage } from "../../../shared/domain/index.js";
import { passwordHint } from "./passwordPolicy.js";
const messages = {
  invalid_credentials:
    "El correo o la contraseña no son correctos. Volver a registrar un correo existente no cambia su contraseña. Si no la recordás, usá «Olvidé mi contraseña».",
  otp_expired:
    "El enlace venció o ya se usó. Si tu correo ya está confirmado, ingresá con tu contraseña o recuperala. Si aún falta confirmarlo, pedí un nuevo enlace.",
  access_denied:
    "No pudimos validar ese enlace. Pedí uno nuevo; los enlaces viejos pueden estar vencidos o ya usados.",
  email_not_confirmed:
    "Confirmá tu correo antes de ingresar. Podés pegar el enlace del correo en este computador.",
  user_already_exists:
    "Ese correo ya tiene una cuenta. Usá «Ya tengo cuenta» para ingresar. Si no recordás la contraseña, recuperala.",
  email_exists:
    "Ese correo ya tiene una cuenta. Usá «Ya tengo cuenta» para ingresar. Si no recordás la contraseña, recuperala.",
  email_address_not_authorized:
    "El correo de pruebas de Supabase no puede enviar a esta dirección. Falta configurar SMTP en el proyecto.",
  over_email_send_rate_limit:
    "Supabase alcanzó el límite de envíos de correo. Esperá antes de volver a intentar; para pruebas continuas se necesita SMTP propio.",
  over_request_rate_limit:
    "Hubo demasiadas solicitudes de acceso. Esperá un momento y volvé a intentar.",
  weak_password: "La contraseña no cumple la política configurada en Supabase.",
  PASSWORD_POLICY: passwordHint,
};
export function authErrorMessage(error) {
  return messages[error?.code || error?.details?.code] || errorMessage(error);
}
export function emailCallbackError(location) {
  const params = new URLSearchParams(
    location.hash.startsWith("#/") ? "" : location.hash.slice(1),
  );
  const search = new URLSearchParams(location.search || "");
  const code = params.get("error_code") || search.get("error_code");
  const error = params.get("error") || search.get("error");
  return code || error ? authErrorMessage({ code: code || error }) : "";
}
