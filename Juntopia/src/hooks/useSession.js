import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";
export function useSession() {
  const [state, setState] = useState({
    session: null,
    loading: !!supabase,
    error: "",
  });
  const [recovery, setRecovery] = useState(() =>
    window.location.hash.includes("type=recovery"),
  );
  useEffect(() => {
    if (!supabase) return;
    let active = true;
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      setState({ session, loading: false, error: "" });
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
    });
    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (active)
          setState({
            session: data.session,
            loading: false,
            error: error ? "No pudimos restaurar tu sesión." : "",
          });
      })
      .catch(() => {
        if (active)
          setState({
            session: null,
            loading: false,
            error: "No pudimos conectar con el acceso.",
          });
      });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);
  return { ...state, recovery, finishRecovery: () => setRecovery(false) };
}
