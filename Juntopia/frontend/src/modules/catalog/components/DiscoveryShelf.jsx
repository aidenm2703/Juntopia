import { useCallback, useEffect, useRef, useState } from "react";
import { request } from "../../../shared/data/http.js";
import { errorMessage } from "../../../shared/domain/index.js";
import { ContentCard } from "./ContentCard.jsx";
import { navigate } from "../../../app/router.js";
export function DiscoveryShelf({ category = "", compact = false }) {
  const [state, setState] = useState({
    items: [],
    busy: false,
    message: "",
    notice: "",
    batch: -1,
    more: true,
    ai: false,
  });
  const lock = useRef(false),
    sentinel = useRef(null),
    current = useRef(state);
  useEffect(() => {
    current.current = state;
  }, [state]);
  const load = useCallback(async () => {
    const previous = current.current;
    if (lock.current || !previous.more) return;
    lock.current = true;
    setState((s) => ({ ...s, busy: true, notice: "" }));
    try {
      const data = await request("/catalog/assistant", {
        method: "POST",
        body: {
          category,
          batch: previous.batch + 1,
          exclude: previous.items.map((i) => i.id),
        },
      });
      setState((s) => {
        const items = [
          ...new Map(
            [...s.items, ...data.items].map((i) => [i.id, i]),
          ).values(),
        ].slice(0, 60);
        return {
          items,
          busy: false,
          message: data.message,
          notice: data.notice,
          batch: s.batch + 1,
          more:
            data.more &&
            items.length < 60 &&
            data.items.length > 0 &&
            items.length > s.items.length,
          ai: data.ai,
        };
      });
    } catch (error) {
      setState((s) => ({
        ...s,
        busy: false,
        notice: errorMessage(error),
        more: false,
      }));
    } finally {
      lock.current = false;
    }
  }, [category]);
  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) load();
    });
    return () => {
      active = false;
    };
  }, [load]);
  useEffect(() => {
    if (
      compact ||
      state.busy ||
      state.batch < 0 ||
      state.batch >= 2 ||
      !state.more ||
      !state.ai ||
      !sentinel.current
    )
      return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          document.visibilityState === "visible" &&
          window.scrollY > 200
        )
          load();
      },
      { rootMargin: "100px" },
    );
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [compact, load, state.busy, state.batch, state.more, state.ai]);
  return (
    <section className="discovery-shelf" aria-label="Recomendaciones para vos">
      <div className="section-heading">
        <div>
          <p className="eyebrow">
            {state.ai ? "GEMINI · PARA VOS" : "NUEVAS IDEAS"}
          </p>
          <h2>
            {category
              ? `Para explorar en ${category.toLocaleLowerCase("es")}`
              : "Un descubrimiento para vos"}
          </h2>
        </div>
        {compact && <a href="#/discover">Ver todo →</a>}
      </div>
      {state.message && <p>{state.message}</p>}
      <div className={`content-grid${compact ? " compact" : ""}`}>
        {(compact ? state.items.slice(0, 4) : state.items).map((item) => (
          <ContentCard
            key={item.id}
            item={item}
            onOpen={(id) => navigate(`content/${id}`)}
          />
        ))}
      </div>
      <p role="status" aria-live="polite">
        {state.busy ? "Buscando nuevas ideas para vos…" : state.notice}
      </p>
      {!compact && (
        <div ref={sentinel} className="load-more">
          <button disabled={state.busy || !state.more} onClick={load}>
            {state.busy
              ? "Buscando…"
              : state.more
                ? "Descubrir más con Gemini"
                : "Ya viste esta selección"}
          </button>
        </div>
      )}
    </section>
  );
}
