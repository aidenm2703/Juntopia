import { ApiError } from "./errors.js";
export function resource(
  columns,
  {
    operations = ["list", "one", "insert", "update", "remove"],
    write = columns,
    owner,
    conflict = "id",
    related = false,
    order = "created_at",
  } = {},
) {
  return Object.freeze({
    columns: columns.split(" "),
    write: write.split(" ").filter(Boolean),
    operations,
    owner,
    conflict,
    related,
    order,
  });
}
export function object(value) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new ApiError(400, "INVALID_OBJECT", "Se requiere un objeto JSON.");
  return value;
}
export function filters(value, definition, required = false) {
  const result = object(value || {});
  if (required && !Object.keys(result).length)
    throw new ApiError(
      400,
      "FILTER_REQUIRED",
      "Especificá el registro que querés modificar.",
    );
  for (const [key, item] of Object.entries(result))
    if (
      !definition.columns.includes(key) ||
      !["string", "number", "boolean"].includes(typeof item) ||
      String(item).length > 2000
    )
      throw new ApiError(400, "INVALID_FILTER", "Filtro no permitido.");
  return result;
}
export function writeValues(value, definition, userId) {
  object(value);
  if (!Object.keys(value).length)
    throw new ApiError(
      400,
      "EMPTY_VALUES",
      "Faltan los datos de la operación.",
    );
  for (const key of Object.keys(value))
    if (!definition.write.includes(key))
      throw new ApiError(400, "INVALID_FIELD", `Campo no permitido: ${key}`);
  if (
    definition.owner &&
    value[definition.owner] !== undefined &&
    value[definition.owner] !== userId
  )
    throw new ApiError(
      403,
      "OWNER_MISMATCH",
      "No podés asignar datos a otra cuenta.",
    );
  return value;
}
export function listOptions(value, definition) {
  object(value);
  for (const key of Object.keys(value))
    if (!["filters", "order", "ascending", "limit", "select"].includes(key))
      throw new ApiError(
        400,
        "INVALID_OPTION",
        "Opción de consulta no permitida.",
      );
  const limit = value.limit ?? 100,
    order = value.order === undefined ? definition.order : value.order;
  if (!Number.isInteger(limit) || limit < 1 || limit > 500)
    throw new ApiError(
      400,
      "INVALID_LIMIT",
      "El límite debe estar entre 1 y 500.",
    );
  if (order !== null && !definition.columns.includes(order))
    throw new ApiError(400, "INVALID_ORDER", "Orden no permitido.");
  if (value.ascending !== undefined && typeof value.ascending !== "boolean")
    throw new ApiError(400, "INVALID_ORDER", "El orden debe ser booleano.");
  if (
    value.select !== undefined &&
    (typeof value.select !== "string" || value.select.length > 100)
  )
    throw new ApiError(400, "INVALID_SELECT", "Selección no permitida.");
  const select = (value.select || "*").replace(/\s/g, "");
  if (
    select !== "*" &&
    !(definition.related && select === "*,content_items(*)")
  )
    throw new ApiError(
      400,
      "INVALID_SELECT",
      "Selección de campos no permitida.",
    );
  return {
    filters: filters(value.filters, definition),
    limit,
    order,
    ascending: value.ascending ?? false,
    select,
  };
}
