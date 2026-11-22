import { oauthEndpoints } from "./oauth-env";
import "dotenv/config";
import { log } from "./logger";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    if (process.env.NODE_ENV === "production") {
      log.warn(`Missing environment variable: ${name} — some features may not work`);
    }
  }
  return value ?? "";
}

export const env = {
  appId: required("APP_ID"),
  appSecret: required("APP_SECRET"),
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: process.env.DATABASE_URL || "./data/bairroacao.sqlite",
  kimiAuthUrl: oauthEndpoints.KIMI_AUTH_URL ?? required("KIMI_AUTH_URL"),
  kimiOpenUrl: oauthEndpoints.KIMI_OPEN_URL ?? required("KIMI_OPEN_URL"),
  ownerUnionId: process.env.OWNER_UNION_ID ?? "",
};
