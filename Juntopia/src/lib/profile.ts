import { supabase } from './supabase'
export const avatarNames = ['Sendero', 'Brisa', 'Cedro', 'Aurora', 'Musgo', 'Lumbre']
export const interests = ['Música', 'Cine y series', 'Libros', 'Videojuegos', 'Anime y manga', 'Arte', 'Podcasts', 'Documentales']
export type Profile = { id: string; display_name: string; username: string; bio: string; avatar_base: number; avatar_color: string; interests: string[]; onboarding_step: number; onboarding_complete: boolean; activity_visible: boolean }
export const emptyProfile = (id: string): Profile => ({ id, display_name: '', username: '', bio: '', avatar_base: 0, avatar_color: '#a5c86a', interests: [], onboarding_step: 0, onboarding_complete: false, activity_visible: false })
export async function loadProfile(id: string) {
  const { data, error } = await supabase!.from('profiles').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return (data as Profile | null) ?? emptyProfile(id)
}
export async function saveProfile(profile: Profile) {
  const { error } = await supabase!.from('profiles').upsert(profile)
  if (error) throw error
}
