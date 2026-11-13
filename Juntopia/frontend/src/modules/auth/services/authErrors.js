import { errorMessage } from "../../../shared/domain/index.js";
import { passwordHint } from "./passwordPolicy.js";
const messages = {
  invalid_credentials: "El correo o la contraseña no son correctos.",
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
  return messages[error?.code] || errorMessage(error);
}
