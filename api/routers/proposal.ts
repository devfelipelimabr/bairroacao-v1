import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createRouter, publicQuery, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { posts, postVotes } from "@db/schema";


export const proposalRouter = createRouter({
  list: publicQuery
    .input(z.object({ neighborhoodId: z.number().positive().optional() }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      const nid = input?.neighborhoodId;
      const rows = nid
        ? await db.select().from(posts).where(eq(posts.type, "proposal")).then((r) => r.filter((p) => p.neighborhoodId === nid))
        : await db.select().from(posts).where(eq(posts.type, "proposal"));
      return rows;
    }),

  vote: authedQuery
    .input(z.object({ postId: z.number().positive(), side: z.enum(["apoio", "contra"]) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const existing = await db
        .select()
        .from(postVotes)
        .where(and(eq(postVotes.postId, input.postId), eq(postVotes.userId, ctx.user.id)))
        .limit(1);

      const post = await db.select().from(posts).where(eq(posts.id, input.postId)).limit(1);
      if (post.length === 0) throw new Error("Post not found");
      let p = post[0];

      if (existing.length > 0 && existing[0].side === input.side) {
        return { changed: false, post: p, my: input.side };
      }

      if (existing.length > 0) {
        if (existing[0].side === "apoio") p.apoio--;
        else p.contra--;
        await db.delete(postVotes).where(eq(postVotes.id, existing[0].id));
      }

      if (input.side === "apoio") p.apoio++;
      else p.contra++;

      await db.insert(postVotes).values({ postId: input.postId, userId: ctx.user.id, side: input.side });
      await db.update(posts).set({ apoio: p.apoio, contra: p.contra }).where(eq(posts.id, input.postId));

      return { changed: true, post: { ...p, apoio: p.apoio, contra: p.contra }, my: input.side };
    }),

  myVotes: authedQuery.query(async ({ ctx }) => {
    const db = await getDb();
    const rows = await db.select().from(postVotes).where(eq(postVotes.userId, ctx.user.id));
    return Object.fromEntries(rows.map((r) => [r.postId, r.side]));
  }),

  ranking: publicQuery
    .input(z.object({ neighborhoodId: z.number().positive().optional() }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      const nid = input?.neighborhoodId;
      const rows = nid
        ? await db.select().from(posts).where(eq(posts.type, "issue")).then((r) => r.filter((p) => p.neighborhoodId === nid))
        : await db.select().from(posts).where(eq(posts.type, "issue"));
      return rows.sort((a, b) => b.confirms - a.confirms).slice(0, 4);
    }),
});
