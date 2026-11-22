import { authRouter } from "./auth-router";
import { createRouter, publicQuery } from "./middleware";
import { neighborhoodRouter } from "./routers/neighborhood";
import { postRouter } from "./routers/post";
import { proposalRouter } from "./routers/proposal";
import { dossieRouter } from "./routers/dossie";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  neighborhood: neighborhoodRouter,
  post: postRouter,
  proposal: proposalRouter,
  dossie: dossieRouter,
});

export type AppRouter = typeof appRouter;
