import { ApiError } from "../shared/errors.js";
import { createResourceService } from "../services/resource.service.js";
import { object } from "../shared/resource.js";
export function createResourceController(context) {
  const execute = createResourceService(context);
  return async ({ request, url, resource, definition, id, readJson }) => {
    let operation, input;
    if (request.method === "GET") {
      if (id) {
        if (!/^[0-9a-f-]{36}$/i.test(id))
          throw new ApiError(400, "INVALID_ID", "Identificador no válido.");
        operation = "one";
        input = id;
      } else {
        operation = "list";
        try {
          input = JSON.parse(url.searchParams.get("options") || "{}");
        } catch {
          throw new ApiError(400, "INVALID_QUERY", "Consulta no válida.");
        }
      }
    } else {
      if (id) throw new ApiError(404, "NOT_FOUND", "Ruta no disponible.");
      operation = {
        POST: "insert",
        PUT: "upsert",
        PATCH: "update",
        DELETE: "remove",
      }[request.method];
      if (!operation)
        throw new ApiError(405, "METHOD_NOT_ALLOWED", "Método no permitido.");
      input = object(await readJson());
    }
    return execute(resource, definition, operation, input);
  };
}
