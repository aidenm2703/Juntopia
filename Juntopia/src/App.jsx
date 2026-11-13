import { useState } from 'react'
import logo from './assets/juntopia-logo.png'
import './App.css'

const categories = [
  ['♫', 'Música', 'music'], ['▣', 'Cine y series', 'screen'], ['▱', 'Libros', 'books'],
  ['⌁', 'Juegos', 'games'], ['✦', 'Anime', 'anime'], ['✿', 'Arte', 'art'],
]

const recommendations = [
  ['spider', '◉', 'Spider-Verse', 'Película', '4.8'], ['music-cover', '♫', 'Suficiente', 'Álbum · Morat', '4.7'],
  ['manga', '♡', 'Heartstopper', 'Vol. 1', '4.9'], ['game-cover', '⌁', 'Stardew Valley', 'Videojuego', '4.8'],
]

const parties = [
  ['anime-party', '✦', 'Maratón de Anime', '12 conectados'], ['music-party', '♫', 'Escucha juntos', '8 conectados'], ['movie-party', '▣', 'Noche de Pelis', '15 conectados'],
]

const landingCategories = [
  ['M', 'Música', '42 clubs activos', 'l-music'], ['C', 'Cine & Series', '56 clubs activos', 'l-screen'],
  ['L', 'Libros', '29 clubs activos', 'l-books'], ['V', 'Videojuegos', '64 clubs activos', 'l-games'],
  ['A', 'Anime & Manga', '41 clubs activos', 'l-anime'], ['K', 'Cómics', '19 clubs activos', 'l-comics'],
  ['P', 'Podcasts', '23 clubs activos', 'l-podcasts'], ['R', 'Arte & Fanzines', '18 clubs activos', 'l-art'],
]

