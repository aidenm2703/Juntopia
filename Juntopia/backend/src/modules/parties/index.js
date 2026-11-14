import { resource } from "../../shared/resource.js";
export const partiesModule = {
  name: "parties",
  rpcs: ["set_party_rsvp", "party_heartbeat"],
  resources: {
    parties: resource(
      "id host_id title description category content_id starts_at timezone duration_minutes capacity privacy mode official_url rules status created_at",
      {
        operations: ["list", "one", "insert", "update"],
        write:
          "host_id title description category content_id starts_at timezone duration_minutes capacity privacy mode official_url rules status",
        owner: "host_id",
      },
    ),
    party_invites: resource("party_id user_id", {
      operations: ["list", "insert", "remove"],
      order: null,
    }),
    party_bans: resource("party_id user_id", {
      operations: ["list", "insert", "remove"],
      order: null,
    }),
    party_attendees: resource("party_id user_id rsvp created_at", {
      operations: ["list"],
      write: "",
    }),
    party_presence: resource("party_id user_id seen_at", {
      operations: ["list"],
      write: "",
      order: "seen_at",
    }),
    party_messages: resource("id party_id user_id body created_at", {
      operations: ["list", "insert", "remove"],
      write: "party_id user_id body",
      owner: "user_id",
    }),
    party_queue: resource("id party_id content_id user_id created_at", {
      operations: ["list", "insert", "remove"],
      write: "party_id content_id user_id",
      owner: "user_id",
      related: true,
    }),
    party_votes: resource("queue_id user_id", {
      operations: ["list", "insert", "remove"],
      owner: "user_id",
      order: null,
    }),
  },
};
