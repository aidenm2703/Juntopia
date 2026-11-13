import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
export function Auth({ mode, close }: { mode: 'login' | 'register' | 'reset' | 'password'; close: () => void }) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase) return
    setBusy(true); setMessage('')
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') ?? '')
    const password = String(form.get('password') ?? '')
    try {
      const redirectTo = window.location.origin
      const result = mode === 'login' ? await supabase.auth.signInWithPassword({ email, password }) : mode === 'register' ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo } }) : mode === 'reset' ? await supabase.auth.resetPasswordForEmail(email, { redirectTo }) : await supabase.auth.updateUser({ password })
      if (result.error) throw result.error
      if (mode === 'login' || mode === 'password') close()
      else setMessage(mode === 'register' ? 'Revisá tu correo para confirmar tu cuenta antes de ingresar.' : 'Si existe una cuenta con ese correo, recibirás un enlace de recuperación.')
    } catch { setMessage('No pudimos completar la solicitud. Revisá los datos y tu conexión e intentá de nuevo.') }
    finally { setBusy(false) }
  }
  return <section className="auth panel" aria-labelledby="auth-title"><button className="text-button" onClick={close}>← Volver</button><p className="eyebrow">TU LUGAR TE ESPERA</p><h1 id="auth-title">{mode === 'login' ? 'Qué bueno verte.' : mode === 'register' ? 'Empezá tu camino.' : mode === 'password' ? 'Una nueva contraseña.' : 'Recuperá tu cuenta.'}</h1><form onSubmit={submit}>{mode !== 'password' && <label>Correo electrónico<input name="email" type="email" autoComplete="email" required maxLength={254}/></label>}{mode !== 'reset' && <label>Contraseña · mínimo 12 caracteres<input name="password" type="password" minLength={12} maxLength={128} autoComplete={mode==='login'?'current-password':'new-password'} required/></label>}{mode === 'register' && <p className="notice">El registro estará disponible cuando publiquemos los términos y la política de privacidad definitivos.</p>}{!supabase && <p className="notice">Estamos preparando el acceso. Falta configurar la conexión con Supabase.</p>}<button className="primary" disabled={busy || !supabase || mode==='register'}>{busy ? 'Un momento…' : mode === 'login' ? 'Ingresar' : mode === 'register' ? 'Crear cuenta · próximamente' : 'Guardar y continuar'}</button><p role="status">{message}</p></form></section>
}
