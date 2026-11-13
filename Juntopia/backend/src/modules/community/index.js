import { resource } from "../../shared/resource.js";
export const communityModule = {
  name: "community",
  rpcs: [],
  resources: {
    member_cards: resource(
      "id display_name username bio avatar_base avatar_color avatar_options discoverable",
      { operations: ["list", "one"], write: "", order: "display_name" },
    ),
    friendships: resource("id requester_id addressee_id status created_at", {
      operations: ["list", "insert", "update", "remove"],
      write: "requester_id addressee_id status",
      owner: "requester_id",
    }),
    blocks: resource("blocker_id blocked_id created_at", {
      operations: ["list", "insert", "remove"],
      write: "blocker_id blocked_id",
      owner: "blocker_id",
    }),
    conversations: resource("id member_a member_b created_at", {
      operations: ["list", "insert"],
      write: "member_a member_b",
      owner: "member_a",
    }),
    messages: resource("id conversation_id user_id body created_at", {
      operations: ["list", "insert", "remove"],
      write: "conversation_id user_id body",
      owner: "user_id",
    }),
    notifications: resource("id user_id title destination is_read created_at", {
      operations: ["list", "update"],
      write: "is_read",
    }),
  },
};
