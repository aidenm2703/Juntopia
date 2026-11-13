import { test } from "node:test";
import assert from "node:assert/strict";
import { authFailure } from "../../src/modules/auth/auth.errors.js";
import { register } from "../../src/modules/auth/auth.service.js";
import { createAuthenticator } from "../../src/middleware/authenticate.js";
test("duplicate signup keeps an actionable error without changing the existing account", async () => {
  let attempts = 0;
  const makeClient = () => ({
    auth: {
      async signUp() {
        attempts++;
        return {
          data: {},
          error: {
            code: "user_already_exists",
            status: 422,
            message: "raw provider details",
          },
        };
      },
    },
  });
  await assert.rejects(
    register(
      {
        origins: ["http://localhost:3000"],
        supabaseUrl: "https://project.supabase.co",
        supabaseKey: "public",
      },
      {
        email: "test@example.invalid",
        password: "Password8",
        accepted: true,
        redirectTo: "http://localhost:3000/",
      },
      makeClient,
    ),
    (error) =>
      error.code === "user_already_exists" &&
      error.message.includes("Ya tengo cuenta") &&
      !error.message.includes("raw provider"),
  );
  assert.equal(attempts, 1);
});
test("SMTP, limits and unknown provider errors keep sanitized codes and explanations", () => {
  assert.match(
    authFailure({ code: "email_address_not_authorized", status: 422 }).message,
    /SMTP/,
  );
  assert.equal(
    authFailure({ code: "over_email_send_rate_limit", status: 429 }).status,
    429,
  );
  const unknown = authFailure({
    code: "unexpected_failure",
    message: "PASSWORD OR SMTP SECRET",
  });
  assert.equal(unknown.code, "unexpected_failure");
  assert.doesNotMatch(unknown.message, /SECRET/);
});
test("Auth outage is service-unavailable, never an invalid user session", async () => {
  const authenticate = createAuthenticator({}, () => ({
    auth: {
      async getUser() {
        return {
          data: { user: null },
          error: { name: "AuthRetryableFetchError" },
        };
      },
    },
  }));
  await assert.rejects(
    authenticate({ headers: { authorization: "Bearer token" } }),
    (error) =>
      error.status === 503 && error.code === "AUTH_SERVICE_UNAVAILABLE",
  );
});
