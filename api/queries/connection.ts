import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { env } from "../lib/env";
import { log } from "../lib/logger";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: BetterSQLite3Database<typeof fullSchema> | undefined;

export async function getDb(): Promise<BetterSQLite3Database<typeof fullSchema>> {
  if (!instance) {
    const dbPath = env.databaseUrl || "./data/bairroacao.sqlite";
    try {
      const { default: Database } = await import("better-sqlite3");
      const client = new Database(dbPath);
      client.pragma("journal_mode = WAL");
      const { drizzle } = await import("drizzle-orm/better-sqlite3");
      instance = drizzle(client, { schema: fullSchema });
      log.info(`[db] SQLite connected at ${dbPath}`);
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      log.error("[db] Failed to connect to SQLite: " + err);
      log.warn("[db] Falling back to in-memory SQLite");
      const { default: Database } = await import("better-sqlite3");
      const client = new Database(":memory:");
      const { drizzle } = await import("drizzle-orm/better-sqlite3");
      instance = drizzle(client, { schema: fullSchema });
    }
  }
  return instance;
}