function Landing({ onEnter, isLightMode, setIsLightMode }) {
  const [selectedParty, setSelectedParty] = useState('')
  const landingParties = [
    ['ANIME & SERIES', 'Maratón de Anime', 'Neon Genesis & Retro Sci-Fi Nights: análisis de los episodios 1 al 6 con snacks temáticos.', 'Hoy 21:00 UTC', '44 compas', 'l-party-anime'],
    ['CINE CLUB', 'Noche de Cine', 'Cine de Culto de los 90s & Terror: proyecciones sincronizadas y notas compartidas.', 'Viernes 20:30 UTC', '28 compas', 'l-party-movie'],
    ['GAMING & CO-OP', 'Co-op Arcade Night', 'Torneo Comunitario Retro & Speedruns: clásicos de 16-bit en línea por equipos.', 'Sábado 19:00 UTC', '32 compas', 'l-party-game'],
  ]
  return <main className={`landing-page ${isLightMode ? 'light-mode' : ''}`}>
    <div className="landing-grid" /><div className="landing-glow landing-glow-a" /><div className="landing-glow landing-glow-b" />
    <header className="landing-nav glass-panel">
      <a className="landing-brand" href="#top" aria-label="Inicio de Juntopia"><img src={logo} alt="Juntopia" /></a>
      <nav aria-label="Navegación de la página de inicio"><a href="#ecosistema">Explorar</a><a href="#como-funciona">Cómo funciona</a><a href="#parties">Parties</a><a href="#creadores">Creadores</a></nav>
      <div className="landing-nav-actions"><button className="landing-theme" onClick={() => setIsLightMode(!isLightMode)}>{isLightMode ? 'Modo claro' : 'Modo oscuro'}</button><button className="login-button" onClick={onEnter}>Iniciar sesión</button><button className="signup-button" onClick={onEnter}>Crear mi cuenta</button></div>
    </header>

    <section className="landing-hero" id="top">
      <div className="hero-copy-landing"><p className="landing-kicker">TU CLUB DE CULTURA POP</p><h1>No vivas tus <span>obsesiones</span> a <strong>solas.</strong></h1><p>Descubrí historias, música, mundos y personas con quienes compartirlos. Un refugio social legítimo para tus intereses.</p><div className="landing-cta"><button className="signup-button" onClick={onEnter}>Entrar a Juntopia <b>›</b></button><a href="#ecosistema" className="explore-button">Explorar el universo <b>›</b></a></div><div className="social-proof"><span><i>AM</i><i>LV</i><i>MR</i></span><b>+ + +</b><small>Miles de gustos, una comunidad activa.</small></div></div>
      <div className="portal-stage" aria-label="Portal de Juntopia"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="portal-core"><span>J</span><b>PORTAL ACTIVO</b></div><article className="orbit-note note-a"><i>♫</i><span>Byteh Osaka 98'<small>Rebajado 12 compas</small></span></article><article className="orbit-note note-b"><i>C</i><span>Cyber City 1990<small>Noche Sci-Fi Club</small></span></article><article className="orbit-note note-c"><i>L</i><span>Solaris Chronicles #1<small>Capítulo 24 debate</small></span></article><article className="orbit-note note-d"><i>V</i><span>Pixel Quest DX<small>Arcade Room Abierta</small></span></article></div>
    </section>

    <section className="ecosystem-section" id="ecosistema"><div className="landing-section-head"><div><p className="landing-kicker">ECOSISTEMA RETRO-POP</p><h2>Todo lo que te gusta vive aquí.</h2><p>Ocho universos conectados para explorar sin algoritmos impersonales.</p></div><small>8 Categorías · +240 Círculos</small></div><div className="landing-category-grid">{landingCategories.map(([letter, name, detail, tone]) => <button className={`landing-category ${tone}`} key={name}><i>{letter}</i><strong>{name}</strong><span>{detail}</span></button>)}</div></section>

    <section className="landing-parties" id="parties"><div className="landing-section-head"><div><p className="landing-kicker">PARTIES EN VIVO</p><h2>Convertí tus gustos en planes.</h2><p>Sesiones sincronizadas, debates de estreno y salas de juego organizadas por la comunidad.</p></div><a href="#parties">Ver calendario de eventos ›</a></div><div className="landing-party-grid">{landingParties.map(([tag, title, text, time, people, tone]) => <article className={`landing-party-card glass-panel ${tone}`} key={title}><div><span>{tag}</span><b>EN VIVO</b></div><h3>{title}</h3><p>{text}</p><footer><small>{time}</small><small>{people}</small></footer><button onClick={() => setSelectedParty(title)}>{selectedParty === title ? 'Party seleccionada' : 'Ver Party'}</button></article>)}</div></section>

    <section className="features-section" id="como-funciona"><div className="features-intro"><p className="landing-kicker">LA FILOSOFÍA JUNTOPIA</p><h2>Diseñado por y para fanáticos de la<br />cultura pop.</h2><p>Olvidate del scroll infinito sin alma. Construimos un espacio con memoria, coleccionismo y calor humano.</p></div><div className="feature-grid">{[['01', 'Guardá lo que amás', 'Creá tu biblioteca personal curada: ordená temáticas de películas, libros, tomos de manga y colecciones de juegos sin desorden publicitario.', 'Escuchá sin límites'], ['02', 'Encontrá a tu gente', 'Conectá por gustos reales en lugar de feeds adictivos. Clubes temáticos pequeños, charlas profundas y círculos de confianza genuina.', 'Sin métricas de vanidad'], ['03', 'Armá un plan', 'Transformá cualquier recomendación en una experiencia compartida. Creá una Party con un solo click y vivan el estreno o reto juntos.', 'Sincronización en vivo']].map(([number,title,text,link]) => <article className="feature-card glass-panel" key={number}><i>{number}</i><h3>{title}</h3><p>{text}</p><a href="#top">{link} ›</a></article>)}</div></section>

    <section className="landing-final" id="creadores"><p className="landing-kicker">ACCESO COMUNITARIO ABIERTO</p><h2>Tu próximo mundo<br />favorito empieza aquí.</h2><p>Unite a miles de compas que ya comparten lo que aman. Sin algoritmos vacíos, sin ruido publicitario.</p><button className="signup-button" onClick={onEnter}>Crear mi cuenta gratis</button><small>Registro en 30 segundos · 100% libre de spam</small></section>
    <footer className="landing-footer"><div><img src={logo} alt="Juntopia" /><p>Juntopia — gustos se vuelven conexiones.</p></div><b>Juntopia</b><nav><a href="#top">Discord</a><a href="#top">Instagram</a></nav><small>© 2026 Juntopia. Todos los derechos reservados.</small></footer>
  </main>
}

