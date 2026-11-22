const { execSync } = require("child_process");
const { existsSync, mkdirSync } = require("fs");

process.env.NODE_ENV = "production";

console.log("[start] === BairroAcao Startup ===");
console.log("[start] Node:", process.version);
console.log("[start] Platform:", process.platform);
console.log("[start] Arch:", process.arch);
console.log("[start] CWD:", process.cwd());

try {
  // Step 1: Ensure data dir
  console.log("[start] Step 1: Ensuring data directory...");
  if (!existsSync("./data")) {
    mkdirSync("./data", { recursive: true });
    console.log("[start] Created data directory");
  }

  // Step 2: Check better-sqlite3
  console.log("[start] Step 2: Checking better-sqlite3...");
  let Database;
  try {
    Database = require("better-sqlite3");
    const test = new Database(":memory:");
    test.close();
    console.log("[start] better-sqlite3 OK");
  } catch (sqliteErr) {
    console.error("[start] better-sqlite3 failed:", sqliteErr.message);
    console.log("[start] Attempting rebuild...");
    try {
      execSync("npm rebuild better-sqlite3", { stdio: "inherit", timeout: 120000 });
      Database = require("better-sqlite3");
      const test2 = new Database(":memory:");
      test2.close();
      console.log("[start] Rebuild OK");
    } catch (rebuildErr) {
      console.error("[start] Rebuild failed:", rebuildErr.message);
      console.log("[start] Will use in-memory fallback inside app");
    }
  }

  // Step 3: Ensure dist exists
  console.log("[start] Step 3: Checking build...");
  if (!existsSync("./dist/boot.js")) {
    console.log("[start] No dist found, building...");
    execSync("npm run build", { stdio: "inherit", timeout: 120000 });
    console.log("[start] Build complete");
  } else {
    console.log("[start] dist/boot.js exists");
  }

  // Step 4: Start server
  console.log("[start] Step 4: Starting server...");
  import("./dist/boot.js").then(() => {
    console.log("[start] Server module loaded");
  }).catch((e) => {
    console.error("[start] Failed to load server:", e.message);
    console.error(e.stack);
    process.exit(1);
  });
} catch (e) {
  console.error("[start] FATAL:", e.message);
  console.error(e.stack);
  process.exit(1);
}
