import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { once } from "node:events";
import { createApp } from "../../src/app.js";
import { ApiError } from "../../src/shared/errors.js";
const config = {
  origins: ["http://localhost:3000"],
  jsonLimit: 512,
  uploadLimit: 32,
  requestsPerMinute: 100,
};
const userId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
async function fixture(t, db = {}) {
  const calls = [];
  const authenticate = async (request) => {
    if (request.headers.authorization !== "Bearer valid")
      throw new ApiError(401, "AUTH_REQUIRED", "Ingresá para continuar.");
    return { user: { id: userId }, db };
  };
  const server = createServer(createApp({ config, authenticate }));
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(
    () =>
      new Promise((resolve) => {
        server.close(resolve);
        server.closeAllConnections();
      }),
  );
  const base = `http://127.0.0.1:${server.address().port}`;
  const send = async (path, method = "GET", body, extra = {}) => {
    const response = await fetch(base + path, {
      method,
      headers: {
        Authorization: "Bearer valid",
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        ...extra,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    calls.push(response.status);
    return {
      status: response.status,
      headers: response.headers,
      body: await response.json(),
    };
  };
  return { send, calls, base };
}
test("health is public; resource routes reject unauthenticated and foreign-origin requests", async (t) => {
  const { send } = await fixture(t);
  assert.equal(
    (await send("/api/health", "GET", undefined, { Authorization: "" })).status,
    200,
  );
  assert.equal(
    (
      await send("/api/catalog/content_items", "GET", undefined, {
        Authorization: "",
      })
    ).status,
    401,
  );
  assert.equal(
    (
      await send("/api/health", "GET", undefined, {
        Origin: "https://attacker.invalid",
      })
    ).status,
    403,
  );
  assert.equal((await send("/api/private/moderators")).status, 404);
});
test("unsafe queries, mass assignment, unfiltered writes and arbitrary RPCs never reach the DB", async (t) => {
  const { send } = await fixture(t);
  const options = new URLSearchParams({
    options: JSON.stringify({ select: "*,auth.users(*)" }),
  });
  assert.equal(
    (await send("/api/catalog/content_items?" + options)).status,
    400,
  );
  assert.equal(
    (
      await send("/api/catalog/content_items", "POST", {
        title: "test",
        created_by: "other",
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await send("/api/library/collections", "PATCH", {
        values: { title: "changed" },
        filters: {},
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await send("/api/account/rpc/save_profile", "POST", {
        profile_data: { id: "other" },
      })
    ).status,
    403,
  );
  assert.equal(
    (await send("/api/account/rpc/delete_user", "POST", {})).status,
    404,
  );
});
test("DB errors are sanitized and security headers are always returned", async (t) => {
  const db = {
    from() {
      throw new Error("PRIVATE CREDENTIAL OR INTERNAL SQL DETAILS");
    },
  };
  const { send } = await fixture(t, db);
  const response = await send("/api/catalog/content_items");
  assert.equal(response.status, 500);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.ok(response.headers.get("x-request-id"));
  assert.ok(!JSON.stringify(response.body).includes("PRIVATE CREDENTIAL"));
});
test("large bodies and unsupported operations are refused", async (t) => {
  const { send } = await fixture(t);
  assert.equal(
    (
      await send("/api/catalog/content_items", "POST", {
        title: "x".repeat(1000),
      })
    ).status,
    413,
  );
  assert.equal(
    (await send("/api/parties/party_attendees", "POST", { rsvp: "going" }))
      .status,
    405,
  );
});
