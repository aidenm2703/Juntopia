import { test } from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

test("SDK restores login after reload in the same tab and clears it on logout", async () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
  const user = {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    aud: "authenticated",
  };
  const token =
    [
      { alg: "HS256", typ: "JWT" },
      { sub: user.id, exp: Math.floor(Date.now() / 1000) + 3600 },
    ]
      .map((part) => Buffer.from(JSON.stringify(part)).toString("base64url"))
      .join(".") + ".diagnostic";
  let calls = 0;
  const options = {
    auth: {
      persistSession: true,
      storage,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: async () => {
        calls++;
        return new Response(
          JSON.stringify({
            access_token: token,
            refresh_token: "diagnostic-refresh",
            token_type: "bearer",
            expires_in: 3600,
            user,
          }),
          { headers: { "Content-Type": "application/json" } },
        );
      },
    },
  };
  const first = createClient("https://project.supabase.co", "public", options);
  const signedIn = await first.auth.signInWithPassword({
    email: "test@example.invalid",
    password: "Diagnostic8",
  });
  assert.equal(signedIn.error, null);
  assert.equal(signedIn.data.session.user.id, user.id);
  const reloaded = createClient(
    "https://project.supabase.co",
    "public",
    options,
  );
  assert.equal(
    (await reloaded.auth.getSession()).data.session.user.id,
    user.id,
  );
  assert.equal(calls, 1, "reload restores storage without signing in again");
  await reloaded.auth.signOut({ scope: "local" });
  assert.equal((await reloaded.auth.getSession()).data.session, null);
  assert.equal(storage.getItem("sb-project-auth-token"), null);
  first.auth.stopAutoRefresh();
  reloaded.auth.stopAutoRefresh();
});
