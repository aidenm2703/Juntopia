export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
export function databaseError(error) {
  const status =
    {
      23505: 409,
      23514: 400,
      22023: 400,
      23503: 400,
      23502: 400,
      "22P02": 400,
      22007: 400,
      42501: 403,
      PGRST116: 404,
    }[error?.code] || (error?.status === 429 ? 429 : 502);
  const message =
    status === 403
      ? "No tenés permiso para esta acción."
      : status === 409
        ? "Ya existe un registro con esos datos."
        : status === 400
          ? "Revisá los valores enviados."
          : status === 404
            ? "Contenido no disponible."
            : "No pudimos completar la operación con el servicio de datos.";
  return new ApiError(status, error?.code || "DATA_SERVICE_ERROR", message);
}
