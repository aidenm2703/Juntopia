import { test } from "node:test";
import assert from "node:assert/strict";
import { loadConfig } from "../../src/config/env.js";
import { createAuthenticator } from "../../src/middleware/authenticate.js";
import {
  resource,
  listOptions,
  writeValues,
} from "../../src/shared/resource.js";
import { validateImage } from "../../src/modules/creators/storage.service.js";
import { createRateLimiter } from "../../src/middleware/http.js";
test("backend config refuses missing credentials and credential-bearing URLs", () => {
  assert.throws(() => loadConfig({}), /SUPABASE_URL/);
  assert.throws(
    () =>
      loadConfig({
        SUPABASE_URL: "https://user:password@example.com",
        SUPABASE_PUBLISHABLE_KEY: "public",
      }),
    /sin credenciales/,
  );
  assert.throws(
    () =>
      loadConfig({
        SUPABASE_URL: "https://example.com",
        SUPABASE_PUBLISHABLE_KEY: "public",
        PORT: "NaN",
      }),
    /PORT/,
  );
});
test("auth verifies the bearer with Supabase and creates a separate user context", async () => {
  const tokens = [];
  const authenticate = createAuthenticator({}, (_config, token) => ({
    auth: {
      async getUser(received) {
        tokens.push(received);
        return received === "expired"
          ? { data: {}, error: new Error() }
          : { data: { user: { id: token } } };
      },
    },
  }));
  await assert.rejects(
    authenticate({ headers: {} }),
    (error) => error.status === 401,
  );
  await assert.rejects(
    authenticate({ headers: { authorization: "Bearer expired" } }),
    (error) => error.status === 401,
  );
  const [a, b] = await Promise.all([
    authenticate({ headers: { authorization: "Bearer user-a" } }),
    authenticate({ headers: { authorization: "Bearer user-b" } }),
  ]);
  assert.equal(a.user.id, "user-a");
  assert.equal(b.user.id, "user-b");
  assert.notEqual(a.db, b.db);
  assert.deepEqual(tokens, ["expired", "user-a", "user-b"]);
});
test("resource validation blocks mass assignment, hostile relations and oversized lists", () => {
  const definition = resource("id user_id title created_at", {
    write: "user_id title",
    owner: "user_id",
  });
  assert.throws(
    () =>
      writeValues({ user_id: "someone-else", title: "x" }, definition, "owner"),
    (error) => error.status === 403,
  );
  assert.throws(
    () => writeValues({ role: "admin" }, definition, "owner"),
    (error) => error.code === "INVALID_FIELD",
  );
  assert.throws(
    () => listOptions({ select: "*,auth.users(*)" }, definition),
    (error) => error.code === "INVALID_SELECT",
  );
  assert.throws(
    () => listOptions({ limit: 1000000 }, definition),
    (error) => error.code === "INVALID_LIMIT",
  );
  assert.throws(
    () => listOptions({ filters: { "id.or": "eq.any" } }, definition),
    (error) => error.code === "INVALID_FILTER",
  );
});
test("image verification rejects spoofed MIME types and scripts", () => {
  assert.throws(
    () => validateImage(Buffer.from("<script>alert(1)</script>"), "image/png"),
    (error) => error.code === "INVALID_IMAGE",
  );
  assert.throws(
    () => validateImage(Buffer.from("<svg/>"), "image/svg+xml"),
    (error) => error.status === 415,
  );
  assert.doesNotThrow(() =>
    validateImage(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), "image/png"),
  );
});
test("request limits are isolated by user", () => {
  const limit = createRateLimiter(1);
  limit("a");
  limit("b");
  assert.throws(
    () => limit("a"),
    (error) => error.status === 429,
  );
});
