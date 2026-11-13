import { supabase } from "../../../shared/data/client.js";
import { emptyProfile } from "../../../shared/domain/profile.js";
export {
  avatarNames,
  interests,
  emptyProfile,
} from "../../../shared/domain/profile.js";
export async function loadProfile(id) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ?? emptyProfile(id);
}
export async function saveProfile(profile, visible = false) {
  const { error } = await supabase.rpc("save_profile", {
    profile_data: profile,
    visible,
  });
  if (error) throw error;
}
