import { resource } from "../../shared/resource.js";
export const moderationModule = {
  name: "moderation",
  rpcs: ["is_moderator", "moderate_report"],
  resources: {
    reports: resource(
      "id user_id subject_type subject_id reason status created_at",
      {
        operations: ["list", "insert"],
        write: "user_id subject_type subject_id reason",
        owner: "user_id",
      },
    ),
  },
};
