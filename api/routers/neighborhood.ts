import { z } from "zod";
import { eq } from "drizzle-orm";
import { createRouter, publicQuery, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { neighborhoods, users } from "@db/schema";

export const neighborhoodRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(neighborhoods);
  }),

  setPrimary: authedQuery
    .input(z.object({ neighborhoodId: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .update(users)
        .set({ primaryNeighborhoodId: input.neighborhoodId })
        .where(eq(users.id, ctx.user.id));
      return { success: true };
    }),

  myNeighborhoods: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const primary = await db
      .select()
      .from(neighborhoods)
      .where(eq(neighborhoods.id, ctx.user.primaryNeighborhoodId ?? 0))
      .limit(1);
    return {
      primary: primary[0] ?? null,
      all: await db.select().from(neighborhoods),
    };
  }),
});
