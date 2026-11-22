import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { createRequire } from "module";

process.env.NODE_ENV = "production";

console.log("[start] Node version:", process.version);
console.log("[start] Platform:", process.platform);
console.log("[start] Architecture:", process.arch);
console.log("[start] CWD:", process.cwd());

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

// Try to import better-sqlite3 first; if it fails (native module mismatch),
// rebuild it in the current environment.
try {
  const require = createRequire(import.meta.url);
  const Database = require("better-sqlite3");
  const test = new Database(":memory:");
  test.close();
  console.log("[start] better-sqlite3 native module OK");
} catch (e) {
  console.error("[start] better-sqlite3 native module failed:", e.message);
  console.log("[start] Rebuilding native modules...");
  try {
    execSync("npm rebuild better-sqlite3", { stdio: "inherit" });
    console.log("[start] Rebuild succeeded");
  } catch (rebuildErr) {
    console.error("[start] Rebuild failed:", rebuildErr.message);
    // Fallback: try npm install as last resort
    try {
      execSync("npm install", { stdio: "inherit" });
    } catch {
      // ignore
    }
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
