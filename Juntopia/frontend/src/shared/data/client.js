import { createClient } from "@supabase/supabase-js";
import { prepareSessionStartup } from "./sessionStartup.js";
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const persistSession = import.meta.env.VITE_AUTH_PERSIST_SESSION !== "false";
if (url && typeof window !== "undefined")
  prepareSessionStartup({
    persistSession,
    projectUrl: url,
    location: window.location,
    history: window.history,
    storage: { removeItem: (key) => window.localStorage.removeItem(key) },
    recoveryStorage: {
      removeItem: (key) => window.sessionStorage.removeItem(key),
    },
    sessionStorage: {
      getItem: (key) => window.sessionStorage.getItem(key),
    },
  });
export const supabase =
  import.meta.hot?.data.supabase ||
  (url && key
    ? createClient(url, key, {
        auth: {
          persistSession: true,
          ...(persistSession || typeof window === "undefined"
            ? {}
            : { storage: window.sessionStorage }),
        },
      })
    : null);
if (import.meta.hot)
  import.meta.hot.dispose((data) => {
    data.supabase = supabase;
  });
