import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { supabase } from "./lib/supabase.js";
import { api } from "./lib/api.js";
import { loadProfile } from "./lib/profile.js";
import { useSession } from "./hooks/useSession.js";
import { useRoute } from "./hooks/useRoute.js";
import { useQuery } from "./hooks/useQuery.js";
import { Auth } from "./features/Auth.jsx";
import { Onboarding } from "./features/Onboarding.jsx";
import { AppShell } from "./components/AppShell.jsx";
import { ErrorBoundary } from "./components/ErrorBoundary.jsx";
import { Feedback } from "./components/Feedback.jsx";
import { Landing } from "./pages/Landing.jsx";
import { PolicyText, Consent } from "./pages/Policies.jsx";
import { NotFound } from "./pages/NotFound.jsx";
import "./App.css";
import "./workspace.css";
const page = (loader, name) =>
  lazy(() => loader().then((module) => ({ default: module[name] })));
const Dashboard = page(() => import("./pages/Dashboard.jsx"), "Dashboard");
const Catalog = page(() => import("./pages/Catalog.jsx"), "Catalog");
const ContentDetail = page(
  () => import("./pages/ContentDetail.jsx"),
  "ContentDetail",
);
const Library = page(() => import("./pages/Library.jsx"), "Library");
const Collections = page(
  () => import("./pages/Collections.jsx"),
  "Collections",
);
const Friends = page(() => import("./pages/Friends.jsx"), "Friends");
const Messages = page(() => import("./pages/Messages.jsx"), "Messages");
const Parties = page(() => import("./pages/Parties.jsx"), "Parties");
const Notifications = page(
  () => import("./pages/Notifications.jsx"),
  "Notifications",
);
const Profile = page(() => import("./pages/Profile.jsx"), "Profile");
const Settings = page(() => import("./pages/Settings.jsx"), "Settings");
const Creators = page(() => import("./pages/Creators.jsx"), "Creators");
const Moderation = page(() => import("./pages/Moderation.jsx"), "Moderation");
function initialTheme() {
  try {
    const value = localStorage.getItem("juntopia-theme");
    return ["system", "dark", "light"].includes(value) ? value : "system";
  } catch {
    return "system";
  }
}
export default function App() {
  const [route, navigate] = useRoute();
  const auth = useSession();
  const [theme, setTheme] = useState(initialTheme);
  const [logoutError, setLogoutError] = useState("");
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("juntopia-theme", theme);
    } catch {
      /* Browser storage may be unavailable in private mode. */
    }
  }, [theme]);
  async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error)
      setLogoutError("No pudimos cerrar la sesión. Volvé a intentarlo.");
    else {
      setLogoutError("");
      navigate("home");
    }
  }
  const publicHeader = (
    <header>
      <a className="brand" href="#/home">
        <span aria-hidden="true">♧</span> Juntopia
        <span className="brand-dot">.</span>
      </a>
      <nav aria-label="Principal">
        <a href="#/policies">Nuestro refugio</a>
        <label className="theme-label">
          <span className="sr-only">Tema</span>
          <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="system">Sistema</option>
            <option value="dark">Oscuro</option>
            <option value="light">Claro</option>
          </select>
        </label>
        <a className="button-link" href={auth.session ? "#/home" : "#/login"}>
          {auth.session ? "Mi refugio" : "Ingresar ↗"}
        </a>
      </nav>
    </header>
  );
  let content;
  if (route === "policies")
    content = (
      <>
        {publicHeader}
        <main id="main">
          <section className="panel consent">
            <PolicyText />
            <a href="#/home">Volver al refugio →</a>
          </section>
        </main>
      </>
    );
  else if (auth.loading)
    content = (
      <main id="main">
        <p className="empty" role="status">
          Abriendo el refugio…
        </p>
      </main>
    );
  else if (auth.recovery && auth.session)
    content = (
      <>
        {publicHeader}
        <main id="main">
          <Auth
            mode="password"
            close={() => {
              auth.finishRecovery();
              navigate("home");
            }}
          />
        </main>
      </>
    );
  else if (auth.session)
    content = (
      <Authenticated
        key={auth.session.user.id}
        userId={auth.session.user.id}
        route={route}
        logout={logout}
        theme={theme}
        setTheme={setTheme}
      />
    );
  else
    content = (
      <>
        {publicHeader}
        <main id="main">
          {auth.error && (
            <p role="alert" className="notice">
              {auth.error}
            </p>
          )}
          {route === "home" ? (
            <Landing navigate={navigate} />
          ) : ["login", "register", "reset"].includes(route) ? (
            <Auth key={route} mode={route} close={() => navigate("home")} />
          ) : (
            <Auth mode="login" close={() => navigate("home")} />
          )}
        </main>
        <footer>
          <span className="brand">Juntopia.</span>
          <p>Diferentes caminos, un lugar para encontrarnos.</p>
          <a href="#/policies">Reglas y privacidad · Beta</a>
        </footer>
      </>
    );
  return (
    <ErrorBoundary>
      <a className="skip" href="#main">
        Saltar al contenido
      </a>
      {logoutError && (
        <p role="alert" className="notice">
          {logoutError}
        </p>
      )}
      {content}
    </ErrorBoundary>
  );
}
function Authenticated({ userId, route, logout, theme, setTheme }) {
  const query = useQuery(
    useCallback(async () => {
      const [profile, acceptance] = await Promise.all([
        loadProfile(userId),
        api.list("policy_acceptances", {
          filters: { user_id: userId },
          order: null,
        }),
      ]);
      return { profile, accepted: !!acceptance.length };
    }, [userId]),
  );
  useEffect(() => {
    let active = true;
    api
      .list("user_settings", { filters: { user_id: userId }, order: null })
      .then((rows) => {
        if (active && rows[0]) setTheme(rows[0].theme);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [userId, setTheme]);
  return (
    <Feedback query={query}>
      {({ profile, accepted }) => {
        if (!accepted)
          return (
            <>
              <header>
                <a className="brand" href="#/home">
                  Juntopia.
                </a>
                <button onClick={logout}>Salir</button>
              </header>
              <main id="main">
                <Consent done={query.reload} />
              </main>
            </>
          );
        if (!profile.onboarding_complete)
          return (
            <>
              <header>
                <a className="brand" href="#/home">
                  Juntopia.
                </a>
                <button onClick={logout}>Salir</button>
              </header>
              <main id="main">
                <Onboarding initial={profile} done={query.reload} />
              </main>
            </>
          );
        const [path, search = ""] = route.split("?");
        const [section, id, extra] = path.split("/");
        let view;
        switch (section) {
          case "home":
          case "login":
          case "register":
          case "reset":
            view = <Dashboard profile={profile} />;
            break;
          case "discover": {
            let category;
            try {
              category = id ? decodeURIComponent(id) : "";
            } catch {
              category = "";
            }
            view = (
              <Catalog
                key={route}
                initialCategory={category}
                search={new URLSearchParams(search).get("q") || ""}
              />
            );
            break;
          }
          case "content":
            view = id ? (
              <ContentDetail key={id} id={id} userId={userId} />
            ) : (
              <NotFound />
            );
            break;
          case "library":
            view = <Library userId={userId} />;
            break;
          case "collections":
            view = (
              <Collections key={id || "list"} userId={userId} selectedId={id} />
            );
            break;
          case "friends":
            view = <Friends userId={userId} />;
            break;
          case "messages":
            view = <Messages userId={userId} id={id} />;
            break;
          case "parties":
            view = (
              <Parties
                key={id || "list"}
                userId={userId}
                creating={id === "new"}
                contentId={extra}
                id={id === "new" ? null : id}
              />
            );
            break;
          case "agenda":
            view = <Parties userId={userId} agenda />;
            break;
          case "notifications":
            view = <Notifications userId={userId} />;
            break;
          case "creators":
            view = <Creators userId={userId} />;
            break;
          case "profile":
            view = <Profile profile={profile} refresh={query.reload} />;
            break;
          case "settings":
            view = (
              <Settings userId={userId} theme={theme} setTheme={setTheme} />
            );
            break;
          case "moderation":
            view = <Moderation />;
            break;
          default:
            view = <NotFound />;
        }
        return (
          <AppShell profile={profile} route={route} logout={logout}>
            <Suspense
              fallback={
                <p role="status" className="empty">
                  Preparando este camino…
                </p>
              }
            >
              {view}
            </Suspense>
          </AppShell>
        );
      }}
    </Feedback>
  );
}
