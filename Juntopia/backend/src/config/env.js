export function loadConfig(env = process.env) {
  const port = Number(env.PORT || 4000);
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error("PORT debe ser un puerto válido.");
  let url;
  try {
    url = new URL(env.SUPABASE_URL);
  } catch {
    throw new Error("Configurá SUPABASE_URL en backend/.env.local.");
  }
  if (url.protocol !== "https:" || url.username || url.password)
    throw new Error("SUPABASE_URL debe ser una URL HTTPS sin credenciales.");
  if (!env.SUPABASE_PUBLISHABLE_KEY)
    throw new Error(
      "Configurá SUPABASE_PUBLISHABLE_KEY en backend/.env.local.",
    );
  const origins = (
    env.FRONTEND_ORIGINS || "http://localhost:3000,http://127.0.0.1:3000"
  )
    .split(",")
    .map((value) => new URL(value.trim()).origin);
  return Object.freeze({
    port,
    host: env.HOST || "127.0.0.1",
    supabaseUrl: url.origin,
    supabaseKey: env.SUPABASE_PUBLISHABLE_KEY,
    origins,
    jsonLimit: 512 * 1024,
    uploadLimit: 5 * 1024 * 1024,
    requestsPerMinute: 240,
    geminiKey: env.GEMINI_API_KEY || "",
    geminiModel: /^[a-z0-9.-]+$/.test(env.GEMINI_MODEL || "")
      ? env.GEMINI_MODEL
      : "gemini-3.5-flash-lite",
  });
}
