import { resource } from "../../shared/resource.js";
export const accountModule = {
  name: "account",
  rpcs: ["accept_policy", "save_profile"],
  resources: {
    profiles: resource(
      "id display_name username bio avatar_base avatar_color avatar_options interests onboarding_step onboarding_complete activity_visible created_at",
      { operations: ["list", "one"], write: "", owner: "id" },
    ),
    policy_acceptances: resource("user_id version accepted_at", {
      operations: ["list"],
      order: null,
      write: "",
    }),
    user_settings: resource("user_id theme timezone activity_visible", {
      operations: ["list", "upsert", "update"],
      owner: "user_id",
      conflict: "user_id",
      order: null,
    }),
  },
};
