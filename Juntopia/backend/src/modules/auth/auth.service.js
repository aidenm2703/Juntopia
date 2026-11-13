import { createClient } from "@supabase/supabase-js";
import { ApiError } from "../../shared/errors.js";
import { requirePassword } from "./password.policy.js";
import { object } from "../../shared/resource.js";
import { authFailure } from "./auth.errors.js";
export async function register(config, input, makeClient = createClient) {
  object(input);
  const password = requirePassword(input.password);
  if (
    typeof input.email !== "string" ||
    input.email.length > 254 ||
    !/^\S+@\S+\.\S+$/.test(input.email) ||
    input.accepted !== true
  )
    throw new ApiError(
      400,
      "INVALID_REGISTRATION",
      "Revisá el correo y aceptá las reglas para continuar.",
    );
  let redirect;
  try {
    redirect = new URL(input.redirectTo);
  } catch {
    throw new ApiError(
      400,
      "INVALID_REDIRECT",
      "La dirección de retorno no es válida.",
    );
  }
  if (
    !config.origins.includes(redirect.origin) ||
    redirect.username ||
    redirect.password ||
    redirect.search ||
    redirect.hash
  )
    throw new ApiError(
      400,
      "INVALID_REDIRECT",
      "La dirección de retorno no está permitida.",
    );
  const client = makeClient(config.supabaseUrl, config.supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: (url, options = {}) =>
        fetch(url, { ...options, signal: AbortSignal.timeout(15000) }),
    },
  });
  const { data, error } = await client.auth.signUp({
    email: input.email.trim(),
    password,
    options: { emailRedirectTo: redirect.href },
  });
  if (error) throw authFailure(error);
  return {
    session: data.session,
    user: data.user ? { id: data.user.id } : null,
  };
}
export async function changePassword(config, context, input) {
  object(input);
  const password = requirePassword(input.password);
  const response = await fetch(config.supabaseUrl + "/auth/v1/user", {
    method: "PUT",
    headers: {
      apikey: config.supabaseKey,
      Authorization: `Bearer ${context.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
    signal: AbortSignal.timeout(15000),
  });
  const body = await response.json();
  if (!response.ok)
    throw authFailure({
      ...body,
      status: response.status,
      code: body.code || body.error_code,
    });
  return { updated: true };
}
