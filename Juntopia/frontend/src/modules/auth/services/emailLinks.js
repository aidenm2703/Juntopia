export function authRedirectUrl(location, configured) {
  const url = new URL(configured || location.origin);
  if (
    url.username ||
    url.password ||
    !["https:", "http:"].includes(url.protocol)
  )
    throw new Error("Invalid redirect configuration");
  if (
    url.protocol === "http:" &&
    !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
  )
    throw new Error("HTTPS required for public email redirects");
  url.search = "";
  url.hash = "";
  return url.href;
}
export function parseEmailLink(value, { projectUrl, appUrl }) {
  let url;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error("INVALID_EMAIL_LINK");
  }
  const project = new URL(projectUrl),
    app = new URL(appUrl);
  const verification =
    url.origin === project.origin && url.pathname === "/auth/v1/verify";
  const callback =
    url.origin === app.origin ||
    (["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) &&
      url.protocol === "http:");
  if (
    url.username ||
    url.password ||
    (!verification && !callback) ||
    value.length > 20000
  )
    throw new Error("INVALID_EMAIL_LINK");
  const params = new URLSearchParams(
    url.hash.startsWith("#/") ? "" : url.hash.slice(1),
  );
  for (const [key, item] of url.searchParams)
    if (!params.has(key)) params.set(key, item);
  if (params.has("error") || params.has("error_code"))
    throw new Error("EXPIRED_EMAIL_LINK");
  const type = params.get("type");
  if (params.has("access_token") && params.has("refresh_token"))
    return {
      kind: "session",
      access_token: params.get("access_token"),
      refresh_token: params.get("refresh_token"),
      recovery: type === "recovery",
    };
  const hash =
    params.get("token_hash") || (verification ? params.get("token") : null);
  if (
    hash &&
    ["signup", "email", "recovery", "invite", "magiclink"].includes(type)
  )
    return {
      kind: "verify",
      token_hash: hash,
      type: ["signup", "magiclink"].includes(type) ? "email" : type,
      recovery: type === "recovery",
    };
  if (callback && params.get("code"))
    return { kind: "code", code: params.get("code"), recovery: false };
  throw new Error("INVALID_EMAIL_LINK");
}
export async function consumeEmailLink(client, value, options) {
  const link = parseEmailLink(value, options);
  const result =
    link.kind === "session"
      ? await client.auth.setSession({
          access_token: link.access_token,
          refresh_token: link.refresh_token,
        })
      : link.kind === "verify"
        ? await client.auth.verifyOtp({
            token_hash: link.token_hash,
            type: link.type,
          })
        : await client.auth.exchangeCodeForSession(link.code);
  if (result.error) throw result.error;
  if (!result.data.session) throw new Error("INVALID_EMAIL_LINK");
  return { recovery: link.recovery };
}
export const recoveryEvent = "juntopia:password-recovery";
export const recoveryKey = "juntopia-password-recovery";
export function rememberRecovery() {
  try {
    sessionStorage.setItem(recoveryKey, "true");
  } catch {
    /* UI state only. */
  }
}
export function clearRecovery() {
  try {
    sessionStorage.removeItem(recoveryKey);
  } catch {
    /* UI state only. */
  }
}
export function recovering(location) {
  try {
    return (
      location.hash.includes("type=recovery") ||
      sessionStorage.getItem(recoveryKey) === "true"
    );
  } catch {
    return location.hash.includes("type=recovery");
  }
}
