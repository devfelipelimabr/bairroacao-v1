import { sql } from "drizzle-orm";
import {
  sqliteTable,
  integer,
  text,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  unionId: text("unionId").notNull().unique(),
  name: text("name"),
  email: text("email"),
  avatar: text("avatar"),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  primaryNeighborhoodId: integer("primaryNeighborhoodId", { mode: "number" }),
  reputationScore: integer("reputationScore", { mode: "number" }).default(0).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
  lastSignInAt: integer("lastSignInAt", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});

export const neighborhoods = sqliteTable("neighborhoods", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  active: integer("active", { mode: "boolean" }).default(true).notNull(),
  minUsers: integer("minUsers", { mode: "number" }).default(30).notNull(),
  usersCount: integer("usersCount", { mode: "number" }).default(0).notNull(),
});

export const neighborhoodUsers = sqliteTable("neighborhood_users", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("userId", { mode: "number" }).notNull(),
  neighborhoodId: integer("neighborhoodId", { mode: "number" }).notNull(),
  isPrimary: integer("isPrimary", { mode: "boolean" }).default(false).notNull(),
  isObserver: integer("isObserver", { mode: "boolean" }).default(false).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});

export const posts = sqliteTable("posts", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  type: text("type", { enum: ["issue", "proposal", "alert", "service"] }).notNull(),
  category: text("category").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status", { enum: ["Aberto", "Confirmado", "Em andamento", "Resolvido"] }).default("Aberto").notNull(),
  confirms: integer("confirms", { mode: "number" }).default(0).notNull(),
  comments: integer("comments", { mode: "number" }).default(0).notNull(),
  dist: integer("dist", { mode: "number" }).default(0).notNull(),
  x: integer("x", { mode: "number" }).default(0).notNull(),
  y: integer("y", { mode: "number" }).default(0).notNull(),
  authorId: integer("authorId", { mode: "number" }).notNull(),
  neighborhoodId: integer("neighborhoodId", { mode: "number" }).notNull(),
  coords: text("coords").notNull(),
  photo: text("photo"),
  valid: text("valid"),
  blur: integer("blur", { mode: "boolean" }).default(false).notNull(),
  proof: integer("proof", { mode: "boolean" }).default(false).notNull(),
  rating: text("rating"),
  apoio: integer("apoio", { mode: "number" }).default(0).notNull(),
  contra: integer("contra", { mode: "number" }).default(0).notNull(),
  quorum: integer("quorum", { mode: "number" }).default(30).notNull(),
  deadline: text("deadline"),
  createdAt: integer("createdAt", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});

export const postConfirmations = sqliteTable("post_confirmations", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  postId: integer("postId", { mode: "number" }).notNull(),
  userId: integer("userId", { mode: "number" }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});

export const postVotes = sqliteTable("post_votes", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  postId: integer("postId", { mode: "number" }).notNull(),
  userId: integer("userId", { mode: "number" }).notNull(),
  side: text("side", { enum: ["apoio", "contra"] }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Neighborhood = typeof neighborhoods.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type PostConfirmation = typeof postConfirmations.$inferSelect;
export type PostVote = typeof postVotes.$inferSelect;
