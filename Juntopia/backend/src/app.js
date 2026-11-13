import { randomUUID } from "node:crypto";
import { ApiError } from "./shared/errors.js";
import {
  configureResponse,
  readBody,
  sendJson,
  createRateLimiter,
} from "./middleware/http.js";
import { createAuthenticator } from "./middleware/authenticate.js";
import { resourceRoutes, rpcRoutes } from "./routes/index.js";
import { createResourceController } from "./controllers/resource.controller.js";
import { callRpc } from "./controllers/rpc.controller.js";
import { accountExportService } from "./modules/account/export.service.js";
import { createStorageService } from "./modules/creators/storage.service.js";
import { register, changePassword } from "./modules/auth/auth.service.js";
export function createApp({
  config,
  authenticate = createAuthenticator(config),
}) {
  const limit = createRateLimiter(config.requestsPerMinute);
  const registrationLimit = createRateLimiter(10);
  return async (request, response) => {
    response.setHeader("X-Request-Id", randomUUID());
    try {
      configureResponse(request, response, config);
      if (request.url.length > 10000)
        throw new ApiError(414, "URI_TOO_LONG", "Consulta demasiado larga.");
      const url = new URL(request.url, "http://localhost");
      if (request.method === "OPTIONS") {
        response.writeHead(204);
        response.end();
        return;
      }
      if (request.method === "GET" && url.pathname === "/api/health") {
        sendJson(response, 200, {
          data: { status: "ok", service: "juntopia-backend" },
        });
        return;
      }
      if (url.pathname === "/api/auth/register") {
        if (request.method !== "POST")
          throw new ApiError(405, "METHOD_NOT_ALLOWED", "Método no permitido.");
        registrationLimit(request.socket.remoteAddress);
        const data = await register(
          config,
          await readBody(request, config.jsonLimit),
        );
        sendJson(response, 200, { data });
        return;
      }
      const segments = url.pathname.split("/").filter(Boolean);
      const base = "/" + segments.slice(0, 3).join("/");
      const definition = resourceRoutes.get(base);
      const rpc = rpcRoutes.get(url.pathname);
      const custom = [
        "/api/account/export",
        "/api/creators/files",
        "/api/creators/files/signed",
        "/api/auth/password",
      ].includes(url.pathname);
      if (!rpc && !custom && (!definition || segments.length > 4))
        throw new ApiError(404, "NOT_FOUND", "Ruta no disponible.");
      const context = await authenticate(request);
      limit(context.user.id);
      const readJson = () => readBody(request, config.jsonLimit);
      let data;
      if (url.pathname === "/api/auth/password") {
        if (request.method !== "POST")
          throw new ApiError(405, "METHOD_NOT_ALLOWED", "Método no permitido.");
        data = await changePassword(config, context, await readJson());
      } else if (rpc) {
        if (request.method !== "POST")
          throw new ApiError(405, "METHOD_NOT_ALLOWED", "Método no permitido.");
        data = await callRpc(context, rpc, await readJson());
      } else if (url.pathname === "/api/account/export") {
        if (request.method !== "GET")
          throw new ApiError(405, "METHOD_NOT_ALLOWED", "Método no permitido.");
        data = await accountExportService(context.db).exportData(
          context.user.id,
        );
      } else if (custom) {
        const storage = createStorageService(context);
        if (url.pathname.endsWith("/signed") && request.method === "POST") {
          const body = await readJson();
          data = await storage.signed(body.path);
        } else if (
          url.pathname === "/api/creators/files" &&
          request.method === "POST"
        ) {
          const type = request.headers["content-type"]?.split(";")[0];
          data = await storage.upload(
            await readBody(request, config.uploadLimit, true),
            type,
          );
        } else if (
          url.pathname === "/api/creators/files" &&
          request.method === "DELETE"
        ) {
          const body = await readJson();
          data = await storage.remove(body.path);
        } else
          throw new ApiError(405, "METHOD_NOT_ALLOWED", "Método no permitido.");
      } else
        data = await createResourceController(context)({
          ...definition,
          request,
          url,
          id: segments[3],
          readJson,
        });
      sendJson(response, 200, { data: data ?? null });
    } catch (error) {
      if (response.headersSent) {
        response.destroy();
        return;
      }
      const known = error instanceof ApiError;
      if (error.status === 429) response.setHeader("Retry-After", "60");
      if (error.status === 413) response.setHeader("Connection", "close");
      sendJson(response, known ? error.status : 500, {
        error: {
          code: known ? error.code : "INTERNAL_ERROR",
          message: known
            ? error.message
            : "Ocurrió un error al procesar la solicitud.",
        },
      });
    }
  };
}
