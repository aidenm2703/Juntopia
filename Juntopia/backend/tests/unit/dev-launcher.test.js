import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { once } from "node:events";
import { probeService } from "../../../scripts/dev.mjs";
test("launcher reuses only recognized Juntopia services and leaves foreign ports alone", async (t) => {
  const server = createServer((req, res) => {
    if (req.url === "/api/health") {
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({ data: { status: "ok", service: "juntopia-backend" } }),
      );
    } else if (req.url === "/") {
      res.end(
        '<html><head><meta name="application-name" content="Juntopia" /></head></html>',
      );
    } else {
      res.end("<html>Another application</html>");
    }
  });
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
  assert.equal(await probeService(base + "/api/health", "backend"), "running");
  assert.equal(await probeService(base, "frontend"), "running");
  assert.equal(await probeService(base + "/foreign", "frontend"), "occupied");
  assert.equal(await probeService(base + "/foreign", "backend"), "occupied");
});
test("launcher recognizes a closed local port as available", async () => {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const port = server.address().port;
  await new Promise((resolve) => server.close(resolve));
  assert.equal(
    await probeService(`http://127.0.0.1:${port}`, "backend"),
    "free",
  );
});
