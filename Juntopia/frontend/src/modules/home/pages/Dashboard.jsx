import { useCallback } from "react";
import { api } from "../../../shared/data/api.js";
import { categories, formatDate } from "../../../shared/domain/index.js";
import { useQuery } from "../../../shared/hooks/useQuery.js";
import { Feedback } from "../../../shared/components/Feedback.jsx";
import { Avatar } from "../../../shared/components/Avatar.jsx";
import { ContentCard } from "../../catalog/components/ContentCard.jsx";
import { PartyCard } from "../../parties/index.js";
import { navigate } from "../../../app/router.js";
export function Dashboard({ profile }) {
  const query = useQuery(
    useCallback(async () => {
      const [contents, parties, friendships, cards, attendees, library] =
        await Promise.all([
          api.list("content_items"),
          api.list("parties", { order: "starts_at", ascending: true }),
          api.list("friendships", { filters: { status: "accepted" } }),
          api.list("member_cards", { order: "display_name" }),
          api.list("party_attendees", { filters: { user_id: profile.id } }),
          api.list("user_content_status", {
            filters: { user_id: profile.id },
            order: null,
          }),
        ]);
      return { contents, parties, friendships, cards, attendees, library };
    }, [profile.id]),
  );
  return (
    <>
      <div className="welcome dashboard-welcome">
        <div>
          <p className="eyebrow">TU PUNTO DE ENCUENTRO</p>
          <h1>
            ¡Hola, <span>{profile.display_name}!</span>{" "}
            <span className="wave" aria-hidden="true">
              ☀
            </span>
          </h1>
          <p>¿Cuál es el plan de hoy?</p>
        </div>
        <div className="avatar-preview">
          <Avatar
            base={profile.avatar_base}
            color={profile.avatar_color}
            options={profile.avatar_options}
          />
        </div>
      </div>
      <div className="dashboard-categories">
        {categories.map((c) => (
          <a
            href={`#/discover/${encodeURIComponent(c.name)}`}
            key={c.name}
            style={{ "--accent": c.color }}
          >
            <span aria-hidden="true">{c.icon}</span>
            <strong>{c.name}</strong>
          </a>
        ))}
      </div>
      <Feedback query={query}>
        {({ contents, parties, friendships, cards, attendees, library }) => {
          const recommended = contents
            .filter(
              (c) =>
                profile.interests.includes(c.category) &&
                !library.some((l) => l.content_id === c.id),
            )
            .slice(0, 4);
          const suggestions = recommended.length
            ? recommended
            : contents.slice(0, 4);
          const upcoming = parties.filter(
            (p) =>
              ["scheduled", "live"].includes(p.status) &&
              new Date(p.starts_at).getTime() + p.duration_minutes * 60000 >
                Date.now(),
          );
          const plans = upcoming.filter(
            (p) =>
              p.host_id === profile.id ||
              attendees.some(
                (a) =>
                  a.party_id === p.id &&
                  ["going", "maybe", "waitlist"].includes(a.rsvp),
              ),
          );
          const friends = cards.filter(
            (c) =>
              friendships.some((f) =>
                [f.requester_id, f.addressee_id].includes(c.id),
              ) && c.id !== profile.id,
          );
          return (
            <div className="home-columns">
              <div>
                <section className="home-section">
                  <div className="section-heading">
                    <div>
                      <h2>✧ Un descubrimiento para vos</h2>
                      <p>
                        {recommended.length
                          ? "Por los intereses que elegiste."
                          : "Aportes recientes de nuestra comunidad."}
                      </p>
                    </div>
                    <a href="#/discover">Ver todo →</a>
                  </div>
                  {suggestions.length ? (
                    <div className="content-grid compact">
                      {suggestions.map((c) => (
                        <ContentCard
                          key={c.id}
                          item={c}
                          onOpen={(id) => navigate(`content/${id}`)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="empty panel">
                      <h3>El primer descubrimiento puede ser tuyo.</h3>
                      <p>
                        Agregá una ficha con un enlace oficial y empezá tu
                        biblioteca.
                      </p>
                      <a href="#/discover">Explorar el catálogo →</a>
                    </div>
                  )}
                </section>
                <section className="home-section">
                  <div className="section-heading">
                    <h2>♧ Nos encontramos en una Party</h2>
                    <a href="#/parties">Ver todas →</a>
                  </div>
                  {upcoming.length ? (
                    <div className="party-grid compact">
                      {upcoming.slice(0, 3).map((p) => (
                        <PartyCard key={p.id} party={p} />
                      ))}
                    </div>
                  ) : (
                    <div className="panel empty">
                      <p>
                        Sin encuentros programados por ahora. Una buena
                        conversación empieza con una invitación.
                      </p>
                      <a className="button-link primary" href="#/parties/new">
                        Crear mi primer plan ↗
                      </a>
                    </div>
                  )}
                </section>
              </div>
              <aside className="home-aside">
                <section className="panel">
                  <div className="section-heading">
                    <h2>Mis amigos</h2>
                    <a href="#/friends">Ver todos →</a>
                  </div>
                  {friends.length ? (
                    friends.slice(0, 5).map((c) => (
                      <a href="#/friends" className="friend-row" key={c.id}>
                        <div className="mini-avatar">
                          <Avatar
                            base={c.avatar_base}
                            color={c.avatar_color}
                            options={c.avatar_options}
                          />
                        </div>
                        <div>
                          <strong>{c.display_name}</strong>
                          <small>@{c.username}</small>
                        </div>
                      </a>
                    ))
                  ) : (
                    <p>
                      Tu círculo empieza con una amistad. Activá tu tarjeta y
                      conocé a otros miembros.
                    </p>
                  )}
                </section>
                <section className="panel">
                  <div className="section-heading">
                    <h2>Mis planes</h2>
                    <a href="#/agenda">Ver agenda →</a>
                  </div>
                  {plans.length ? (
                    plans.slice(0, 4).map((p) => (
                      <a
                        className="agenda-row"
                        href={`#/parties/${p.id}`}
                        key={p.id}
                      >
                        <span aria-hidden="true">✧</span>
                        <div>
                          <strong>{p.title}</strong>
                          <small>{formatDate(p.starts_at)}</small>
                        </div>
                      </a>
                    ))
                  ) : (
                    <p>Tu agenda está abierta a nuevas aventuras.</p>
                  )}
                </section>
                <section className="panel quiet-card">
                  <span aria-hidden="true">☾</span>
                  <h3>Sin prisa, sin scroll infinito.</h3>
                  <p>
                    Una cosa buena para descubrir. Alguien con quien
                    compartirla.
                  </p>
                </section>
              </aside>
            </div>
          );
        }}
      </Feedback>
    </>
  );
}
