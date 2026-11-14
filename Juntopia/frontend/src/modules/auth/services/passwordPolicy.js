export const passwordHint = "Mínimo 8 caracteres y una mayúscula.";
export const passwordPattern = "(?=.*\\p{Lu}).{8,}";
export function validPassword(password) {
  return (
    typeof password === "string" &&
    password.length >= 8 &&
    password.length <= 128 &&
    /\p{Lu}/u.test(password)
  );
}
