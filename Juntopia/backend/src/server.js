import { createServer } from "node:http";
import { loadEnvFile } from "node:process";
import { loadConfig } from "./config/env.js";
import { createApp } from "./app.js";
for (const file of ["../.env.local", "../.env"])
  try {
    loadEnvFile(new URL(file, import.meta.url));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
const config = loadConfig();
const server = createServer({ maxHeaderSize: 16384 }, createApp({ config }));
server.requestTimeout = 20000;
server.headersTimeout = 10000;
server.on("error", (error) => {
  console.error(`No se pudo iniciar el backend (${error.code || "ERROR"}).`);
  process.exitCode = 1;
});
server.listen(config.port, config.host, () =>
  console.log(`Juntopia backend: http://${config.host}:${config.port}`),
);
let closing = false;
function shutdown() {
  if (closing) return;
  closing = true;
  server.close(() => process.exit());
  server.closeIdleConnections();
  setTimeout(() => process.exit(1), 10000).unref();
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
