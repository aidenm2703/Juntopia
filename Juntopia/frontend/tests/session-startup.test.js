import { test } from "node:test";
import assert from "node:assert/strict";
import { prepareSessionStartup } from "../src/shared/data/sessionStartup.js";
function fixture(hash = "", persistSession = false) {
  const values = new Map([
    ["sb-project-auth-token", "stored session"],
    ["sb-other-auth-token", "other app"],
    ["juntopia-theme", "dark"],
  ]);
  const recovery = new Map([["juntopia-password-recovery", "true"]]);
  const state = { target: null };
  const args = {
    persistSession,
    projectUrl: "https://project.supabase.co",
    storage: { removeItem: (key) => values.delete(key) },
    recoveryStorage: { removeItem: (key) => recovery.delete(key) },
    location: { hash, search: "", pathname: "/" },
    history: {
      replaceState(_a, _b, url) {
        state.target = url;
      },
    },
  };
  return { values, recovery, state, args };
}
test("fresh local access discards only this project session and starts at registration", () => {
  const f = fixture("#/library");
  prepareSessionStartup(f.args);
  assert.equal(f.values.has("sb-project-auth-token"), false);
  assert.equal(f.values.get("sb-other-auth-token"), "other app");
  assert.equal(f.values.get("juntopia-theme"), "dark");
  assert.equal(f.recovery.size, 0);
  assert.equal(f.state.target, "/#/register");
});
test("email callbacks and explicit public access routes keep their destination", () => {
  for (const hash of [
    "#access_token=private&refresh_token=private&type=recovery",
    "#/login",
    "#/reset",
    "#/register",
    "#/policies",
  ]) {
    const f = fixture(hash);
    prepareSessionStartup(f.args);
    assert.equal(f.state.target, null);
  }
  const f = fixture();
  f.args.location.search = "?code=private";
  prepareSessionStartup(f.args);
  assert.equal(f.state.target, null);
});
test("remember-session option preserves ordinary navigation and stored sessions", () => {
  const f = fixture("#/library", true);
  prepareSessionStartup(f.args);
  assert.equal(f.values.has("sb-project-auth-token"), true);
  assert.equal(f.state.target, null);
});
test("reloading a signed-in tab preserves its route and recovery flow", () => {
  const f = fixture("#/library");
  f.args.sessionStorage = { getItem: () => "current tab session" };
  prepareSessionStartup(f.args);
  assert.equal(f.state.target, null);
  assert.equal(f.recovery.get("juntopia-password-recovery"), "true");
  assert.equal(f.values.has("sb-project-auth-token"), false);
});
