import { useCallback, useState } from "react";
import { api } from "../../../shared/data/api.js";
import { readingStates } from "../../../shared/domain/index.js";
import { useAction, useQuery } from "../../../shared/hooks/useQuery.js";
import {
  Feedback,
  ActionStatus,
  ReportButton,
} from "../../../shared/components/Feedback.jsx";
import { OfficialLink } from "../components/ContentCard.jsx";
import { navigate } from "../../../app/router.js";
export function ContentDetail({ id, userId }) {
  const query = useQuery(
    useCallback(async () => {
      const [item, library, reviews, collections] = await Promise.all([
        api.one("content_items", id),
        api.list("user_content_status", {
          filters: { user_id: userId, content_id: id },
          order: null,
        }),
        api.list("reviews", { filters: { content_id: id } }),
        api.list("collections", { filters: { user_id: userId } }),
      ]);
      return item ? { item, saved: library[0], reviews, collections } : null;
    }, [id, userId]),
  );
  return (
    <Feedback
      query={query}
      empty="Esta ficha no está disponible o no tenés acceso."
    >
      {(data) => (
        <Detail key={id} data={data} userId={userId} reload={query.reload} />
      )}
    </Feedback>
  );
}
function Detail({
  data: { item, saved, reviews, collections },
  userId,
  reload,
}) {
  const action = useAction();
  const ownReview = reviews.find((r) => r.user_id === userId);
  const [status, setStatus] = useState(saved?.status || "pending");
  const [favorite, setFavorite] = useState(saved?.favorite || false);
  async function save(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await action.run(async () => {
      await api.upsert(
        "user_content_status",
        {
          user_id: userId,
          content_id: item.id,
          status,
          favorite,
          progress: Number(form.get("progress")),
          emotional_tags: String(form.get("tags"))
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
            .slice(0, 5),
        },
        "user_id,content_id",
      );
      reload();
    }, "Guardado en tu biblioteca privada.");
  }
  return (
    <>
      <a className="back-link" href="#/discover">
        ← Volver a descubrir
      </a>
      <section className="detail-hero panel">
        <p className="eyebrow">{item.category} · APORTE DE LA COMUNIDAD</p>
        <h1>{item.title}</h1>
        <p className="byline">{item.author}</p>
        <p className="preserve-lines">
          {item.description || "Sin descripción todavía."}
        </p>
        <div className="actions">
          <OfficialLink url={item.official_url} />
          <button onClick={() => navigate(`parties/new/${item.id}`)}>
            Crear una Party →
          </button>
          <button
            onClick={() => {
              navigator.clipboard
                ?.writeText(
                  `${location.origin}${location.pathname}#/content/${item.id}`,
                )
                .then(() =>
                  action.run(
                    async () => {},
                    "Enlace copiado. Sólo podrán abrirlo miembros con acceso.",
                  ),
                )
                .catch(() => action.run(() => Promise.reject(new Error())));
            }}
          >
            Copiar enlace
          </button>
        </div>
        <small>
          Fuente:{" "}
          {item.source === "community"
            ? "Metadatos aportados por un miembro; verificá la fuente oficial."
            : item.source}
        </small>
      </section>
      <div className="two-columns">
        <section className="panel">
          <h2>Tu biblioteca</h2>
          <form onSubmit={save}>
            <label>
              Estado
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {Object.entries(readingStates).map(([value, label]) => (
                  <option value={value} key={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Progreso · %
              <input
                name="progress"
                type="number"
                min={0}
                max={100}
                defaultValue={saved?.progress || 0}
                required
              />
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={favorite}
                onChange={(e) => setFavorite(e.target.checked)}
              />
              Guardar como favorito
            </label>
            <label>
              Etiquetas emocionales · hasta 5, separadas por comas
              <input
                name="tags"
                maxLength={300}
                defaultValue={saved?.emotional_tags?.join(", ") || ""}
                placeholder="Para días difíciles, Quiero compartirlo"
              />
            </label>
            <button className="primary" disabled={action.busy}>
              Guardar en mi biblioteca
            </button>
          </form>
          {saved && (
            <button
              className="text-button danger"
              disabled={action.busy}
              onClick={() =>
                action.run(async () => {
                  await api.remove("user_content_status", {
                    user_id: userId,
                    content_id: item.id,
                  });
                  reload();
                }, "Retirado de tu biblioteca.")
              }
            >
              Retirar de mi biblioteca
            </button>
          )}
          <h3>Agregar a una colección</h3>
          {collections.length ? (
            <form
              className="inline-form"
              onSubmit={(e) => {
                e.preventDefault();
                const collection_id = new FormData(e.currentTarget).get(
                  "collection",
                );
                action.run(
                  () =>
                    api.insert("collection_items", {
                      collection_id,
                      content_id: item.id,
                    }),
                  "Agregado a tu colección.",
                );
              }}
            >
              <label>
                <span className="sr-only">Colección</span>
                <select name="collection">
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </label>
              <button disabled={action.busy}>Agregar</button>
            </form>
          ) : (
            <a href="#/collections">Crear mi primera colección →</a>
          )}
        </section>
        <section className="panel">
          <h2>Tu reseña</h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              await action.run(async () => {
                await api.upsert(
                  "reviews",
                  {
                    user_id: userId,
                    content_id: item.id,
                    rating: Number(f.get("rating")),
                    body: f.get("body"),
                  },
                  "user_id,content_id",
                );
                reload();
              }, "Reseña publicada.");
            }}
          >
            <label>
              Calificación
              <select name="rating" defaultValue={ownReview?.rating || 5}>
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} / 5
                  </option>
                ))}
              </select>
            </label>
            <label>
              ¿Qué te hizo sentir?
              <textarea
                name="body"
                maxLength={3000}
                defaultValue={ownReview?.body || ""}
              />
            </label>
            <button className="primary" disabled={action.busy}>
              {ownReview ? "Actualizar reseña" : "Publicar reseña"}
            </button>
          </form>
          {ownReview && (
            <button
              className="text-button danger"
              disabled={action.busy}
              onClick={() =>
                action.run(async () => {
                  await api.remove("reviews", { id: ownReview.id });
                  reload();
                }, "Reseña retirada.")
              }
            >
              Retirar reseña
            </button>
          )}
        </section>
      </div>
      <ActionStatus action={action} />
      <section className="panel">
        <h2>
          Lo que compartimos <span className="count">{reviews.length}</span>
        </h2>
        {reviews.length ? (
          reviews.map((r) => (
            <article className="review" key={r.id}>
              <strong>
                {r.user_id === userId ? "Tu reseña" : "Miembro de Juntopia"} · ★{" "}
                {r.rating}/5
              </strong>
              <p className="preserve-lines">{r.body}</p>
              {r.user_id !== userId && (
                <ReportButton table="reviews" id={r.id} />
              )}
            </article>
          ))
        ) : (
          <p>Tu reseña puede ser la primera.</p>
        )}
      </section>
      <ReportButton table="content_items" id={item.id} />
    </>
  );
}
