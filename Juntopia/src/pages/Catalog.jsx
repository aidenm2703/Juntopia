import { useCallback, useState } from "react";
import { api } from "../lib/api.js";
import { categories, safeUrl } from "../lib/domain.js";
import { useAction, useQuery } from "../hooks/useQuery.js";
import { ActionStatus, Feedback } from "../components/Feedback.jsx";
import { ContentCard } from "../components/ContentCard.jsx";
import { navigate } from "../hooks/useRoute.js";
export function Catalog({ initialCategory = "", search = "" }) {
  const [filter, setFilter] = useState(initialCategory);
  const [query, setQuery] = useState(search);
  const [adding, setAdding] = useState(false);
  const catalog = useQuery(
    useCallback(() => api.list("content_items", { limit: 200 }), []),
  );
  const action = useAction();
  async function add(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    if (!safeUrl(values.official_url)) return;
    const res = await action.run(
      () => api.insert("content_items", values),
      "Ficha agregada al catálogo. Ya podés guardarla o crear una Party.",
    );
    if (res?.ok) {
      form.reset();
      setAdding(false);
      catalog.reload();
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">ALGO BUENO TE ESPERA</p>
          <h1>Descubrir</h1>
          <p>Fichas compartidas por personas curiosas como vos.</p>
        </div>
        <button
          className="primary"
          onClick={() => setAdding(!adding)}
          aria-expanded={adding}
        >
          ＋ Agregar una ficha
        </button>
      </div>
      <div className="filter-bar">
        <label>
          <span className="sr-only">Buscar título o autor</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Un título, un artista, una historia…"
          />
        </label>
        <label>
          <span className="sr-only">Categoría</span>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.name}>{c.name}</option>
            ))}
          </select>
        </label>
      </div>
      {adding && (
        <section className="panel">
          <h2>Un nuevo descubrimiento</h2>
          <p>
            Agregá metadatos y un enlace oficial. Escribí tu propia descripción;
            no subas ni copies obras ajenas.
          </p>
          <form onSubmit={add}>
            <div className="form-grid">
              <label>
                Título
                <input name="title" required maxLength={180} />
              </label>
              <label>
                Artista, autor o estudio
                <input name="author" maxLength={180} />
              </label>
              <label>
                Categoría
                <select
                  name="category"
                  defaultValue={filter || categories[0].name}
                >
                  {categories.map((c) => (
                    <option key={c.name}>{c.name}</option>
                  ))}
                </select>
              </label>
              <label>
                Enlace oficial HTTPS
                <input
                  name="official_url"
                  type="url"
                  pattern="https://.*"
                  required
                  maxLength={2000}
                />
              </label>
            </div>
            <label>
              Tu descripción
              <textarea name="description" maxLength={3000} />
            </label>
            <button className="primary" disabled={action.busy}>
              Agregar al catálogo
            </button>
          </form>
        </section>
      )}
      <ActionStatus action={action} />
      <Feedback
        query={catalog}
        empty="El catálogo todavía está vacío. Agregá el primer descubrimiento con un enlace a su fuente oficial."
      >
        {(items) => {
          const found = items.filter(
            (i) =>
              (!filter || i.category === filter) &&
              `${i.title} ${i.author} ${i.description}`
                .toLocaleLowerCase("es")
                .includes(query.toLocaleLowerCase("es")),
          );
          return found.length ? (
            <div className="content-grid">
              {found.map((item) => (
                <ContentCard
                  key={item.id}
                  item={item}
                  onOpen={(id) => navigate(`content/${id}`)}
                />
              ))}
            </div>
          ) : (
            <p className="empty">
              No encontramos coincidencias. Probá otro título o cambiá la
              categoría.
            </p>
          );
        }}
      </Feedback>
      <p className="muted fine-print">
        Se muestran hasta 200 aportes recientes. Los enlaces abren proveedores
        externos; Juntopia no aloja ni reproduce esas obras.
      </p>
    </>
  );
}
