import { ApiError } from "../shared/errors.js";
import { filters, listOptions, writeValues } from "../shared/resource.js";
import { createRepository } from "../database/repositories/resource.repository.js";
export function createResourceService(context) {
  const repository = createRepository(context.db);
  return async (table, definition, operation, input) => {
    if (!definition.operations.includes(operation))
      throw new ApiError(
        405,
        "OPERATION_DENIED",
        "Operación no disponible para este recurso.",
      );
    if (operation === "list")
      return repository.list(table, listOptions(input, definition));
    if (operation === "one") return repository.one(table, input);
    if (operation === "remove")
      return repository.remove(table, filters(input, definition, true));
    if (operation === "insert")
      return repository.insert(
        table,
        writeValues(input, definition, context.user.id),
      );
    if (operation === "upsert") {
      const conflict = input.onConflict || definition.conflict;
      if (conflict !== definition.conflict)
        throw new ApiError(
          400,
          "INVALID_CONFLICT",
          "Clave de conflicto no permitida.",
        );
      return repository.upsert(
        table,
        writeValues(input.values, definition, context.user.id),
        conflict,
      );
    }
    return repository.update(
      table,
      writeValues(input.values, definition, context.user.id),
      filters(input.filters, definition, true),
    );
  };
}
