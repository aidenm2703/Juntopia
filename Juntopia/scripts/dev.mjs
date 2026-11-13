import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = fileURLToPath(new URL("../", import.meta.url));
const requireFrontend = createRequire(path.join(root, "frontend/package.json"));
const viteBin = path.join(
  path.dirname(requireFrontend.resolve("vite/package.json")),
  "bin/vite.js",
);
const children = [
  spawn(process.execPath, [path.join(root, "backend/src/server.js")], {
    cwd: path.join(root, "backend"),
    stdio: "inherit",
  }),
  spawn(process.execPath, [viteBin], {
    cwd: path.join(root, "frontend"),
    stdio: "inherit",
  }),
];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children)
    if (child.exitCode === null) child.kill("SIGTERM");
  process.exitCode = code;
}
for (const child of children) {
  child.on("error", () => stop(1));
  child.on("exit", (code) => {
    if (!stopping) stop(code || 0);
  });
}
process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());
