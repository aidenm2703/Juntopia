import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const frontend = fileURLToPath(new URL("../", import.meta.url));
const backend = fileURLToPath(new URL("../../backend/", import.meta.url));
function files(directory) {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((item) =>
      item.isDirectory()
        ? files(path.join(directory, item.name))
        : [path.join(directory, item.name)],
    )
    .filter((file) => /\.(js|jsx|mjs)$/.test(file));
}
function imports(file) {
  return [
    ...readFileSync(file, "utf8").matchAll(
      /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s*)["']([^"']+)["']/g,
    ),
  ].map((match) => match[1]);
}
test("browser source never imports backend or server-only Node modules", () => {
  for (const file of files(path.join(frontend, "src")))
    for (const spec of imports(file)) {
      assert.ok(
        !spec.startsWith("node:"),
        `${file} imports server code: ${spec}`,
      );
      if (spec.startsWith("."))
        assert.ok(
          path.resolve(path.dirname(file), spec).startsWith(frontend),
          `${file} escapes the frontend workspace`,
        );
    }
});
test("shared frontend code stays independent from application modules", () => {
  for (const file of files(path.join(frontend, "src/shared")))
    for (const spec of imports(file))
      if (spec.startsWith("."))
        assert.ok(
          path
            .resolve(path.dirname(file), spec)
            .startsWith(path.join(frontend, "src/shared") + path.sep),
          `${file} depends on an application module: ${spec}`,
        );
});
test("backend has no React or Vite dependency and cannot import frontend source", () => {
  const pkg = JSON.parse(
    readFileSync(path.join(backend, "package.json"), "utf8"),
  );
  for (const name of ["react", "react-dom", "vite"])
    assert.equal(
      pkg.dependencies?.[name] || pkg.devDependencies?.[name],
      undefined,
    );
  for (const directory of ["src", "scripts", "tests"])
    for (const file of files(path.join(backend, directory)))
      for (const spec of imports(file))
        if (spec.startsWith("."))
          assert.ok(
            !path.resolve(path.dirname(file), spec).startsWith(frontend),
            `${file} imports the frontend`,
          );
});
test("each functional module exposes a public entry point", () => {
  const directory = path.join(frontend, "src/modules");
  for (const item of readdirSync(directory, { withFileTypes: true }))
    if (item.isDirectory())
      assert.ok(
        existsSync(path.join(directory, item.name, "index.js")),
        `${item.name} is missing its public module entry`,
      );
});
test("browser data access goes through the backend HTTP API", () => {
  for (const file of files(path.join(frontend, "src"))) {
    assert.doesNotMatch(
      readFileSync(file, "utf8"),
      /\bsupabase\s*\.\s*(?:from|rpc|storage)\b/,
      `${file} accesses persistence directly instead of the backend`,
    );
  }
  for (const entry of [
    "src/server.js",
    "src/app.js",
    "src/routes/index.js",
    "src/controllers/resource.controller.js",
    "src/services/resource.service.js",
    "src/database/repositories/resource.repository.js",
  ])
    assert.ok(
      existsSync(path.join(backend, entry)),
      `Missing backend source layer: ${entry}`,
    );
});
