import { request } from "./http.js";
import { resourcePaths, rpcPaths } from "./routes.js";
function route(table) {
  const path = resourcePaths[table];
  if (!path) throw new Error("Unknown resource");
  return path;
}
export const repository = {
  list(table, options = {}) {
    return request(
      route(table) +
        "?" +
        new URLSearchParams({ options: JSON.stringify(options) }),
    );
  },
  one(table, id) {
    return request(route(table) + "/" + encodeURIComponent(id));
  },
  insert(table, values) {
    return request(route(table), { method: "POST", body: values });
  },
  upsert(table, values, onConflict) {
    return request(route(table), {
      method: "PUT",
      body: { values, onConflict },
    });
  },
  update(table, values, filters) {
    return request(route(table), {
      method: "PATCH",
      body: { values, filters },
    });
  },
  remove(table, filters) {
    return request(route(table), { method: "DELETE", body: filters });
  },
  rpc(name, values = {}) {
    if (!rpcPaths[name]) throw new Error("Unknown action");
    return request(rpcPaths[name], { method: "POST", body: values });
  },
};
