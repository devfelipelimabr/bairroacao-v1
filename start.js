import { execSync } from "child_process";
import { existsSync } from "fs";

if (!existsSync("./dist/boot.js")) {
  console.log("[start] Build not found, running npm run build...");
  execSync("npm run build", { stdio: "inherit" });
}

await import("./dist/boot.js");
