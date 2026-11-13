import { test } from "node:test";
import assert from "node:assert/strict";
import { validPassword } from "../src/modules/auth/services/passwordPolicy.js";
import { authErrorMessage } from "../src/modules/auth/services/authErrors.js";
import { errorMessage } from "../src/shared/domain/index.js";
import {
  authRedirectUrl,
  parseEmailLink,
  consumeEmailLink,
} from "../src/modules/auth/services/emailLinks.js";
const options = {
  projectUrl: "https://project.supabase.co",
  appUrl: "http://localhost:3000",
};
test("existing accounts and email restrictions never look like generic connection failures", () => {
  assert.match(
    authErrorMessage({ code: "user_already_exists" }),
    /Ya tengo cuenta/,
  );
  assert.match(
    authErrorMessage({ code: "email_exists" }),
    /ya tiene una cuenta/,
  );
  assert.match(
    authErrorMessage({ code: "email_address_not_authorized" }),
    /SMTP/,
  );
  assert.match(
    authErrorMessage({ code: "over_email_send_rate_limit" }),
    /límite de envíos/,
  );
  assert.equal(
    errorMessage({
      code: "INVALID_REDIRECT",
      userMessage: "La dirección de retorno no está permitida.",
    }),
    "La dirección de retorno no está permitida.",
  );
  assert.doesNotMatch(
    errorMessage({ message: "RAW PRIVATE PROVIDER DETAILS" }),
    /RAW PRIVATE/,
  );
});
test("new passwords require eight characters and an uppercase without requiring digits", () => {
  for (const value of ["Abcdefg", "abcdefgh", "12345678", ""])
    assert.equal(validPassword(value), false);
  for (const value of ["Abcdefgh", "Nueva12A", "Ábcdefgh"])
    assert.equal(validPassword(value), true);
});
test("phone localhost callback can be consumed in the desktop app", () => {
  const link = parseEmailLink(
    "http://localhost:3000/#access_token=private-access&refresh_token=private-refresh&type=recovery",
    options,
  );
  assert.equal(link.kind, "session");
  assert.equal(link.recovery, true);
  assert.deepEqual(
    parseEmailLink(
      "https://project.supabase.co/auth/v1/verify?token=private-hash&type=signup",
      options,
    ),
    {
      kind: "verify",
      token_hash: "private-hash",
      type: "email",
      recovery: false,
    },
  );
});
test("verification accepts only the configured project or app callback, never external URLs", () => {
  for (const value of [
    "javascript:alert(1)",
    "https://attacker.invalid/?token_hash=secret&type=email",
    "https://user:secret@project.supabase.co/auth/v1/verify?token=x&type=email",
  ])
    assert.throws(() => parseEmailLink(value, options));
  assert.throws(
    () =>
      parseEmailLink(
        "http://localhost:3000/#error=access_denied&error_code=otp_expired",
        options,
      ),
    /EXPIRED/,
  );
  assert.throws(
    () => parseEmailLink("http://localhost:3000/#/login", options),
    /INVALID/,
  );
});
test("pasted links use the SDK directly, without fetching or following the pasted URL", async () => {
  let received;
  const client = {
    auth: {
      async verifyOtp(input) {
        received = input;
        return { data: { session: { user: { id: "test" } } }, error: null };
      },
    },
  };
  const result = await consumeEmailLink(
    client,
    "https://project.supabase.co/auth/v1/verify?token=recovery-hash&type=recovery",
    options,
  );
  assert.deepEqual(received, { token_hash: "recovery-hash", type: "recovery" });
  assert.equal(result.recovery, true);
  client.auth.verifyOtp = async () => ({
    data: {},
    error: new Error("expired"),
  });
  await assert.rejects(
    consumeEmailLink(
      client,
      "https://project.supabase.co/auth/v1/verify?token=recovery-hash&type=recovery",
      options,
    ),
    /expired/,
  );
});
test("email return URLs discard page fragments and require HTTPS outside localhost", () => {
  assert.equal(
    authRedirectUrl({ origin: "http://localhost:3000" }),
    "http://localhost:3000/",
  );
  assert.equal(
    authRedirectUrl(
      { origin: "http://localhost:3000" },
      "https://juntopia.example/auth/callback?secret=x#token",
    ),
    "https://juntopia.example/auth/callback",
  );
  assert.throws(() => authRedirectUrl({ origin: "http://unsafe.example" }));
});
