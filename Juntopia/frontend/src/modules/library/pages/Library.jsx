import { useCallback, useState } from "react";
import { api } from "../../../shared/data/api.js";
import { readingStates } from "../../../shared/domain/index.js";
import { useQuery } from "../../../shared/hooks/useQuery.js";
import { Feedback } from "../../../shared/components/Feedback.jsx";
import { ContentCard } from "../../catalog/components/ContentCard.jsx";
import { navigate } from "../../../app/router.js";
export function Library({ userId }) {
  const [filter, setFilter] = useState("all");
  const query = useQuery(
    useCallback(
      () =>
        api.list("user_content_status", {
          filters: { user_id: userId },
          order: null,
          select: "*, content_items(*)",
          limit: 200,
        }),
      [userId],
    ),
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">TUS PEQUEÑOS GRANDES MUNDOS</p>
          <h1>Mi biblioteca</h1>
          <p>Privada, a tu ritmo y sin pendientes obligatorios.</p>
        </div>
        <a href="#/discover">Descubrir algo nuevo ↗</a>
      </div>
      <div className="chips">
        <button
          aria-pressed={filter === "all"}
          onClick={() => setFilter("all")}
        >
          Todo
        </button>
        <button
          aria-pressed={filter === "favorites"}
          onClick={() => setFilter("favorites")}
        >
          ♡ Favoritos
        </button>
        {Object.entries(readingStates).map(([value, label]) => (
          <button
            key={value}
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>
      <Feedback
        query={query}
        empty="Tu biblioteca está esperando su primera historia. Guardá una ficha desde Descubrir."
      >
        {(rows) => {
          const found = rows.filter(
            (row) =>
              row.content_items &&
              (filter === "all" ||
                (filter === "favorites"
                  ? row.favorite
                  : row.status === filter)),
          );
          return found.length ? (
            <div className="content-grid">
              {found.map((row) => (
                <div key={row.content_id}>
                  <ContentCard
                    item={row.content_items}
                    onOpen={(id) => navigate(`content/${id}`)}
                  />
                  <p className="card-caption">
                    {row.favorite && "♡ "}
                    {readingStates[row.status]} · {row.progress}%
                  </p>
                  <div className="tag-list">
                    {row.emotional_tags.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty">No hay contenidos en este estado.</p>
          );
        }}
      </Feedback>
    </>
  );
}
