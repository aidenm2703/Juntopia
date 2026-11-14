import { ApiError } from "../shared/errors.js";
import { object } from "../shared/resource.js";
import { createRepository } from "../database/repositories/resource.repository.js";
const signature = {
  accept_policy: [],
  is_moderator: [],
  save_profile: ["profile_data", "visible"],
  set_party_rsvp: ["target", "answer"],
  party_heartbeat: ["target"],
  moderate_report: ["target", "decision"],
};
export async function callRpc(context, name, input) {
  object(input);
  const keys = signature[name];
  if (!keys) throw new ApiError(404, "RPC_NOT_FOUND", "Acción no disponible.");
  if (Object.keys(input).some((key) => !keys.includes(key)))
    throw new ApiError(400, "INVALID_RPC_INPUT", "Parámetro no permitido.");
  if (keys.includes("target") && !/^[0-9a-f-]{36}$/i.test(input.target || ""))
    throw new ApiError(400, "INVALID_ID", "Identificador no válido.");
  if (name === "save_profile") {
    object(input.profile_data);
    if (input.profile_data.id !== context.user.id)
      throw new ApiError(403, "OWNER_MISMATCH", "No podés editar otra cuenta.");
    if (input.visible !== undefined && typeof input.visible !== "boolean")
      throw new ApiError(
        400,
        "INVALID_PRIVACY",
        "La visibilidad debe ser booleana.",
      );
  }
  if (
    name === "set_party_rsvp" &&
    !["going", "maybe", "declined"].includes(input.answer)
  )
    throw new ApiError(400, "INVALID_RSVP", "Respuesta no permitida.");
  if (
    name === "moderate_report" &&
    !["reviewed", "dismissed", "remove"].includes(input.decision)
  )
    throw new ApiError(400, "INVALID_DECISION", "Decisión no permitida.");
  return createRepository(context.db).rpc(name, input);
}
