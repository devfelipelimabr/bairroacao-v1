import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createRouter, publicQuery, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { posts, postConfirmations, users } from "@db/schema";

export const postRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        neighborhoodId: z.number().positive().optional(),
        filter: z.string().default("Todos"),
        sort: z.enum(["relev", "recentes"]).default("relev"),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const i = input ?? { filter: "Todos", sort: "relev" };
      const all = await db.select().from(posts);
      let filtered = all;
      if (i.neighborhoodId) {
        filtered = filtered.filter((p) => p.neighborhoodId === i.neighborhoodId);
      }
      if (i.filter && i.filter !== "Todos") {
        filtered = filtered.filter((p) => p.category === i.filter);
      }
      filtered.sort((a, b) =>
        i.sort === "recentes"
          ? b.id - a.id
          : b.confirms - a.confirms
      );
      return filtered;
    }),

  create: authedQuery
    .input(
      z.object({
        type: z.enum(["issue", "proposal", "alert", "service"]),
        category: z.string().min(1),
        title: z.string().min(1).max(255),
        description: z.string().max(500).optional(),
        neighborhoodId: z.number().positive(),
        photo: z.string().optional(),
        deadline: z.string().optional(),
        valid: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const coords = `-23.55${10 + Math.floor(Math.random() * 80)}, -46.68${10 + Math.floor(Math.random() * 80)}`;
      const base = {
        type: input.type,
        category: input.category,
        title: input.title,
        description: input.description ?? "",
        authorId: ctx.user.id,
        neighborhoodId: input.neighborhoodId,
        coords,
        dist: 120 + Math.floor(Math.random() * 600),
        x: 80 + Math.floor(Math.random() * 220),
        y: 60 + Math.floor(Math.random() * 200),
        photo: input.photo ?? null,
        valid: input.valid ?? null,
      };
      const result = await db.insert(posts).values(base).$returningId();
      return { id: result[0].id };
    }),

  confirm: authedQuery
    .input(z.object({ postId: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(postConfirmations)
        .where(
          and(
            eq(postConfirmations.postId, input.postId),
            eq(postConfirmations.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        return { duplicate: true };
      }

      await db.insert(postConfirmations).values({
        postId: input.postId,
        userId: ctx.user.id,
      });

      const post = await db
        .select()
        .from(posts)
        .where(eq(posts.id, input.postId))
        .limit(1);

      if (post.length === 0) throw new Error("Post not found");

      const newConfirms = post[0].confirms + 1;
      const newStatus =
        post[0].status === "Aberto" ? "Confirmado" : post[0].status;

      await db
        .update(posts)
        .set({ confirms: newConfirms, status: newStatus })
        .where(eq(posts.id, input.postId));

      await db
        .update(users)
        .set({ reputationScore: (ctx.user.reputationScore ?? 0) + 1 })
        .where(eq(users.id, ctx.user.id));

      return { duplicate: false, confirms: newConfirms, status: newStatus };
    }),

  myConfirms: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const rows = await db
      .select()
      .from(postConfirmations)
      .where(eq(postConfirmations.userId, ctx.user.id));
    return rows.map((r) => r.postId);
  }),
});
