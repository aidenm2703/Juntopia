import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { loadConfig } from "../backend/src/config/env.js";
const root = fileURLToPath(new URL("../", import.meta.url));
export async function probeService(url, kind) {
  let response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(1500) });
  } catch {
    return "free";
  }
  try {
    if (!response.ok) return "occupied";
    if (kind === "backend") {
      const body = await response.json();
      return body.data?.service === "juntopia-backend" &&
        body.data?.status === "ok"
        ? "running"
        : "occupied";
    }
    const html = await response.text();
    return /<meta\s+name="application-name"\s+content="Juntopia"\s*\/?\s*>/i.test(
      html,
    )
      ? "running"
      : "occupied";
  } catch {
    return "occupied";
  }
}
function envFile(file) {
  try {
    return parseEnv(readFileSync(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return {};
    throw error;
  }
}
export async function startDevelopment() {
  const backendEnv = {
    ...envFile(path.join(root, "backend/.env")),
    ...envFile(path.join(root, "backend/.env.local")),
    ...process.env,
  };
  const config = loadConfig(backendEnv);
  const backendHost = ["0.0.0.0", "::"].includes(config.host)
    ? "127.0.0.1"
    : config.host;
  const backendUrl = `http://${backendHost.includes(":") ? "[" + backendHost + "]" : backendHost}:${config.port}`;
  const frontendUrl = "http://localhost:3000";
  const services = [
    {
      kind: "backend",
      url: backendUrl + "/api/health",
      display: backendUrl,
      cwd: path.join(root, "backend"),
      args: [path.join(root, "backend/src/server.js")],
    },
    {
      kind: "frontend",
      url: frontendUrl,
      display: frontendUrl,
      cwd: path.join(root, "frontend"),
    },
  ];
  const states = await Promise.all(
    services.map((service) => probeService(service.url, service.kind)),
  );
  for (let i = 0; i < services.length; i++)
    if (states[i] === "occupied")
      throw new Error(
        `El puerto de ${services[i].display} lo ocupa otro servicio. No se cerró ningún proceso. Cerrá ese servicio o revisá la configuración.`,
      );
  const children = [];
  let stopping = false;
  function stop(code = 0) {
    if (stopping) return;
    stopping = true;
    for (const child of children)
      if (child.exitCode === null) child.kill("SIGTERM");
    process.exitCode = code;
  }
  if (states.some((state) => state !== "running")) {
    process.on("SIGINT", () => stop());
    process.on("SIGTERM", () => stop());
  }
  try {
    for (let i = 0; i < services.length; i++) {
      const service = services[i];
      if (states[i] === "running") {
        console.log(`${service.kind}: ${service.display} (ya estaba abierto)`);
        continue;
      }
      if (service.kind === "frontend") {
        const requireFrontend = createRequire(
          path.join(root, "frontend/package.json"),
        );
        let viteBin;
        try {
          viteBin = path.join(
            path.dirname(requireFrontend.resolve("vite/package.json")),
            "bin/vite.js",
          );
        } catch {
          throw new Error(
            "Faltan dependencias. Ejecutá npm.cmd run setup desde la raíz.",
          );
        }
        service.args = [viteBin];
      }
      const child = spawn(process.execPath, service.args, {
        cwd: service.cwd,
        stdio: "inherit",
        ...(service.kind === "frontend"
          ? { env: { ...process.env, JUNTOPIA_API_PROXY_TARGET: backendUrl } }
          : {}),
      });
      children.push(child);
      child.on("error", () => stop(1));
      child.on("exit", (code) => {
        if (!stopping) {
          console.error(`${service.kind} se cerró. Revisá el error anterior.`);
          stop(code || 1);
        }
      });
    }
    if (children.length) {
      const until = Date.now() + 12000;
      while (!stopping && Date.now() < until) {
        const ready = await Promise.all(
          services.map((service) => probeService(service.url, service.kind)),
        );
        if (ready.every((state) => state === "running")) {
          console.log(`Juntopia lista: ${frontendUrl}`);
          break;
        }
        await delay(250);
      }
      if (stopping) return;
      const ready = await Promise.all(
        services.map((service) => probeService(service.url, service.kind)),
      );
      if (!ready.every((state) => state === "running"))
        throw new Error(
          "No terminaron de iniciar los servicios. Revisá la salida anterior.",
        );
    } else console.log(`Juntopia ya está funcionando. Abrí ${frontendUrl}`);
  } catch (error) {
    stop(1);
    throw error;
  }
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  startDevelopment().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
