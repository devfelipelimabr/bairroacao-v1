import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";

process.env.NODE_ENV = "production";

// Ensure data directory exists for SQLite
const dbDir = "./data";
if (!existsSync(dbDir)) {
  try {
    mkdirSync(dbDir, { recursive: true });
    console.log("[start] Created data directory:", dbDir);
  } catch (e) {
    console.error("[start] Failed to create data directory:", e.message);
  }
}

if (!existsSync("./dist/boot.js")) {
  console.log("[start] Build not found, running npm run build...");
  try {
    execSync("npm run build", { stdio: "inherit" });
  } catch (e) {
    console.error("[start] Build failed:", e.message);
    process.exit(1);
  }
}

try {
  await import("./dist/boot.js");
} catch (e) {
  console.error("[start] Failed to start server:", e.message);
  console.error(e.stack);
  process.exit(1);
}
