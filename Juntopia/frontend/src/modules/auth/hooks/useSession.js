import { useEffect, useState } from "react";
import { supabase } from "../../../shared/data/client.js";
import { emailCallbackError } from "../services/authErrors.js";
import {
  recovering,
  rememberRecovery,
  clearRecovery,
  recoveryEvent,
} from "../services/emailLinks.js";
export function useSession() {
  const [callbackError] = useState(() => emailCallbackError(window.location));
  const [state, setState] = useState({
    session: null,
    loading: !!supabase,
    error: "",
  });
  const [recovery, setRecovery] = useState(() => recovering(window.location));
  useEffect(() => {
    if (!supabase) return;
    let active = true;
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      setState({
        session,
        loading: false,
        error: session ? "" : callbackError,
      });
      if (event === "PASSWORD_RECOVERY") {
        rememberRecovery();
        setRecovery(true);
      }
      if (event === "SIGNED_OUT") {
        clearRecovery();
        setRecovery(false);
      }
    });
    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (active)
          setState({
            session: data.session,
            loading: false,
            error: error
              ? "No pudimos restaurar tu sesión."
              : data.session
                ? ""
                : callbackError,
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
  }, [callbackError]);
  useEffect(() => {
    const recover = () => setRecovery(true);
    window.addEventListener(recoveryEvent, recover);
    return () => window.removeEventListener(recoveryEvent, recover);
  }, []);
  return {
    ...state,
    recovery,
    finishRecovery: () => {
      clearRecovery();
      setRecovery(false);
    },
  };
}
