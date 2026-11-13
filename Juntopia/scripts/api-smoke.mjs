import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { loadEnv } from "vite";
import { createClient } from "@supabase/supabase-js";
const env = loadEnv("development", process.cwd(), "VITE_");
const users = JSON.parse(readFileSync(".test-runtime/fixtures.json", "utf8"));
const clients = users.map(() =>
  createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  }),
);
const [a, b, c] = clients;
const [ua, ub, uc] = users;
const assets = [];
let checks = 0;
async function ok(p) {
  const { data, error } = await p;
  if (error) throw error;
  return data;
}
async function denied(p) {
  const { error } = await p;
  assert.ok(error, "Operation should be denied");
  checks++;
}
function verify(value, message) {
  assert.ok(value, message);
  checks++;
}
async function profile(client, u, index) {
  await ok(client.rpc("accept_policy"));
  await ok(
    client.rpc("save_profile", {
      profile_data: {
        id: u.id,
        display_name: `Smoke ${index}`,
        username: `smoke_${u.id.slice(0, 8)}`,
        bio: "Disposable API integration test",
        avatar_base: index,
        avatar_color: "#a5c86a",
        avatar_options: {
          hair: "#302b27",
          outfit: "#485b37",
          accessory: "glasses",
        },
        interests: ["Libros"],
        onboarding_step: 3,
        onboarding_complete: true,
        activity_visible: false,
      },
      visible: true,
    }),
  );
}
try {
  for (let i = 0; i < clients.length; i++)
    await ok(
      clients[i].auth.signInWithPassword({
        email: users[i].email,
        password: users[i].password,
      }),
    );
  verify(true, "Auth sign-in for three test users");
  for (let i = 0; i < clients.length; i++)
    await profile(clients[i], users[i], i);
  verify(
    (await ok(a.from("profiles").select("*"))).length === 1,
    "Only own private profile is visible",
  );
  verify(
    (
      await ok(
        a
          .from("member_cards")
          .select("*")
          .in(
            "id",
            users.map((u) => u.id),
          ),
      )
    ).length === 3,
    "Opt-in directory works",
  );
  const old = await ok(a.from("profiles").select("*").single());
  await denied(
    a.rpc("save_profile", {
      profile_data: { ...old, username: `smoke_${ub.id.slice(0, 8)}` },
      visible: true,
    }),
  );
  verify(
    (await ok(a.from("profiles").select("*").single())).username ===
      old.username,
    "Profile and card transaction rolls back on duplicate",
  );
  const content = await ok(
    a
      .from("content_items")
      .insert({
        title: "Disposable API book",
        category: "Libros",
        official_url: `https://example.invalid/${ua.id}`,
      })
      .select()
      .single(),
  );
  const collection = await ok(
    a
      .from("collections")
      .insert({ title: "Private smoke collection" })
      .select()
      .single(),
  );
  await ok(
    a
      .from("collection_items")
      .insert({ collection_id: collection.id, content_id: content.id }),
  );
  verify(
    (await ok(b.from("collections").select("*").eq("id", collection.id)))
      .length === 0,
    "Private collection hidden",
  );
  verify(
    (
      await ok(
        b
          .from("collection_items")
          .select("*")
          .eq("collection_id", collection.id),
      )
    ).length === 0,
    "Private collection items hidden",
  );
  await denied(
    b
      .from("collection_items")
      .insert({ collection_id: collection.id, content_id: content.id }),
  );
  await ok(
    b.from("user_content_status").upsert({
      user_id: ub.id,
      content_id: content.id,
      progress: 30,
      status: "in_progress",
      favorite: true,
    }),
  );
  await denied(
    b
      .from("user_content_status")
      .update({ progress: 101 })
      .eq("content_id", content.id),
  );
  verify(
    (
      await ok(
        a.from("user_content_status").select("*").eq("content_id", content.id),
      )
    ).length === 0,
    "Library isolated",
  );
  await ok(
    b
      .from("reviews")
      .insert({ content_id: content.id, rating: 4, body: "Disposable review" }),
  );
  verify(
    (await ok(a.from("reviews").select("*").eq("content_id", content.id)))
      .length === 1,
    "Reviews shared",
  );
  verify(
    (
      await ok(
        a
          .from("reviews")
          .update({ body: "tamper" })
          .eq("content_id", content.id)
          .select(),
      )
    ).length === 0,
    "Other review cannot be edited",
  );
  const party = await ok(
    a
      .from("parties")
      .insert({
        title: "Concurrent API test",
        category: "Libros",
        starts_at: new Date(Date.now() + 3600000).toISOString(),
        capacity: 2,
      })
      .select()
      .single(),
  );
  const rsvps = await Promise.all([
    ok(b.rpc("set_party_rsvp", { target: party.id, answer: "going" })),
    ok(c.rpc("set_party_rsvp", { target: party.id, answer: "going" })),
  ]);
  verify(
    rsvps.includes("going") && rsvps.includes("waitlist"),
    "Concurrent RSVP does not overbook",
  );
  const member = rsvps[0] === "going" ? b : c;
  const outsider = rsvps[0] === "going" ? c : b;
  await ok(
    a
      .from("party_messages")
      .insert({ party_id: party.id, body: "Members-only fixture" }),
  );
  verify(
    (
      await ok(
        member.from("party_messages").select("*").eq("party_id", party.id),
      )
    ).length === 1,
    "Participant reads room",
  );
  verify(
    (
      await ok(
        outsider.from("party_messages").select("*").eq("party_id", party.id),
      )
    ).length === 0,
    "Waitlisted user cannot read chat",
  );
  await denied(
    outsider
      .from("party_messages")
      .insert({ party_id: party.id, body: "not allowed" }),
  );
  await denied(a.from("parties").update({ capacity: 1 }).eq("id", party.id));
  await denied(a.from("conversations").insert({ member_b: ub.id }));
  const friendship = await ok(
    a.from("friendships").insert({ addressee_id: ub.id }).select().single(),
  );
  await ok(
    b
      .from("friendships")
      .update({ status: "accepted" })
      .eq("id", friendship.id),
  );
  const conversation = await ok(
    a.from("conversations").insert({ member_b: ub.id }).select().single(),
  );
  verify(
    (await ok(c.from("conversations").select("*").eq("id", conversation.id)))
      .length === 0,
    "Outsider cannot see conversation",
  );
  await denied(
    c
      .from("messages")
      .insert({ conversation_id: conversation.id, body: "not allowed" }),
  );
  let channel;
  let realtimeFailure = null;
  try {
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error("Realtime subscription timed out")),
        25000,
      );
      channel = a
        .channel(`smoke-${conversation.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${conversation.id}`,
          },
          () => {
            clearTimeout(timeout);
            resolve();
          },
        )
        .subscribe(async (status, error) => {
          console.log("Realtime:", status, error?.message || "");
          if (status === "SUBSCRIBED") {
            try {
              await ok(
                b.from("messages").insert({
                  conversation_id: conversation.id,
                  body: "Realtime integration fixture",
                }),
              );
            } catch (e) {
              clearTimeout(timeout);
              reject(e);
            }
          } else if (status === "CHANNEL_ERROR") {
            clearTimeout(timeout);
            reject(new Error("Realtime channel error"));
          }
        });
    });
    verify(true, "Realtime message arrived");
  } catch (error) {
    realtimeFailure = error;
    console.log("Realtime pendiente:", error.message);
  } finally {
    if (channel) await a.removeChannel(channel);
    a.realtime.disconnect();
  }
  const path = `${ua.id}/smoke.png`;
  await ok(
    a.storage
      .from("creator-works")
      .upload(
        path,
        Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aDekAAAAASUVORK5CYII=",
          "base64",
        ),
        { contentType: "image/png" },
      ),
  );
  assets.push(path);
  const work = await ok(
    a
      .from("creator_works")
      .insert({ kind: "art", title: "Private fixture", asset_path: path })
      .select()
      .single(),
  );
  await denied(b.storage.from("creator-works").createSignedUrl(path, 60));
  verify(
    !!(await ok(a.storage.from("creator-works").createSignedUrl(path, 60)))
      .signedUrl,
    "Owner can access private asset",
  );
  await ok(
    a.from("creator_works").update({ visibility: "public" }).eq("id", work.id),
  );
  verify(
    !!(await ok(b.storage.from("creator-works").createSignedUrl(path, 60)))
      .signedUrl,
    "Published work permits signed access",
  );
  await ok(
    a.from("user_settings").upsert({
      user_id: ua.id,
      theme: "light",
      timezone: "America/Costa_Rica",
    }),
  );
  await denied(
    a
      .from("user_settings")
      .update({ timezone: "Mars/Invalid" })
      .eq("user_id", ua.id),
  );
  await denied(
    c.rpc("moderate_report", {
      target: crypto.randomUUID(),
      decision: "remove",
    }),
  );
  await ok(a.from("blocks").insert({ blocked_id: ub.id }));
  verify(
    (
      await ok(
        b.from("messages").select("*").eq("conversation_id", conversation.id),
      )
    ).length === 0,
    "Block cuts off DM access",
  );
  await denied(
    b
      .from("messages")
      .insert({ conversation_id: conversation.id, body: "blocked" }),
  );
  const anon = createClient(
    env.VITE_SUPABASE_URL,
    env.VITE_SUPABASE_PUBLISHABLE_KEY,
    { auth: { persistSession: false } },
  );
  await denied(anon.from("profiles").select("*"));
  verify(
    (await ok(a.from("notifications").select("*"))).every(
      (n) => n.user_id === ua.id,
    ),
    "Notifications stay private",
  );
  console.log(
    `API smoke: ${checks} comprobaciones aprobadas; Auth, REST, RLS, RSVP concurrente y Storage.`,
  );
  if (realtimeFailure) throw realtimeFailure;
} catch (error) {
  console.error(
    `API smoke falló después de ${checks} comprobaciones: ${error.message}`,
  );
  process.exitCode = 1;
} finally {
  if (assets.length) await a.storage.from("creator-works").remove(assets);
  for (const client of clients) {
    await client.auth.signOut();
    client.realtime.disconnect();
  }
}