function App() {
  const [activeNav, setActiveNav] = useState('Inicio')
  const [joined, setJoined] = useState([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLightMode, setIsLightMode] = useState(false)
  const [view, setView] = useState('landing')
  const nav = [['⌂', 'Inicio'], ['⌕', 'Descubrir'], ['✦', 'Parties'], ['▱', 'Biblioteca'], ['▤', 'Colecciones'], ['◌', 'Amigos']]
  const toggleParty = (title) => setJoined((current) => current.includes(title) ? current.filter((party) => party !== title) : [...current, title])

  if (view === 'landing') return <Landing onEnter={() => setView('dashboard')} isLightMode={isLightMode} setIsLightMode={setIsLightMode} />

  return <main className={`app-shell ${isLightMode ? 'light-mode' : ''}`}>
    <div className="ambient ambient-one" /><div className="ambient ambient-two" /><div className="grid-overlay" />
    <aside className="sidebar glass-panel">
      <a className="brand" href="#top" aria-label="Ir a la página de inicio" onClick={(event) => { event.preventDefault(); setView('landing') }}><img src={logo} alt="Juntopia" /></a>
      <nav className="primary-nav" aria-label="Navegación principal">{nav.map(([icon, item]) => <button key={item} className={activeNav === item ? 'nav-item active' : 'nav-item'} onClick={() => setActiveNav(item)}><span aria-hidden="true">{icon}</span>{item}</button>)}</nav>
      <div className="sidebar-rule" /><button className="nav-item"><span>◉</span>Mi perfil</button><button className="nav-item"><span>⚙</span>Configuración</button>
      <section className="plus-card"><span className="sparkle">✦</span><p className="eyebrow">JUNTOPIA PLUS</p><h2>Tu club, sin límites.</h2><p>Personaliza tus colecciones y crea Parties especiales.</p><button>Mejorar plan <span>↗</span></button></section>
    </aside>

    <section className="dashboard" id="inicio">
      <header className="topbar glass-panel"><label className="search"><span>⌕</span><input placeholder="Busca tu próxima obsesión..." /></label><div className="top-actions"><button className="theme-toggle" onClick={() => setIsLightMode(!isLightMode)} aria-label={isLightMode ? 'Activar modo oscuro' : 'Activar modo claro'}><b>{isLightMode ? 'Modo claro' : 'Modo oscuro'}</b></button><button className="icon-button notification" aria-label="Notificaciones">♧<i /></button><button className="icon-button" aria-label="Mensajes">▢</button><button className="avatar-button" aria-label="Abrir perfil"><span>AM</span><b>⌄</b></button></div></header>
      <section className="welcome-panel glass-panel">
        <div className="star-grid" aria-hidden="true" />
        <div className="welcome-copy">
          <div className="welcome-tags"><span>● SINTONÍA ESTÉREO 432HZ</span><span>✦ EXPEDICIÓN NOCTURNA</span></div>
          <h1>¡Hola de nuevo,<br /><strong>Alex</strong>! <em>✦</em></h1>
          <h2>Todo lo que te apasiona se vive mejor en sintonía.</h2>
          <p>Tu refugio digital entre el bosque místico y la sala arcade. Conectate a Parties en vivo, explorá canales Hi-Fi bajo las estrellas y coleccioná universos geek junto a tu comunidad.</p>
          <div className="welcome-actions"><button className="primary-action">◉ &nbsp; Sintonizar Party en vivo <b>›</b></button><button className="secondary-action">✿ &nbsp; Explorar 9 Portales</button></div>
        </div>
        <article className="radio-card">
          <div className="radio-title"><span>▣ Cabaña Estéreo</span><b>HI-FI LIVE</b></div>
          <div className="radio-art"><span>✦</span><i>⌂</i><small>ON AIR</small></div>
          <div className="listeners"><span>● 42,180 oyentes</span><b>◖</b></div>
          <div className="track-info"><div><strong>LoFi Forest Nightfall</strong><span>Cinta análoga · Side B · No. 24 · Lluvia suave & pinos</span></div><b>96.4 FM</b></div>
          <div className="equalizer"><i /><i /><i /><i /><i /><i /><i /><i /></div>
        </article>
      </section>
      <section className="category-grid" aria-label="Categorías">{categories.map(([icon, name, className]) => <button className={`category-card ${className}`} key={name}><span>{icon}</span><strong>{name}</strong><i>✦</i></button>)}</section>
      <section className="content-section"><div className="section-heading"><h2><span>✦</span> Recomendado para ti</h2><button>Ver todo <b>→</b></button></div><div className="recommendation-row">{recommendations.map(([cover, symbol, title, type, rating]) => <article className="recommendation-card glass-panel" key={title}><div className={`cover ${cover}`}><span>{symbol}</span></div><div className="recommendation-info"><div><h3>{title}</h3><p>{type}</p></div><b>★ {rating}</b></div></article>)}</div></section>
      <section className="content-section"><div className="section-heading"><h2><span>✦</span> Parties activas</h2><button>Ver todas <b>→</b></button></div><div className="party-row">{parties.map(([className, icon, title, people]) => <article className={`party-card ${className}`} key={title}><div className="party-stars">✦ · ✧ · ✦</div><span className="party-icon">{icon}</span><div className="party-details"><h3>{title}</h3><p>◉ {people}</p></div><button onClick={() => toggleParty(title)}>{joined.includes(title) ? '¡Te uniste!' : 'Unirme'}</button></article>)}</div></section>
    </section>

    <aside className="right-rail">
      <section className="side-card glass-panel"><div className="rail-heading"><h2>◉ Mis amigos</h2><button>Ver todos</button></div>{[['LM','Luna.r','Escuchando música','violet'],['TG','TavoG','En una Party','cyan'],['MB','MeliBooks','Leyendo','orange']].map(([initials,name,status,colour]) => <div className="friend" key={name}><span className={`friend-avatar ${colour}`}>{initials}<i /></span><div><strong>{name}</strong><p>{status}</p></div></div>)}</section>
      <section className="side-card glass-panel plans"><div className="rail-heading"><h2>▣ Mis planes</h2><button>Agenda</button></div>{[['HOY','♫','Escucha grupal','20:00 · Sala de Música','pink'],['MAÑ','▱','Club de lectura','18:00 · Heartstopper','yellow'],['SÁB','▣','Noche de Cine','21:00 · Spider-Verse','coral']].map(([day,icon,title,time,colour]) => <div className="plan" key={title}><span className={`plan-day ${colour}`}><small>{day}</small>{icon}</span><div><strong>{title}</strong><p>{time}</p></div></div>)}</section>
    </aside>
    <footer className="player glass-panel"><div className="album-art">♫</div><div className="now-playing"><strong>Suficiente</strong><span>Morat</span></div><button className="like" aria-label="Añadir a favoritos">♡</button><div className="player-controls"><div><button>↤</button><button className="play-button" onClick={() => setIsPlaying(!isPlaying)}>{isPlaying ? 'Ⅱ' : '▶'}</button><button>↦</button></div><div className="progress"><span>1:24</span><div><i /></div><span>3:37</span></div></div><div className="volume"><span>⌁</span><span>♬</span><div><i /></div></div></footer>
  </main>
}

export default App
