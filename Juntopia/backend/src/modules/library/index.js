import { resource } from "../../shared/resource.js";
export const libraryModule = {
  name: "library",
  rpcs: [],
  resources: {
    user_content_status: resource(
      "user_id content_id status favorite progress emotional_tags",
      {
        operations: ["list", "upsert", "remove"],
        owner: "user_id",
        conflict: "user_id,content_id",
        order: null,
        related: true,
      },
    ),
    reviews: resource("id user_id content_id rating body created_at", {
      operations: ["list", "upsert", "remove"],
      write: "user_id content_id rating body",
      owner: "user_id",
      conflict: "user_id,content_id",
    }),
    collections: resource(
      "id user_id title description visibility created_at",
      { write: "user_id title description visibility", owner: "user_id" },
    ),
    collection_items: resource("collection_id content_id", {
      operations: ["list", "insert", "remove"],
      order: null,
      related: true,
    }),
  },
};
