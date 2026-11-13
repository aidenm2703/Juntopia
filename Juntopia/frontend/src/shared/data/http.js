import { supabase } from "./client.js";
const base = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");
export async function publicRequest(path, body) {
  const response = await fetch(base + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const failure = new Error(
      payload?.error?.message || "No pudimos completar la solicitud.",
    );
    failure.code = payload?.error?.code;
    failure.status = response.status;
    throw failure;
  }
  return payload.data;
}
export async function request(
  path,
  { method = "GET", body, binary = false, contentType } = {},
) {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) {
    const failure = new Error("Ingresá para continuar.");
    failure.status = 401;
    throw failure;
  }
  const headers = { Authorization: `Bearer ${data.session.access_token}` };
  if (body !== undefined)
    headers["Content-Type"] = binary ? contentType : "application/json";
  const response = await fetch(base + path, {
    method,
    headers,
    body: body === undefined ? undefined : binary ? body : JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const failure = new Error(
      payload?.error?.message || "El backend no pudo completar la solicitud.",
    );
    failure.code = payload?.error?.code;
    failure.status = response.status;
    throw failure;
  }
  if (!payload || !Object.hasOwn(payload, "data"))
    throw new Error("El backend devolvió una respuesta no válida.");
  return payload.data;
}
