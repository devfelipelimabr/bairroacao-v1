import { TRPCError } from "@trpc/server";
import { middleware, publicProcedure } from "./trpc";

const authMiddleware = middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Authentication required" });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

const adminMiddleware = middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Authentication required" });
  }
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const publicQuery = publicProcedure;
export const authedQuery = publicProcedure.use(authMiddleware);
export const adminQuery = publicProcedure.use(adminMiddleware);

export { createRouter } from "./trpc";
