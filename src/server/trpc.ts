import { initTRPC, TRPCError } from "@trpc/server"
import { getServerSession } from "next-auth"
import superjson from "superjson"
import { ZodError } from "zod"
import { authOptions } from "@/lib/auth"

export const createTRPCContext = async () => {
  const session = await getServerSession(authOptions)
  return { session }
}

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const createCallerFactory = t.createCallerFactory
export const router = t.router
export const publicProcedure = t.procedure

// Middleware für authentifizierte Benutzer
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  })
})

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed)

// Middleware für Admin-Benutzer
const enforceUserIsAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user || ctx.session.user.role !== "ADMIN") {
    throw new TRPCError({ code: "FORBIDDEN" })
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  })
})

export const adminProcedure = t.procedure.use(enforceUserIsAdmin)

