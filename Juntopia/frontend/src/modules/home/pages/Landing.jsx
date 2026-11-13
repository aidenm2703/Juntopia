export function Landing({ navigate }) {
  return (
    <>
      <section className="landing">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="tiny-leaf">✦</span> DIFERENTES CAMINOS. UN MISMO
            LUGAR.
          </p>
          <h1>
            Lo lindo de un plan
            <br />
            es <em>compartirlo.</em>
          </h1>
          <p className="intro">
            Un libro que te atrapa. Esa canción en repeat.
            <br className="desktop" /> Una partida que se alarga. Todo se
            disfruta más en compañía.
          </p>
          <div className="actions">
            <button className="primary" onClick={() => navigate("register")}>
              Encontrá tu lugar <span>↗</span>
            </button>
            <button className="text-button" onClick={() => navigate("login")}>
              Ya tengo cuenta →
            </button>
          </div>
          <p className="hero-note">
            Un espacio para conectar, sin importar la distancia.
          </p>
        </div>
        <div
          className="forest-art"
          role="img"
          aria-label="Ilustración de un refugio iluminado entre árboles y caminos que convergen"
        >
          <div className="moon" />
          <div className="hill hill-back" />
          <div className="hill hill-front" />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={`tree tree-${i}`}>
              <i />
              <b />
            </div>
          ))}
          <div className="path" />
          <div className="cabin">
            <div className="roof" />
            <div className="house">
              <i />
              <i />
              <b />
            </div>
            <div className="deck" />
          </div>
          <span className="firefly f1" />
          <span className="firefly f2" />
          <span className="firefly f3" />
          <div className="art-label">
            <span>✧</span>
            <div>
              <small>BIENVENIDO A JUNTOPIA</small>
              <strong>¿Cuál es el plan de hoy?</strong>
            </div>
          </div>
        </div>
      </section>
      <section id="como-funciona" className="discovery">
        <div className="section-heading">
          <div>
            <p className="eyebrow">SEGUÍ TU CURIOSIDAD</p>
            <h2>Hay un mundo para encontrarnos.</h2>
          </div>
          <p>
            Traé tus gustos.
            <br />
            Los planes los hacemos juntos.
          </p>
        </div>
        <div className="category-grid">
          {[
            ["♫", "Música", "Canciones que acercan."],
            ["▤", "Cine y series", "Una historia, mil conversaciones."],
            ["▥", "Libros", "Compartí otros mundos."],
            ["✣", "Videojuegos", "La próxima partida, en equipo."],
          ].map(([icon, title, text], i) => (
            <article className={`category category-${i}`} key={title}>
              <span aria-hidden="true">{icon}</span>
              <h3>{title}</h3>
              <p>{text}</p>
              <small>PRÓXIMAMENTE</small>
            </article>
          ))}
        </div>
      </section>
      <section className="manifesto">
        <span aria-hidden="true">♧</span>
        <h2>
          Un refugio para ser vos.
          <br />Y encontrar a tu gente.
        </h2>
        <p>
          Sin correr detrás de un feed infinito. Un lugar al que volver para
          descubrir, conversar y hacer algo juntos.
        </p>
      </section>
    </>
  );
}
