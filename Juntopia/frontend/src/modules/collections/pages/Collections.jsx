import { useCallback, useState } from "react";
import { api } from "../../../shared/data/api.js";
import { useQuery, useAction } from "../../../shared/hooks/useQuery.js";
import {
  Feedback,
  ActionStatus,
} from "../../../shared/components/Feedback.jsx";
import { ContentCard } from "../../catalog/components/ContentCard.jsx";
import { navigate } from "../../../app/router.js";
export function Collections({ userId, selectedId }) {
  const query = useQuery(useCallback(() => api.list("collections"), []));
  const action = useAction();
  const [tab, setTab] = useState("mine");
  if (selectedId) return <CollectionDetail id={selectedId} userId={userId} />;
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">HISTORIAS QUE VAN JUNTAS</p>
          <h1>Colecciones</h1>
          <p>Armá un rincón para cada ánimo.</p>
        </div>
      </div>
      <details className="panel">
        <summary>＋ Crear una colección</summary>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const res = await action.run(
              () =>
                api.insert(
                  "collections",
                  Object.fromEntries(new FormData(form)),
                ),
              "Colección creada.",
            );
            if (res?.ok) {
              form.reset();
              query.reload();
            }
          }}
        >
          <label>
            Nombre
            <input name="title" maxLength={100} required />
          </label>
          <label>
            Descripción
            <textarea name="description" maxLength={500} />
          </label>
          <label>
            Visibilidad
            <select name="visibility">
              <option value="private">Sólo yo</option>
              <option value="public">Miembros de Juntopia</option>
            </select>
          </label>
          <button className="primary" disabled={action.busy}>
            Crear colección
          </button>
        </form>
      </details>
      <ActionStatus action={action} />
      <div className="chips">
        <button aria-pressed={tab === "mine"} onClick={() => setTab("mine")}>
          Mis colecciones
        </button>
        <button
          aria-pressed={tab === "community"}
          onClick={() => setTab("community")}
        >
          De la comunidad
        </button>
      </div>
      <Feedback
        query={query}
        empty="Todavía no hay colecciones. Creá la primera."
      >
        {(rows) => {
          const visible = rows.filter((c) =>
            tab === "mine" ? c.user_id === userId : c.user_id !== userId,
          );
          return visible.length ? (
            <div className="collection-grid">
              {visible.map((c) => (
                <a
                  className="collection-card panel"
                  key={c.id}
                  href={`#/collections/${c.id}`}
                >
                  <span aria-hidden="true">▱</span>
                  <small>
                    {c.visibility === "private" ? "PRIVADA" : "COMPARTIDA"}
                  </small>
                  <h2>{c.title}</h2>
                  <p>{c.description}</p>
                  <span>Entrar a la colección →</span>
                </a>
              ))}
            </div>
          ) : (
            <p className="empty">Aún no hay colecciones en este espacio.</p>
          );
        }}
      </Feedback>
    </>
  );
}
function CollectionDetail({ id, userId }) {
  const query = useQuery(
    useCallback(async () => {
      const [collection, items] = await Promise.all([
        api.one("collections", id),
        api.list("collection_items", {
          filters: { collection_id: id },
          order: null,
          select: "*, content_items(*)",
          limit: 200,
        }),
      ]);
      return collection ? { collection, items } : null;
    }, [id]),
  );
  const action = useAction();
  return (
    <Feedback query={query} empty="Colección privada o no disponible.">
      {({ collection, items }) => (
        <>
          <a href="#/collections">← Colecciones</a>
          <div className="page-heading">
            <div>
              <p className="eyebrow">
                {collection.visibility === "private"
                  ? "SÓLO VOS"
                  : "COMPARTIDA CON MIEMBROS"}
              </p>
              <h1>{collection.title}</h1>
              <p>{collection.description}</p>
            </div>
          </div>
          {collection.user_id === userId && (
            <details className="panel">
              <summary>Editar colección</summary>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const values = Object.fromEntries(
                    new FormData(e.currentTarget),
                  );
                  action.run(async () => {
                    await api.update("collections", values, { id });
                    query.reload();
                  });
                }}
              >
                <label>
                  Nombre
                  <input
                    name="title"
                    defaultValue={collection.title}
                    required
                    maxLength={100}
                  />
                </label>
                <label>
                  Descripción
                  <textarea
                    name="description"
                    defaultValue={collection.description}
                    maxLength={500}
                  />
                </label>
                <label>
                  Visibilidad
                  <select
                    name="visibility"
                    defaultValue={collection.visibility}
                  >
                    <option value="private">Sólo yo</option>
                    <option value="public">Miembros de Juntopia</option>
                  </select>
                </label>
                <button disabled={action.busy}>Guardar</button>
              </form>
              <button
                className="danger"
                onClick={() => {
                  if (
                    window.confirm(
                      "¿Eliminar esta colección? Los contenidos seguirán en tu biblioteca.",
                    )
                  )
                    action.run(async () => {
                      await api.remove("collections", { id });
                      navigate("collections");
                    }, "Colección eliminada.");
                }}
              >
                Eliminar colección
              </button>
            </details>
          )}
          <ActionStatus action={action} />
          {items.length ? (
            <div className="content-grid">
              {items
                .filter((i) => i.content_items)
                .map((i) => (
                  <div key={i.content_id}>
                    <ContentCard
                      item={i.content_items}
                      onOpen={(id) => navigate(`content/${id}`)}
                    />
                    {collection.user_id === userId && (
                      <button
                        className="text-button"
                        disabled={action.busy}
                        onClick={() =>
                          action.run(async () => {
                            await api.remove("collection_items", {
                              collection_id: id,
                              content_id: i.content_id,
                            });
                            query.reload();
                          }, "Retirado de la colección.")
                        }
                      >
                        Retirar
                      </button>
                    )}
                  </div>
                ))}
            </div>
          ) : (
            <p className="empty">
              Agregá contenidos desde sus fichas en Descubrir.
            </p>
          )}
        </>
      )}
    </Feedback>
  );
}
