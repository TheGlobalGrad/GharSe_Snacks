import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const frontendDir = dirname(fileURLToPath(import.meta.url));
const services = [
    spawn(process.execPath, ["server.js"], { cwd: join(frontendDir, "..", "backend"), stdio: "inherit" }),
    spawn(process.execPath, ["server.mjs"], { cwd: frontendDir, stdio: "inherit" })
];

function stopServices() {
    services.forEach((service) => service.kill());
}

process.on("SIGINT", () => { stopServices(); process.exit(0); });
process.on("SIGTERM", () => { stopServices(); process.exit(0); });
