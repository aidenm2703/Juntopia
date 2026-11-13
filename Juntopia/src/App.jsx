import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { loadProfile } from './lib/profile';
import { Auth } from './features/Auth';
import { Onboarding } from './features/Onboarding';
import { Avatar } from './components/Avatar';
import './App.css';
export default function App() {
    const [view, setView] = useState('home');
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(!!supabase);
    const [error, setError] = useState('');
    const [retry, setRetry] = useState(0);
    const [theme, setTheme] = useState(() => localStorage.getItem('juntopia-theme') || 'system');
    useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('juntopia-theme', theme); }, [theme]);
    useEffect(() => {
        if (!supabase)
            return;
        let active = true;
        supabase.auth.getSession().then(({ data, error }) => { if (active) {
            setSession(data.session);
            setLoading(false);
            if (error)
                setError('No pudimos recuperar tu sesión.');
        } }).catch(() => { if (active) {
            setLoading(false);
            setError('No pudimos conectar.');
        } });
        const { data } = supabase.auth.onAuthStateChange((event, next) => { setSession(next); setProfile(null); if (event === 'PASSWORD_RECOVERY')
            setView('password'); });
        return () => { active = false; data.subscription.unsubscribe(); };
    }, []);
    useEffect(() => {
        if (!session)
            return;
        let active = true;
        loadProfile(session.user.id).then(p => { if (active) {
            setProfile(p);
            setError('');
        } }).catch(() => { if (active)
            setError('No pudimos cargar tu perfil. Revisá la conexión.'); });
        return () => { active = false; };
    }, [session, retry]);
    async function logout() { const result = await supabase.auth.signOut(); if (result.error)
        setError('No pudimos cerrar la sesión. Intentá de nuevo.');
    else {
        setSession(null);
        setProfile(null);
        setView('home');
    } }
    return <><a className="skip" href="#main">Saltar al contenido</a><header><a className="brand" href="/" aria-label="Juntopia inicio"><span aria-hidden="true">♧</span> Juntopia<span className="brand-dot">.</span></a><nav aria-label="Principal">{!session && <a href="#como-funciona">Nuestro refugio</a>}<label className="theme-label"><span className="sr-only">Tema</span><select value={theme} onChange={e => setTheme(e.target.value)}><option value="system">Sistema</option><option value="dark">Oscuro</option><option value="light">Claro</option></select></label>{session ? <button onClick={logout}>Salir</button> : <button onClick={() => setView('login')}>Ingresar ↗</button>}</nav></header><main id="main">{loading ? <p className="panel" role="status">Abriendo el refugio…</p> : view === 'password' ? <Auth mode="password" close={() => setView('home')}/> : session ? error ? <section className="panel"><p role="alert">{error}</p><button onClick={() => setRetry(n => n + 1)}>Reintentar</button></section> : !profile ? <p role="status">Preparando tu espacio…</p> : !profile.onboarding_complete ? <Onboarding initial={profile} done={setProfile}/> : <div className="dashboard"><aside className="panel"><p className="eyebrow">TU REFUGIO</p><strong>⌂ Inicio</strong><p>Descubrir · próximamente</p><p>Parties · próximamente</p><p>Biblioteca · próximamente</p><button onClick={() => setProfile({ ...profile, onboarding_complete: false, onboarding_step: 0 })}>Editar mi perfil</button></aside><section><div className="welcome"><div><p className="eyebrow">QUÉ BUENO TENERTE ACÁ</p><h1>¡Hola, {profile.display_name}!</h1><p>¿Cuál es el plan de hoy?</p></div><div className="avatar-preview"><Avatar base={profile.avatar_base} color={profile.avatar_color}/></div></div><section className="panel"><h2>Tu próximo descubrimiento</h2><p>{profile.interests.length ? `Tu camino empieza con ${profile.interests.join(', ')}.` : 'Todavía no elegiste intereses. Podés agregarlos desde tu perfil.'}</p><p>Estamos preparando el catálogo. Tus recomendaciones aparecerán aquí cuando haya contenido disponible.</p></section><section className="panel"><h2>Espacio para nuevos encuentros</h2><p>Aún no hay planes ni amistades en tu cuenta. Las Parties y la comunidad llegan en las próximas etapas.</p></section></section></div> : view !== 'home' ? <><Auth mode={view} close={() => setView('home')}/>{view === 'login' && <button className="recovery" onClick={() => setView('reset')}>Olvidé mi contraseña</button>}</> : <><section className="landing"><div className="hero-copy"><p className="eyebrow"><span className="tiny-leaf">✦</span> DIFERENTES CAMINOS. UN MISMO LUGAR.</p><h1>Lo lindo de un plan<br />es <em>compartirlo.</em></h1><p className="intro">Un libro que te atrapa. Esa canción en repeat.<br className="desktop"/> Una partida que se alarga. Todo se disfruta más en compañía.</p><div className="actions"><button className="primary" onClick={() => setView('register')}>Encontrá tu lugar <span>↗</span></button><button className="text-button" onClick={() => setView('login')}>Ya tengo cuenta →</button></div><p className="hero-note">Un espacio para conectar, sin importar la distancia.</p></div><div className="forest-art" role="img" aria-label="Ilustración de un refugio iluminado entre árboles y caminos que convergen"><div className="moon"/><div className="hill hill-back"/><div className="hill hill-front"/>{[0, 1, 2, 3, 4, 5, 6].map(i => <div key={i} className={`tree tree-${i}`}><i /><b /></div>)}<div className="path"/><div className="cabin"><div className="roof"/><div className="house"><i /><i /><b /></div><div className="deck"/></div><span className="firefly f1"/><span className="firefly f2"/><span className="firefly f3"/><div className="art-label"><span>✧</span><div><small>BIENVENIDO A JUNTOPIA</small><strong>¿Cuál es el plan de hoy?</strong></div></div></div></section><section id="como-funciona" className="discovery"><div className="section-heading"><div><p className="eyebrow">SEGUÍ TU CURIOSIDAD</p><h2>Hay un mundo para encontrarnos.</h2></div><p>Traé tus gustos.<br />Los planes los hacemos juntos.</p></div><div className="category-grid">{[['♫', 'Música', 'Canciones que acercan.'], ['▤', 'Cine y series', 'Una historia, mil conversaciones.'], ['▥', 'Libros', 'Compartí otros mundos.'], ['✣', 'Videojuegos', 'La próxima partida, en equipo.']].map(([icon, title, text], i) => <article className={`category category-${i}`} key={title}><span aria-hidden="true">{icon}</span><h3>{title}</h3><p>{text}</p><small>PRÓXIMAMENTE</small></article>)}</div></section><section className="manifesto"><span aria-hidden="true">♧</span><h2>Un refugio para ser vos.<br />Y encontrar a tu gente.</h2><p>Sin correr detrás de un feed infinito. Un lugar al que volver para descubrir, conversar y hacer algo juntos.</p></section></>}</main><footer><span className="brand">Juntopia.</span><p>Diferentes caminos, un lugar para encontrarnos.</p><small>En construcción · Hecho para compartir</small></footer></>;
}
