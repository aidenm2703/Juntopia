import { repository } from "../../../shared/data/repository.js";
import { emptyProfile } from "../../../shared/domain/profile.js";
export {
  avatarNames,
  interests,
  emptyProfile,
} from "../../../shared/domain/profile.js";

export async function loadProfile(id) {
  return (await repository.one("profiles", id)) ?? emptyProfile(id);
}
export async function saveProfile(profile, visible = false) {
  return repository.rpc("save_profile", { profile_data: profile, visible });
}
