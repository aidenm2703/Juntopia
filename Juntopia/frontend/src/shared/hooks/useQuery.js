import { useCallback, useEffect, useState } from "react";
import { supabase } from "../data/client.js";
import { errorMessage } from "../domain/index.js";
export function useQuery(loader) {
  const [state, setState] = useState({ data: null, loading: true, error: "" });
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion((v) => v + 1), []);
  useEffect(() => {
    let active = true;
    Promise.resolve().then(async () => {
      if (!active) return;
      setState((s) => ({ ...s, loading: true, error: "" }));
      try {
        const data = await loader();
        if (active) setState({ data, loading: false, error: "" });
      } catch (error) {
        if (active)
          setState({ data: null, loading: false, error: errorMessage(error) });
      }
    });
    return () => {
      active = false;
    };
  }, [loader, version]);
  useEffect(() => {
    window.addEventListener("online", reload);
    return () => window.removeEventListener("online", reload);
  }, [reload]);
  return { ...state, reload };
}
export function useAction() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function run(action, success = "Listo, guardamos tus cambios.") {
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      const value = await action();
      setMessage(success);
      return { ok: true, value };
    } catch (error) {
      setMessage(errorMessage(error));
      return { ok: false };
    } finally {
      setBusy(false);
    }
  }
  return { busy, message, run };
}
export function useRealtime(table, column, id, reload) {
  const [status, setStatus] = useState("CONNECTING");
  useEffect(() => {
    if (!id || !supabase) return;
    const channel = supabase
      .channel(`${table}:${id}:${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          ...(column ? { filter: `${column}=eq.${id}` } : {}),
        },
        reload,
      )
      .subscribe((next) => {
        setStatus(next);
        if (next === "SUBSCRIBED") reload();
      });
    // Revalidate permissions and missed events on reconnect, tab focus, and while open.
    const timer = setInterval(reload, 30000);
    window.addEventListener("focus", reload);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", reload);
      supabase.removeChannel(channel);
    };
  }, [table, column, id, reload]);
  return status;
}
