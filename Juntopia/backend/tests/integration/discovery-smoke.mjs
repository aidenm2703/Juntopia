import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { createClient } from "@supabase/supabase-js";
loadEnvFile(".env.local");
const users = JSON.parse(readFileSync(".test-runtime/fixtures.json", "utf8"));
const base = "http://127.0.0.1:4000/api";
const sessions = [],
  clients = [];
const photoPaths = [];
async function call(
  index,
  path,
  { method = "GET", body, binary = false } = {},
) {
  const response = await fetch(base + path, {
    method,
    headers: {
      Authorization: `Bearer ${sessions[index]}`,
      ...(body === undefined
        ? {}
        : { "Content-Type": binary ? "image/png" : "application/json" }),
    },
    body: body === undefined ? undefined : binary ? body : JSON.stringify(body),
    signal: AbortSignal.timeout(50000),
  });
  const payload = await response.json();
  return { status: response.status, data: payload.data, error: payload.error };
}
async function ok(index, path, options) {
  const result = await call(index, path, options);
  assert.ok(
    result.status < 300,
    `${path}: ${result.status} ${result.error?.code || ""}`,
  );
  return result.data;
}
try {
  for (const u of users.slice(0, 2)) {
    const client = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_PUBLISHABLE_KEY,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    clients.push(client);
    const { data, error } = await client.auth.signInWithPassword({
      email: u.email,
      password: u.password,
    });
    assert.equal(error, null);
    sessions.push(data.session.access_token);
  }
  for (let index = 0; index < 2; index++)
    await ok(index, "/account/rpc/accept_policy", { method: "POST", body: {} });
  const catalog = await ok(
    0,
    "/catalog/content_items?" +
      new URLSearchParams({ options: JSON.stringify({ limit: 200 }) }),
  );
  assert.equal(new Set(catalog.map((i) => i.category)).size, 8);
  assert.ok(catalog.length >= 48);
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jOaUAAAAASUVORK5CYII=",
    "base64",
  );
  const path = await ok(0, "/account/photo", {
    method: "POST",
    body: png,
    binary: true,
  });
  photoPaths.push(path);
  const signed = await ok(0, "/account/photo/signed", {
    method: "POST",
    body: { path },
  });
  assert.equal((await fetch(signed)).status, 200);
  assert.equal(
    (await call(1, "/account/photo/signed", { method: "POST", body: { path } }))
      .status,
    404,
  );
  const profile = {
    id: users[0].id,
    display_name: "Prueba descartable",
    username: `smoke_${users[0].id.slice(0, 8)}`,
    bio: "",
    avatar_base: 2,
    avatar_color: "#a5c86a",
    avatar_options: {
      hair: "#302b27",
      outfit: "#485b37",
      accessory: "none",
      mode: "photo",
      photo: path,
    },
    interests: ["Música", "Libros"],
    onboarding_step: 3,
    onboarding_complete: true,
    activity_visible: false,
  };
  await ok(0, "/account/rpc/save_profile", {
    method: "POST",
    body: { profile_data: profile, visible: true },
  });
  assert.equal(
    (await call(1, "/account/photo/signed", { method: "POST", body: { path } }))
      .status,
    200,
  );
  await ok(0, "/account/rpc/save_profile", {
    method: "POST",
    body: { profile_data: profile, visible: false },
  });
  assert.equal(
    (await call(1, "/account/photo/signed", { method: "POST", body: { path } }))
      .status,
    404,
  );
  const counterfeit = {
    ...profile,
    avatar_options: {
      ...profile.avatar_options,
      photo: `${users[1].id}/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.jpg`,
    },
  };
  assert.equal(
    (
      await call(0, "/account/rpc/save_profile", {
        method: "POST",
        body: { profile_data: counterfeit },
      })
    ).status,
    400,
  );
  const book = catalog.find((i) => i.category === "Libros");
  await ok(0, "/library/user_content_status", {
    method: "PUT",
    body: {
      values: {
        user_id: users[0].id,
        content_id: book.id,
        status: "completed",
        progress: 100,
      },
      onConflict: "user_id,content_id",
    },
  });
  await ok(0, "/library/reviews", {
    method: "PUT",
    body: {
      values: {
        user_id: users[0].id,
        content_id: book.id,
        rating: 4,
        body: "Prueba descartable",
      },
      onConflict: "user_id,content_id",
    },
  });
  const search = await ok(
    0,
    "/catalog/search?" +
      new URLSearchParams({ q: "Daddy Yankee", category: "Música" }),
  );
  assert.ok(search.items.length > 0);
  const imported = await ok(0, "/catalog/import", {
    method: "POST",
    body: { external_id: search.items[0].external_id },
  });
  assert.ok(imported.id);
  const again = await ok(0, "/catalog/import", {
    method: "POST",
    body: { external_id: search.items[0].external_id },
  });
  assert.equal(again.id, imported.id);
  const suggestions = await ok(0, "/catalog/assistant", {
    method: "POST",
    body: {
      category: "Libros",
      message: "Un libro corto para leer esta semana",
    },
  });
  assert.equal(suggestions.ai, true, suggestions.notice);
  assert.ok(suggestions.items.length > 0);
  assert.ok(
    suggestions.items.every((i) => i.id !== book.id && i.category === "Libros"),
  );
  const secondBatch = await ok(0, "/catalog/assistant", {
    method: "POST",
    body: {
      category: "Libros",
      batch: 1,
      exclude: suggestions.items.map((i) => i.id),
    },
  });
  assert.ok(
    secondBatch.items.every(
      (i) => !suggestions.items.some((old) => old.id === i.id),
    ),
  );
  console.log(
    "Integración aprobada: catálogo en ocho categorías, foto privada/visible, permisos entre cuentas, biblioteca y calificación, búsqueda/importación sin duplicados, Gemini real y segundo lote sin repetir.",
  );
} finally {
  for (const path of photoPaths)
    await call(0, "/account/photo", { method: "DELETE", body: { path } }).catch(
      () => {},
    );
  for (const client of clients) await client.auth.signOut().catch(() => {});
}
