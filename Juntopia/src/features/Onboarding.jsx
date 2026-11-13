import { useState } from 'react';
import { Avatar } from '../components/Avatar';
import { avatarNames, interests, saveProfile } from '../lib/profile';
export function Onboarding({ initial, done }) {
    const [profile, setProfile] = useState(initial);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const step = profile.onboarding_step;
    async function next(direction = 1) {
        if (step === 1 && direction > 0 && (!profile.display_name.trim() || !/^[a-z0-9_]{3,24}$/.test(profile.username))) {
            setError('Elegí un nombre y un identificador de 3 a 24 letras minúsculas, números o guiones bajos.');
            return;
        }
        const updated = { ...profile, onboarding_step: Math.max(0, Math.min(3, step + direction)), onboarding_complete: step === 3 && direction > 0 };
        setBusy(true);
        setError('');
        try {
            await saveProfile(updated);
            setProfile(updated);
            if (updated.onboarding_complete)
                done(updated);
        }
        catch {
            setError('No pudimos guardar. El identificador podría estar ocupado. Revisá tu conexión e intentá de nuevo.');
        }
        finally {
            setBusy(false);
        }
    }
    return <section className="onboarding panel"><p className="eyebrow">HACÉ TUYO ESTE LUGAR · {step + 1} / 4</p><progress max={4} value={step + 1}/><h1>{['Una cara para tu aventura.', '¿Cómo te llamamos?', 'Seguí tu curiosidad.', 'A tu propio ritmo.'][step]}</h1>{step === 0 && <><div className="avatar-grid">{avatarNames.map((name, base) => <button key={name} aria-pressed={profile.avatar_base === base} onClick={() => setProfile({ ...profile, avatar_base: base })}><Avatar base={base} color={profile.avatar_color}/>{name}</button>)}</div><label>Color de fondo<input type="color" value={profile.avatar_color} onChange={e => setProfile({ ...profile, avatar_color: e.target.value })}/></label></>}{step === 1 && <><label>Nombre visible<input maxLength={50} value={profile.display_name} onChange={e => setProfile({ ...profile, display_name: e.target.value })}/></label><label>Identificador único<input maxLength={24} value={profile.username} onChange={e => setProfile({ ...profile, username: e.target.value.toLowerCase() })}/></label><label>Algo sobre vos<textarea maxLength={280} value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })}/></label></>}{step === 2 && <><p>Elegí lo que te mueve. También podés decidirlo después.</p><div className="chips">{interests.map(item => <button key={item} aria-pressed={profile.interests.includes(item)} onClick={() => setProfile({ ...profile, interests: profile.interests.includes(item) ? profile.interests.filter(i => i !== item) : [...profile.interests, item] })}>{item}</button>)}</div></>}{step === 3 && <><div className="avatar-preview"><Avatar base={profile.avatar_base} color={profile.avatar_color}/></div><p>Tu perfil y tus preferencias se guardan de forma privada.</p><label className="check"><input type="checkbox" checked={profile.activity_visible} onChange={e => setProfile({ ...profile, activity_visible: e.target.checked })}/>Permitir compartir mi actividad cuando esté disponible la comunidad.</label></>}<p role="alert">{error}</p><div className="actions">{step > 0 && <button disabled={busy} onClick={() => next(-1)}>Atrás</button>}<button className="primary" disabled={busy} onClick={() => next()}>{busy ? 'Guardando…' : step === 3 ? 'Entrar a Juntopia' : 'Guardar y continuar'}</button></div></section>;
}
