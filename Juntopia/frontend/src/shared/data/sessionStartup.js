export function authStorageKey(projectUrl) {
  return `sb-${new URL(projectUrl).hostname.split(".")[0]}-auth-token`;
}
export function prepareSessionStartup({
  persistSession,
  projectUrl,
  storage,
  recoveryStorage,
  location,
  history,
}) {
  if (persistSession) return;
  try {
    storage.removeItem(authStorageKey(projectUrl));
  } catch {
    /* Storage may be unavailable. */
  }
  const search = new URLSearchParams(location.search || "");
  const callback = new URLSearchParams(
    location.hash.startsWith("#/") ? "" : location.hash.slice(1),
  );
  if (
    [
      "access_token",
      "refresh_token",
      "token_hash",
      "code",
      "error",
      "error_code",
    ].some((key) => callback.has(key) || search.has(key))
  )
    return;
  try {
    recoveryStorage.removeItem("juntopia-password-recovery");
  } catch {
    /* UI state only. */
  }
  const route = location.hash.startsWith("#/") ? location.hash.slice(2) : "";
  if (!["register", "login", "reset", "policies"].includes(route))
    history.replaceState(
      null,
      "",
      location.pathname + (location.search || "") + "#/register",
    );
}
