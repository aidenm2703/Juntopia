import { ApiError } from "../../shared/errors.js";
export function requirePassword(password) {
  if (
    typeof password !== "string" ||
    password.length < 8 ||
    password.length > 128 ||
    !/\p{Lu}/u.test(password)
  )
    throw new ApiError(
      400,
      "PASSWORD_POLICY",
      "La contraseña debe tener al menos 8 caracteres y una mayúscula.",
    );
  return password;
}
