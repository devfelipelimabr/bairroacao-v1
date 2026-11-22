import { z } from "zod";
import { eq } from "drizzle-orm";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { posts, neighborhoods } from "@db/schema";

export const dossieRouter = createRouter({
  generate: publicQuery
    .input(z.object({ neighborhoodId: z.number().positive() }))
    .query(async ({ input }) => {
      const db = await getDb();
      const hood = await db
        .select()
        .from(neighborhoods)
        .where(eq(neighborhoods.id, input.neighborhoodId))
        .limit(1);

      const top = await db
        .select()
        .from(posts)
        .where(eq(posts.neighborhoodId, input.neighborhoodId));

      const sorted = top
        .filter((p) => p.type === "issue")
        .sort((a, b) => b.confirms - a.confirms)
        .slice(0, 10);

      return {
        neighborhood: hood[0] ?? null,
        month: new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" }),
        top: sorted,
        total: sorted.reduce((a, p) => a + p.confirms, 0),
      };
    }),
});
