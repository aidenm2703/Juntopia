import { useCallback, useEffect, useState } from "react";
import { api } from "../../../shared/data/api.js";
import { formatDate } from "../../../shared/domain/index.js";
import { useQuery, useAction } from "../../../shared/hooks/useQuery.js";
import {
  ActionStatus,
  Feedback,
  ReportButton,
} from "../../../shared/components/Feedback.jsx";
export function Creators({ userId }) {
  const [kind, setKind] = useState("writing");
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const query = useQuery(useCallback(() => api.list("creator_works"), []));
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">HECHO POR VOS. COMPARTIDO A TU MANERA.</p>
          <h1>{kind === "writing" ? "Tinta Viva" : "Galería Viva"}</h1>
          <p>
            Un espacio para tus historias, tus ideas y tus obras originales.
          </p>
        </div>
        <button
          className="primary"
          onClick={() => {
            setEditing(null);
            setCreating(!creating);
          }}
        >
          ＋ Crear una obra
        </button>
      </div>
      <div className="chips">
        <button
          aria-pressed={kind === "writing"}
          onClick={() => setKind("writing")}
        >
          ✎ Tinta Viva
        </button>
        <button aria-pressed={kind === "art"} onClick={() => setKind("art")}>
          ◈ Galería Viva
        </button>
      </div>
      {creating && (
        <WorkForm
          key={editing?.id || "new"}
          userId={userId}
          initial={editing}
          kind={kind}
          done={() => {
            setCreating(false);
            setEditing(null);
            query.reload();
          }}
        />
      )}
      <Feedback
        query={query}
        empty="Todavía no hay obras. Podés guardar un borrador privado o compartir tu primera creación."
      >
        {(rows) => (
          <div className="works-grid">
            {rows
              .filter((w) => w.kind === kind)
              .map((work) => (
                <Work
                  key={work.id}
                  work={work}
                  userId={userId}
                  reload={query.reload}
                  edit={() => {
                    setEditing(work);
                    setCreating(true);
                    window.scrollTo({ top: 0 });
                  }}
                />
              ))}
          </div>
        )}
      </Feedback>
    </>
  );
}
function WorkForm({ userId, initial, kind, done }) {
  const action = useAction();
  const [localError, setLocalError] = useState("");
  async function save(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const file = form.get("file");
    if (
      file?.size &&
      (!["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
        file.size > 5242880)
    ) {
      setLocalError("Elegí una imagen JPG, PNG o WebP de hasta 5 MB.");
      return;
    }
    setLocalError("");
    const values = {
      title: form.get("title"),
      body: form.get("body"),
      visibility: form.get("visibility"),
      license: form.get("license"),
      attribution: form.get("attribution"),
      kind: initial?.kind || kind,
    };
    const result = await action.run(async () => {
      let uploaded = null;
      try {
        if (file?.size) uploaded = await api.upload(userId, file);
        const asset_path = uploaded || initial?.asset_path || null;
        if (initial)
          await api.update(
            "creator_works",
            { ...values, asset_path },
            { id: initial.id },
          );
        else await api.insert("creator_works", { ...values, asset_path });
      } catch (error) {
        if (uploaded) await api.removeAsset(uploaded).catch(() => {});
        throw error;
      }
      if (uploaded && initial?.asset_path)
        await api.removeAsset(initial.asset_path).catch(() => {});
    }, "Obra guardada.");
    if (result?.ok) done();
  }
  return (
    <section className="panel">
      <h2>{initial ? "Seguí creando" : "Una idea empieza acá."}</h2>
      <form onSubmit={save}>
        <label>
          Título
          <input
            name="title"
            required
            maxLength={150}
            defaultValue={initial?.title}
          />
        </label>
        <label>
          {kind === "writing" ? "Tu historia" : "Sobre la obra"}
          <textarea
            className="writing-editor"
            name="body"
            maxLength={100000}
            defaultValue={initial?.body}
          />
        </label>
        <label>
          Imagen propia o autorizada · máximo 5 MB
          <input
            name="file"
            type="file"
            accept="image/jpeg,image/png,image/webp"
          />
        </label>
        <div className="form-grid">
          <label>
            Visibilidad
            <select
              name="visibility"
              defaultValue={initial?.visibility || "private"}
            >
              <option value="private">Borrador privado</option>
              <option value="public">Compartir con miembros</option>
            </select>
          </label>
          <label>
            Derechos
            <select
              name="license"
              defaultValue={initial?.license || "original"}
            >
              <option value="original">Soy autor/a y tengo los derechos</option>
              <option value="cc-by">Tengo permiso bajo CC BY</option>
              <option value="cc0">Contenido autorizado CC0</option>
            </select>
          </label>
        </div>
        <label>
          Autoría y atribución · obligatoria para CC BY / CC0
          <input
            name="attribution"
            maxLength={1000}
            defaultValue={initial?.attribution || ""}
          />
        </label>
        <label className="check">
          <input type="checkbox" required />
          Confirmo que soy autor/a o tengo los permisos indicados para publicar
          este contenido.
        </label>
        <button className="primary" disabled={action.busy}>
          Guardar obra
        </button>
        <button type="button" onClick={done}>
          Cancelar
        </button>
        <p role="alert">{localError}</p>
        <ActionStatus action={action} />
      </form>
    </section>
  );
}
function Work({ work, userId, reload, edit }) {
  const [url, setUrl] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const action = useAction();
  useEffect(() => {
    if (!work.asset_path) return;
    let active = true;
    const refresh = () =>
      api
        .asset(work.asset_path)
        .then((url) => {
          if (active) setUrl(url);
        })
        .catch(() => {
          if (active) setUrl(null);
        });
    refresh();
    const timer = setInterval(refresh, 45000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [work.asset_path]);
  return (
    <article className="panel work-card">
      {url && <img src={url} alt={work.title} loading="lazy" />}
      <div className="tag-list">
        <span>
          {work.visibility === "private" ? "Borrador privado" : "Compartida"}
        </span>
        <span>
          {work.license === "original"
            ? "Obra original"
            : work.license.toUpperCase()}
        </span>
      </div>
      <h2>{work.title}</h2>
      <small>{formatDate(work.created_at)}</small>
      <p className={`preserve-lines ${expanded ? "" : "work-excerpt"}`}>
        {work.body}
      </p>
      {work.body.length > 300 && (
        <button className="text-button" onClick={() => setExpanded(!expanded)}>
          {expanded ? "Leer menos" : "Seguir leyendo →"}
        </button>
      )}
      {work.attribution && (
        <p className="fine-print">Autoría y derechos: {work.attribution}</p>
      )}
      {work.user_id === userId ? (
        <div className="actions">
          <button onClick={edit}>Editar</button>
          <button
            className="danger"
            disabled={action.busy}
            onClick={() => {
              if (
                window.confirm(
                  "¿Retirar esta obra? Esta acción no se puede deshacer.",
                )
              )
                action.run(async () => {
                  await api.remove("creator_works", { id: work.id });
                  if (work.asset_path) await api.removeAsset(work.asset_path);
                  reload();
                }, "Obra retirada.");
            }}
          >
            Retirar obra
          </button>
        </div>
      ) : (
        <ReportButton table="creator_works" id={work.id} />
      )}
      <ActionStatus action={action} />
      <details
        onToggle={(e) => {
          if (e.currentTarget.open) setExpanded(true);
        }}
      >
        <summary>Comentarios</summary>
        {expanded && <WorkComments workId={work.id} userId={userId} />}
      </details>
    </article>
  );
}
function WorkComments({ workId, userId }) {
  const query = useQuery(
    useCallback(
      () =>
        api.list("work_comments", {
          filters: { work_id: workId },
          ascending: true,
        }),
      [workId],
    ),
  );
  const action = useAction();
  return (
    <>
      <Feedback query={query} empty="Todavía no hay comentarios.">
        {(rows) =>
          rows.map((c) => (
            <div className="review" key={c.id}>
              <small>
                {c.user_id === userId ? "Vos" : "Miembro"} ·{" "}
                {formatDate(c.created_at)}
              </small>
              <p>{c.body}</p>
              {c.user_id !== userId ? (
                <ReportButton table="work_comments" id={c.id} />
              ) : (
                <button
                  className="text-button"
                  disabled={action.busy}
                  onClick={() =>
                    action.run(async () => {
                      await api.remove("work_comments", { id: c.id });
                      query.reload();
                    })
                  }
                >
                  Retirar comentario
                </button>
              )}
            </div>
          ))
        }
      </Feedback>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const body = new FormData(form).get("body");
          const result = await action.run(
            () => api.insert("work_comments", { work_id: workId, body }),
            "Comentario guardado.",
          );
          if (result?.ok) {
            form.reset();
            query.reload();
          }
        }}
      >
        <label>
          Unas palabras para esta obra
          <textarea name="body" maxLength={2000} required />
        </label>
        <button disabled={action.busy}>Comentar</button>
        <ActionStatus action={action} />
      </form>
    </>
  );
}
