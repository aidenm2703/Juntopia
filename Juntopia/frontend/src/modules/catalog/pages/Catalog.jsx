import { useCallback, useState } from "react";
import { api } from "../../../shared/data/api.js";
import { categories, safeUrl } from "../../../shared/domain/index.js";
import { useAction, useQuery } from "../../../shared/hooks/useQuery.js";
import {
  ActionStatus,
  Feedback,
} from "../../../shared/components/Feedback.jsx";
import { ContentCard } from "../components/ContentCard.jsx";
import { navigate } from "../../../app/router.js";
import { useEffect } from "react";
import { request } from "../../../shared/data/http.js";
import { DiscoveryShelf } from "../components/DiscoveryShelf.jsx";
export function Catalog({ initialCategory = "", search = "" }) {
  const [filter, setFilter] = useState(initialCategory);
  const [query, setQuery] = useState(search);
  const [adding, setAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(query.trim()), 650);
    return () => clearTimeout(timer);
  }, [query]);
  const remote = useQuery(
    useCallback(
      () =>
        searchTerm.length >= 2
          ? request(
              "/catalog/search?" +
                new URLSearchParams({ q: searchTerm, category: filter }),
            )
          : Promise.resolve({ items: [], unavailable: [] }),
      [searchTerm, filter],
    ),
  );
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
          <p>
            Encontrá tu próxima historia. Elegí qué ya viste, escuchaste o
            leíste y compartí tu calificación.
          </p>
        </div>
        <button
          className="primary"
          onClick={() => setAdding(!adding)}
          aria-expanded={adding}
        >
          ＋ Agregar una ficha
        </button>
      </div>
      <div className="category-tabs" aria-label="Explorar por categoría">
        <button aria-pressed={!filter} onClick={() => setFilter("")}>
          Todo
        </button>
        {categories.map((c) => (
          <button
            key={c.name}
            aria-pressed={filter === c.name}
            onClick={() => setFilter(c.name)}
          >
            {c.icon} {c.name}
          </button>
        ))}
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
        empty="No pudimos cargar la selección inicial. Volvé a intentar."
      >
        {(items) => {
          const found = items.filter(
            (i) =>
              (!filter || i.category === filter) &&
              fold(`${i.title} ${i.author} ${i.description}`).includes(
                fold(query),
              ),
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
              No hay coincidencias guardadas. Estamos buscando también en los
              proveedores.
            </p>
          );
        }}
      </Feedback>
      {searchTerm.length >= 2 && (
        <section className="external-results">
          <h2>Resultados de los proveedores</h2>
          <Feedback query={remote}>
            {({ items, unavailable }) => (
              <>
                {unavailable.length > 0 && (
                  <p className="notice" role="status">
                    Algunos proveedores no respondieron (
                    {unavailable.join(", ")}). Las otras fuentes siguen
                    disponibles.
                  </p>
                )}
                {items.length ? (
                  <div className="content-grid">
                    {items.map((item) => (
                      <ContentCard
                        key={item.external_id}
                        item={item}
                        external
                        onOpen={(external_id) =>
                          action.run(async () => {
                            const saved = await request("/catalog/import", {
                              method: "POST",
                              body: { external_id },
                            });
                            navigate(`content/${saved.id}`);
                          }, "Ficha lista para guardar y calificar.")
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <p>
                    No encontramos más coincidencias. Probá el título completo o
                    seleccioná su categoría.
                  </p>
                )}
              </>
            )}
          </Feedback>
        </section>
      )}
      {!query.trim() && <DiscoveryShelf key={filter} category={filter} />}
      <p className="muted fine-print">
        Selección inicial, aportes de la comunidad y búsqueda en Apple, Open
        Library, TVmaze, Jikan, Art Institute of Chicago y CheapShark. Los
        enlaces abren la fuente indicada; Juntopia no reproduce esas obras.
      </p>
    </>
  );
}
function fold(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .trim();
}
