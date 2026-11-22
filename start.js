import { execSync } from "child_process";
import { existsSync } from "fs";

process.env.NODE_ENV = "production";

if (!existsSync("./dist/boot.js")) {
  console.log("[start] Build not found, running npm run build...");
  try {
    execSync("npm run build", { stdio: "inherit" });
  } catch (e) {
    console.error("[start] Build failed:", e.message);
    process.exit(1);
  }
}

await import("./dist/boot.js");
