import { ApiError } from "../shared/errors.js";
export function configureResponse(request, response, config) {
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader("Referrer-Policy", "no-referrer");
  response.setHeader(
    "Content-Security-Policy",
    "default-src 'none'; frame-ancestors 'none'",
  );
  const origin = request.headers.origin;
  if (origin) {
    if (!config.origins.includes(origin))
      throw new ApiError(403, "ORIGIN_DENIED", "Origen no permitido.");
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Vary", "Origin");
    response.setHeader(
      "Access-Control-Allow-Headers",
      "Authorization, Content-Type",
    );
    response.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    );
  }
}
export function readBody(request, limit, binary = false) {
  if (Number(request.headers["content-length"]) > limit)
    throw new ApiError(
      413,
      "BODY_TOO_LARGE",
      "El archivo o contenido supera el límite permitido.",
    );
  if (
    !binary &&
    request.headers["content-type"]?.split(";")[0] !== "application/json"
  )
    throw new ApiError(415, "JSON_REQUIRED", "Se requiere contenido JSON.");
  return new Promise((resolve, reject) => {
    let size = 0,
      failed = false;
    const parts = [];
    request.on("data", (part) => {
      size += part.length;
      if (size > limit) {
        if (!failed) {
          failed = true;
          parts.length = 0;
          reject(
            new ApiError(
              413,
              "BODY_TOO_LARGE",
              "El contenido supera el límite permitido.",
            ),
          );
        }
      } else if (!failed) parts.push(part);
    });
    request.on("end", () => {
      if (failed) return;
      const buffer = Buffer.concat(parts);
      if (binary) {
        resolve(buffer);
        return;
      }
      try {
        resolve(JSON.parse(buffer.toString("utf8")));
      } catch {
        reject(
          new ApiError(400, "INVALID_JSON", "El JSON enviado no es válido."),
        );
      }
    });
    request.on("error", () =>
      reject(
        new ApiError(
          400,
          "REQUEST_INTERRUPTED",
          "La solicitud fue interrumpida.",
        ),
      ),
    );
  });
}
export function createRateLimiter(maximum) {
  const users = new Map();
  return (id) => {
    const now = Date.now();
    let entry = users.get(id);
    if (!entry || entry.until <= now) {
      entry = { count: 0, until: now + 60000 };
      users.set(id, entry);
    }
    entry.count++;
    if (users.size > 10000)
      for (const [key, value] of users)
        if (value.until <= now) users.delete(key);
    if (entry.count > maximum)
      throw new ApiError(
        429,
        "RATE_LIMIT",
        "Demasiadas solicitudes. Esperá un minuto.",
      );
  };
}
export function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(payload));
}
