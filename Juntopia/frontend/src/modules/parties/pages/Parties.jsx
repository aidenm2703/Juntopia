import { useCallback, useState } from "react";
import { api } from "../../../shared/data/api.js";
import { useQuery, useRealtime } from "../../../shared/hooks/useQuery.js";
import { Feedback } from "../../../shared/components/Feedback.jsx";
import { PartyCard } from "../components/PartyCard.jsx";
import { PartyRoom } from "../components/PartyRoom.jsx";
import { PartyForm } from "../components/PartyForm.jsx";
export function Parties({
  userId,
  id,
  contentId,
  creating = false,
  agenda = false,
}) {
  const [filter, setFilter] = useState("upcoming");
  const query = useQuery(
    useCallback(async () => {
      const [parties, attendees] = await Promise.all([
        api.list("parties", { order: "starts_at", ascending: true }),
        api.list("party_attendees", { filters: { user_id: userId } }),
      ]);
      return { parties, attendees };
    }, [userId]),
  );
  useRealtime("parties", null, userId, query.reload);
  if (creating) return <PartyForm contentId={contentId} />;
  if (id) return <PartyRoom id={id} userId={userId} />;
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">UN PLAN ES MEJOR EN COMPAÑÍA</p>
          <h1>{agenda ? "Mi agenda" : "Parties"}</h1>
          <p>
            {agenda
              ? "Los encuentros que organizás y a los que te sumaste."
              : "Escuchar, leer, jugar, dibujar. Elegí cómo encontrarnos."}
          </p>
        </div>
        <a className="button-link primary" href="#/parties/new">
          ＋ Crear una Party
        </a>
      </div>
      <div className="chips">
        <button
          aria-pressed={filter === "upcoming"}
          onClick={() => setFilter("upcoming")}
        >
          Próximos encuentros
        </button>
        <button
          aria-pressed={filter === "all"}
          onClick={() => setFilter("all")}
        >
          Todos los planes
        </button>
      </div>
      <Feedback query={query}>
        {({ parties, attendees }) => {
          const rows = parties.filter(
            (p) =>
              (!agenda ||
                p.host_id === userId ||
                attendees.some(
                  (a) => a.party_id === p.id && a.rsvp !== "declined",
                )) &&
              (filter === "all" ||
                (["scheduled", "live"].includes(p.status) &&
                  new Date(p.starts_at).getTime() + p.duration_minutes * 60000 >
                    Date.now())),
          );
          return rows.length ? (
            <div className="party-grid">
              {rows.map((p) => (
                <PartyCard
                  key={p.id}
                  party={p}
                  rsvp={attendees.find((a) => a.party_id === p.id)?.rsvp}
                />
              ))}
            </div>
          ) : (
            <section className="panel empty">
              <h2>Hay espacio para un nuevo plan.</h2>
              <p>
                {agenda
                  ? "Cuando crees o te sumes a una Party, aparecerá acá."
                  : "Todavía no hay encuentros disponibles. Podés organizar el primero."}
              </p>
              <a href="#/parties/new">Crear un encuentro →</a>
            </section>
          );
        }}
      </Feedback>
    </>
  );
}
