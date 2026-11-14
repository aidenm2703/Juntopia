import { ApiError } from "../shared/errors.js";
import { createUserDatabase } from "../database/supabase.js";
import { authUnavailable, authFailure } from "../modules/auth/auth.errors.js";
export function createAuthenticator(config, makeDatabase = createUserDatabase) {
  return async (request) => {
    const match = /^Bearer ([^\s]+)$/i.exec(
      request.headers.authorization || "",
    );
    if (!match || match[1].length > 8192)
      throw new ApiError(401, "AUTH_REQUIRED", "Ingresá para continuar.");
    const db = makeDatabase(config, match[1]);
    const { data, error } = await db.auth.getUser(match[1]);
    if (authUnavailable(error)) throw authFailure(error);
    if (error || !data.user)
      throw new ApiError(
        401,
        "INVALID_SESSION",
        "La sesión no es válida. Volvé a ingresar.",
      );
    return { db, user: data.user, token: match[1] };
  };
}
