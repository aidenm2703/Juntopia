import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { useQuery, useRealtime } from "../hooks/useQuery.js";
export function PartyPresence({ partyId, cards }) {
  const query = useQuery(
    useCallback(
      () =>
        api.list("party_presence", {
          filters: { party_id: partyId },
          order: "seen_at",
        }),
      [partyId],
    ),
  );
  useEffect(() => {
    const heartbeat = () =>
      api
        .rpc("party_heartbeat", { target: partyId })
        .then(query.reload)
        .catch(() => {});
    heartbeat();
    const timer = setInterval(heartbeat, 25000);
    return () => clearInterval(timer);
  }, [partyId, query.reload]);
  useRealtime("party_presence", "party_id", partyId, query.reload);
  return (
    <p className="fine-print" role="status">
      {query.error
        ? "La presencia no está disponible."
        : query.data?.length
          ? `En la sala recientemente: ${query.data.map((p) => cards.find((c) => c.id === p.user_id)?.display_name || "Miembro").join(", ")}.`
          : "La presencia es opcional. Activala desde Mi perfil si querés compartir que estás en la sala."}
    </p>
  );
}
export function Countdown({ startsAt, status }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const seconds = Math.max(
    0,
    Math.floor((new Date(startsAt).getTime() - now) / 1000),
  );
  if (status !== "scheduled") return null;
  if (seconds === 0)
    return (
      <p className="fine-print">
        Llegó la hora del encuentro. El anfitrión puede marcarlo en vivo.
      </p>
    );
  const days = Math.floor(seconds / 86400),
    hours = Math.floor((seconds % 86400) / 3600),
    minutes = Math.floor((seconds % 3600) / 60);
  return (
    <p className="countdown" aria-label="Tiempo para el encuentro">
      Nos encontramos en {days ? `${days} d ` : ""}
      {hours} h {minutes} min {seconds % 60} s
    </p>
  );
}
