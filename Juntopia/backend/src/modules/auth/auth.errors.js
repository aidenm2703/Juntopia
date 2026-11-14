import { ApiError } from "../../shared/errors.js";
const messages = {
  user_already_exists:
    "Ese correo ya tiene una cuenta. Usá «Ya tengo cuenta» para ingresar o recuperá tu contraseña.",
  email_exists:
    "Ese correo ya tiene una cuenta. Usá «Ya tengo cuenta» para ingresar o recuperá tu contraseña.",
  email_address_not_authorized:
    "El correo de pruebas de Supabase no puede enviar a esta dirección. El proyecto necesita configurar un proveedor SMTP.",
  email_address_invalid:
    "El servicio de acceso rechazó el correo. Revisá que sea una dirección válida.",
  over_email_send_rate_limit:
    "Supabase alcanzó el límite de envíos de correo. Esperá antes de reintentar; para pruebas continuas se necesita SMTP propio.",
  over_request_rate_limit:
    "Hubo demasiadas solicitudes de acceso. Esperá un momento antes de reintentar.",
  email_provider_disabled:
    "El acceso por correo no está habilitado en el proyecto. Hay que revisar la configuración de Supabase Auth.",
  signup_disabled:
    "El registro está deshabilitado en el proyecto. Hay que habilitarlo en Supabase Auth.",
  email_not_confirmed:
    "Confirmá tu correo antes de ingresar. Podés usar el enlace del correo en este computador.",
  weak_password: "La contraseña no cumple la política configurada en Supabase.",
  same_password: "Elegí una contraseña diferente de la actual.",
};
export function authUnavailable(error) {
  return (
    ["AuthRetryableFetchError", "AbortError", "TimeoutError"].includes(
      error?.name,
    ) ||
    ["EACCES", "ECONNREFUSED", "ENOTFOUND", "ETIMEDOUT"].includes(
      error?.cause?.code,
    )
  );
}
export function authFailure(error) {
  if (authUnavailable(error))
    return new ApiError(
      503,
      "AUTH_SERVICE_UNAVAILABLE",
      "El backend no pudo conectarse con Supabase Auth. No es un error de tu contraseña; revisá la conexión del servidor.",
    );
  const code =
    typeof error?.code === "string" && /^[a-z0-9_]+$/i.test(error.code)
      ? error.code
      : "AUTH_FAILED";
  return new ApiError(
    error?.status === 429 ? 429 : 400,
    code,
    messages[code] ||
      "El servicio de acceso rechazó la solicitud. Volvé a intentar; si ya tenés una cuenta, usá «Ya tengo cuenta».",
  );
}
