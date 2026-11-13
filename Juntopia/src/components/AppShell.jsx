import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { useQuery, useRealtime } from "../hooks/useQuery.js";
import { Avatar } from "./Avatar.jsx";
import { navigate } from "../hooks/useRoute.js";
const links = [
  ["home", "⌂", "Inicio"],
  ["discover", "◇", "Descubrir"],
  ["parties", "♧", "Parties"],
  ["library", "▥", "Mi biblioteca"],
  ["collections", "▱", "Colecciones"],
  ["friends", "♙", "Amigos"],
  ["agenda", "▦", "Mi agenda"],
  ["messages", "◌", "Mensajes"],
  ["creators", "✎", "Crear y compartir"],
  ["profile", "♙", "Mi perfil"],
  ["settings", "⚙", "Configuración"],
];
export function AppShell({ profile, route, children, logout }) {
  const [menu, setMenu] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const unread = useQuery(
    useCallback(
      () =>
        api.list("notifications", {
          filters: { user_id: profile.id, is_read: false },
        }),
      [profile.id],
    ),
  );
  useRealtime("notifications", "user_id", profile.id, unread.reload);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  useEffect(() => {
    if (!menu) return;
    const drawer = document.getElementById("mobile-nav");
    const nodes = drawer.querySelectorAll("a,button");
    nodes[0]?.focus();
    function keyboard(event) {
      if (event.key === "Escape") {
        setMenu(false);
        document.querySelector(".menu-toggle")?.focus();
      }
      if (event.key === "Tab") {
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    }
    window.addEventListener("keydown", keyboard);
    return () => window.removeEventListener("keydown", keyboard);
  }, [menu]);
  return (
    <div className="app-shell">
      <aside
        id="mobile-nav"
        className={`sidebar ${menu ? "is-open" : ""}`}
        aria-label="Navegación del refugio"
      >
        <a className="brand" href="#/home">
          <span aria-hidden="true">♧</span> Juntopia
          <span className="brand-dot">.</span>
        </a>
        <p className="eyebrow">UN LUGAR PARA ENCONTRARNOS</p>
        <nav>
          {links.map(([href, icon, label]) => (
            <a
              key={href}
              href={`#/${href}`}
              aria-current={route.split("/")[0] === href ? "page" : undefined}
              onClick={() => setMenu(false)}
            >
              <span aria-hidden="true">{icon}</span>
              {label}
            </a>
          ))}
        </nav>
        <div className="sidebar-footer">
          <p>
            Diferentes caminos.
            <br />
            Un mismo refugio.
          </p>
          <button onClick={logout}>Cerrar sesión ↗</button>
        </div>
      </aside>
      <div className="app-content">
        <div className="app-topbar">
          <button
            className="menu-toggle"
            aria-expanded={menu}
            aria-controls="mobile-nav"
            onClick={() => setMenu(!menu)}
          >
            {menu ? "Cerrar menú" : "☰ Menú"}
          </button>
          <form
            className="global-search"
            onSubmit={(e) => {
              e.preventDefault();
              const q = new FormData(e.currentTarget).get("q");
              navigate(`discover?q=${encodeURIComponent(q)}`);
            }}
          >
            <span aria-hidden="true">⌕</span>
            <label>
              <span className="sr-only">Buscar en Juntopia</span>
              <input
                name="q"
                type="search"
                placeholder="Buscar en Juntopia…"
                maxLength={180}
              />
            </label>
          </form>
          <div className="topbar-actions">
            <a
              className="notification-link"
              href="#/notifications"
              aria-label={`Notificaciones${unread.data?.length ? `, ${unread.data.length} nuevas` : ""}`}
            >
              ♧{!!unread.data?.length && <span className="notification-dot" />}
            </a>
            <a href="#/messages" aria-label="Mensajes">
              ◌
            </a>
            <a className="top-avatar" href="#/profile" aria-label="Mi perfil">
              <Avatar
                base={profile.avatar_base}
                color={profile.avatar_color}
                options={profile.avatar_options}
              />
            </a>
          </div>
        </div>
        {!online && (
          <p className="offline-banner" role="alert">
            Estás sin conexión. Volveremos a cargar los datos cuando regrese.
          </p>
        )}
        <main id="main" className="private-main">
          {children}
        </main>
        <footer className="private-footer">
          <span>Juntopia · Tu punto de encuentro</span>
          <a href="#/policies">Reglas y privacidad</a>
          <a href="#/moderation">Moderación</a>
        </footer>
      </div>
      {menu && (
        <button
          className="menu-backdrop"
          aria-label="Cerrar navegación"
          onClick={() => setMenu(false)}
        />
      )}
    </div>
  );
}
