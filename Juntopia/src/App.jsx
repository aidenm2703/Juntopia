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

function App() {
  const [activeNav, setActiveNav] = useState('Inicio')
  const [joined, setJoined] = useState([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLightMode, setIsLightMode] = useState(false)
  const nav = [['⌂', 'Inicio'], ['⌕', 'Descubrir'], ['✦', 'Parties'], ['▱', 'Biblioteca'], ['▤', 'Colecciones'], ['◌', 'Amigos']]
  const toggleParty = (title) => setJoined((current) => current.includes(title) ? current.filter((party) => party !== title) : [...current, title])

  return <main className={`app-shell ${isLightMode ? 'light-mode' : ''}`}>
    <div className="ambient ambient-one" /><div className="ambient ambient-two" /><div className="grid-overlay" />
    <aside className="sidebar glass-panel">
      <a className="brand" href="#inicio" aria-label="Juntopia, inicio"><img src={logo} alt="Juntopia" /></a>
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
