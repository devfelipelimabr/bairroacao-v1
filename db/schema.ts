import {
  mysqlTable,
  mysqlEnum,
  serial,
  bigint,
  varchar,
  text,
  int,
  boolean,
  timestamp,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  primaryNeighborhoodId: bigint("primaryNeighborhoodId", { mode: "number", unsigned: true }),
  reputationScore: int("reputationScore").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export const neighborhoods = mysqlTable("neighborhoods", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  city: varchar("city", { length: 255 }).notNull(),
  state: varchar("state", { length: 2 }).notNull(),
  active: boolean("active").default(true).notNull(),
  minUsers: int("minUsers").default(30).notNull(),
  usersCount: int("usersCount").default(0).notNull(),
});

export const neighborhoodUsers = mysqlTable("neighborhood_users", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  neighborhoodId: bigint("neighborhoodId", { mode: "number", unsigned: true }).notNull(),
  isPrimary: boolean("isPrimary").default(false).notNull(),
  isObserver: boolean("isObserver").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const posts = mysqlTable("posts", {
  id: serial("id").primaryKey(),
  type: mysqlEnum("type", ["issue", "proposal", "alert", "service"]).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["Aberto", "Confirmado", "Em andamento", "Resolvido"]).default("Aberto").notNull(),
  confirms: int("confirms").default(0).notNull(),
  comments: int("comments").default(0).notNull(),
  dist: int("dist").default(0).notNull(),
  x: int("x").default(0).notNull(),
  y: int("y").default(0).notNull(),
  authorId: bigint("authorId", { mode: "number", unsigned: true }).notNull(),
  neighborhoodId: bigint("neighborhoodId", { mode: "number", unsigned: true }).notNull(),
  coords: varchar("coords", { length: 100 }).notNull(),
  photo: text("photo"),
  valid: varchar("valid", { length: 100 }),
  blur: boolean("blur").default(false).notNull(),
  proof: boolean("proof").default(false).notNull(),
  rating: varchar("rating", { length: 100 }),
  apoio: int("apoio").default(0).notNull(),
  contra: int("contra").default(0).notNull(),
  quorum: int("quorum").default(30).notNull(),
  deadline: varchar("deadline", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const postConfirmations = mysqlTable("post_confirmations", {
  id: serial("id").primaryKey(),
  postId: bigint("postId", { mode: "number", unsigned: true }).notNull(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const postVotes = mysqlTable("post_votes", {
  id: serial("id").primaryKey(),
  postId: bigint("postId", { mode: "number", unsigned: true }).notNull(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  side: mysqlEnum("side", ["apoio", "contra"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Neighborhood = typeof neighborhoods.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type PostConfirmation = typeof postConfirmations.$inferSelect;
export type PostVote = typeof postVotes.$inferSelect;
