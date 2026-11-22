import { Hono } from "hono";
import { trpcServer } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { log } from "./lib/logger";
import { cors } from "hono/cors";
import { serveStatic } from "@hono/node-server/serve-static";

const app = new Hono();

app.use("*", cors());
app.use("/api/trpc/*", trpcServer({ router: appRouter, createContext }));
app.use("/*", serveStatic({ root: "./dist/public" }));

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "8080");
  serve({ fetch: app.fetch, port }, () => {
    log.info(`Server running on http://localhost:${port}/`);
  });
}
