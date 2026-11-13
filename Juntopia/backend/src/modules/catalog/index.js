import { resource } from "../../shared/resource.js";
export const catalogModule = {
  name: "catalog",
  rpcs: [],
  resources: {
    categories: resource("name icon color", {
      operations: ["list"],
      write: "",
      order: "name",
    }),
    content_items: resource(
      "id created_by category title author description official_url source created_at",
      {
        operations: ["list", "one", "insert", "remove"],
        write:
          "created_by category title author description official_url source",
        owner: "created_by",
      },
    ),
  },
};
