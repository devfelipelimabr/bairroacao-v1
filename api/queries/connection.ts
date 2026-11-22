import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";
import { log } from "../lib/logger";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;

export function getDb() {
  if (!instance) {
    const dbPath = env.databaseUrl || "./data/bairroacao.sqlite";
    const client = new Database(dbPath);
    client.pragma("journal_mode = WAL");
    instance = drizzle(client, { schema: fullSchema });
    log.info(`[db] SQLite connected at ${dbPath}`);
  }
  return instance;
}
