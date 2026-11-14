import { test } from "node:test";
import assert from "node:assert/strict";
import { initialCatalog } from "../../src/modules/catalog/seed.js";
import {
  categoryNames,
  createProviderSearch,
} from "../../src/modules/catalog/providers.js";
import { createDiscoveryService } from "../../src/modules/catalog/discovery.service.js";
import {
  generateSuggestions,
  rankCatalog,
} from "../../src/modules/catalog/ai.service.js";
import { createPhotoService } from "../../src/modules/account/photo.service.js";

test("every category starts with six real titles and no duplicates", () => {
  assert.equal(initialCatalog.length, 48);
  for (const name of categoryNames)
    assert.equal(initialCatalog.filter((i) => i.category === name).length, 6);
  assert.equal(
    new Set(initialCatalog.map((i) => i.category + i.official_url)).size,
    48,
  );
  for (const item of initialCatalog)
    assert.equal(new URL(item.official_url).protocol, "https:");
});
test("recommendations exclude consumed works and favor interests and highly rated authors", () => {
  const items = [
    { id: "a", category: "Libros", author: "Autor" },
    { id: "b", category: "Música", author: "Otro" },
    { id: "c", category: "Libros", author: "Autor" },
  ];
  assert.deepEqual(
    rankCatalog(items, ["Libros"], ["a"], [{ content_id: "a", rating: 5 }]).map(
      (i) => i.id,
    ),
    ["c", "b"],
  );
});
test("external search is cached, strips HTML and rejects executable links", async () => {
  let calls = 0;
  const search = createProviderSearch(async () => {
    calls++;
    return new Response(
      JSON.stringify({
        results: [
          {
            trackName: "Canción",
            artistName: "Artista",
            shortDescription: "<b>Texto</b>",
            trackViewUrl: "https://music.apple.com/track/test",
          },
          { trackName: "Inseguro", trackViewUrl: "javascript:alert(1)" },
        ],
      }),
    );
  });
  const result = await search("artista", "Música");
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].description, "Texto");
  await search("artista", "Música");
  assert.equal(calls, 1);
  const discovery = createDiscoveryService(search);
  await assert.rejects(
    discovery.search("x", "Música"),
    (e) => e.code === "INVALID_SEARCH",
  );
  await assert.rejects(
    discovery.import({}, "forged-id"),
    (e) => e.code === "SEARCH_EXPIRED",
  );
});
test("Gemini uses a server header, requests structured data and never exposes provider errors", async () => {
  const key = "DIAGNOSTIC_SECRET";
  const config = { geminiKey: key, geminiModel: "gemini-3.5-flash-lite" };
  const result = await generateSuggestions(
    config,
    { request: "Un libro" },
    async (url, options) => {
      assert.doesNotMatch(url, /DIAGNOSTIC_SECRET/);
      assert.equal(options.headers["x-goog-api-key"], key);
      const body = JSON.parse(options.body);
      assert.equal(body.generationConfig.responseMimeType, "application/json");
      assert.doesNotMatch(options.body, /DIAGNOSTIC_SECRET/);
      return new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      message: "Un libro",
                      ids: ["a"],
                      discoveries: [],
                    }),
                  },
                ],
              },
            },
          ],
        }),
      );
    },
  );
  assert.equal(result.message, "Un libro");
  await assert.rejects(
    generateSuggestions(
      config,
      {},
      async () => new Response(key, { status: 429 }),
    ),
    (e) => e.status === 429 && !e.message.includes(key),
  );
  await assert.rejects(
    generateSuggestions(
      config,
      {},
      async () => new Response(JSON.stringify({ candidates: [] })),
    ),
    (e) => e.code === "AI_INVALID_RESPONSE",
  );
});
test("photo uploads reject oversize or forged images and removal rejects other owners", async () => {
  const service = createPhotoService({
    user: { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" },
    db: { storage: { from: () => ({}) } },
  });
  await assert.rejects(
    service.upload(Buffer.alloc(2097153), "image/png"),
    (e) => e.status === 413,
  );
  await assert.rejects(
    service.upload(Buffer.from("fake image"), "image/jpeg"),
    (e) => e.code === "INVALID_IMAGE",
  );
  await assert.rejects(
    service.remove(
      "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb/cccccccc-cccc-4ccc-8ccc-cccccccccccc.jpg",
    ),
    (e) => e.status === 403,
  );
  await assert.rejects(service.signed("../../secret"), (e) => e.status === 400);
});
