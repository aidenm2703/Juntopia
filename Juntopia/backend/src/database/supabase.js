import { createClient } from "@supabase/supabase-js";
export function createUserDatabase(config, token) {
  return createClient(config.supabaseUrl, config.supabaseKey, {
    global: {
      headers: { Authorization: `Bearer ${token}` },
      fetch: (url, options = {}) =>
        fetch(url, {
          ...options,
          signal: options.signal || AbortSignal.timeout(15000),
        }),
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
