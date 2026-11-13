import { resource } from "../../shared/resource.js";
export const creatorsModule = {
  name: "creators",
  rpcs: [],
  resources: {
    creator_works: resource(
      "id user_id kind title body asset_path visibility license attribution created_at",
      {
        write:
          "user_id kind title body asset_path visibility license attribution",
        owner: "user_id",
      },
    ),
    work_comments: resource("id work_id user_id body created_at", {
      operations: ["list", "insert", "remove"],
      write: "work_id user_id body",
      owner: "user_id",
    }),
  },
};
