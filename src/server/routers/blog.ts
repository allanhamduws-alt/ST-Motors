import { z } from "zod"
import { router, protectedProcedure, publicProcedure } from "../trpc"
import { db } from "@/lib/db"
import { TRPCError } from "@trpc/server"

// Zod Schema für Blog-Input
const blogInputSchema = z.object({
  title: z.string().min(1, "Titel ist erforderlich"),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Inhalt ist erforderlich"),
  featuredImage: z.string().optional(),
  status: z.enum(["ENTWURF", "VEROEFFENTLICHT"]).default("ENTWURF"),
  publishedAt: z.string().optional(),
})

// Slug generieren
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[äöü]/g, (match) => ({ "ä": "ae", "ö": "oe", "ü": "ue" })[match] || match)
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export const blogRouter = router({
  // Alle Blog-Beiträge (Admin)
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(20),
        status: z.enum(["ENTWURF", "VEROEFFENTLICHT"]).optional(),
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const { page = 1, limit = 20, status, search } = input || {}

      const where = {
        ...(status && { status }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { content: { contains: search, mode: "insensitive" as const } },
          ],
        }),
      }

      const [posts, total] = await Promise.all([
        db.blogPost.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        db.blogPost.count({ where }),
      ])

      return {
        posts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }
    }),

  // Öffentliche Blog-Beiträge
  listPublished: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(20).default(10),
      }).optional()
    )
    .query(async ({ input }) => {
      const { page = 1, limit = 10 } = input || {}

      const [posts, total] = await Promise.all([
        db.blogPost.findMany({
          where: { status: "VEROEFFENTLICHT" },
          orderBy: { publishedAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        db.blogPost.count({ where: { status: "VEROEFFENTLICHT" } }),
      ])

      return {
        posts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }
    }),

  // Einzelnen Blog-Beitrag abrufen (Admin)
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const post = await db.blogPost.findUnique({
        where: { id: input.id },
      })

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Blog-Beitrag nicht gefunden",
        })
      }

      return post
    }),

  // Einzelnen Blog-Beitrag per Slug (Public)
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const post = await db.blogPost.findUnique({
        where: { slug: input.slug },
      })

      if (!post || post.status !== "VEROEFFENTLICHT") {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Blog-Beitrag nicht gefunden",
        })
      }

      return post
    }),

  // Neuen Blog-Beitrag erstellen
  create: protectedProcedure
    .input(blogInputSchema)
    .mutation(async ({ input }) => {
      const { publishedAt, ...data } = input

      // Einzigartigen Slug generieren
      let slug = generateSlug(input.title)
      let counter = 0
      
      while (await db.blogPost.findUnique({ where: { slug } })) {
        counter++
        slug = `${generateSlug(input.title)}-${counter}`
      }

      const post = await db.blogPost.create({
        data: {
          ...data,
          slug,
          publishedAt: data.status === "VEROEFFENTLICHT" 
            ? (publishedAt ? new Date(publishedAt) : new Date())
            : null,
        },
      })

      return post
    }),

  // Blog-Beitrag aktualisieren
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: blogInputSchema.partial(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, data } = input
      const { publishedAt, ...updateData } = data

      const existing = await db.blogPost.findUnique({ where: { id } })
      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Blog-Beitrag nicht gefunden",
        })
      }

      // Slug nur aktualisieren, wenn sich der Titel ändert
      let slug = existing.slug
      if (data.title && data.title !== existing.title) {
        slug = generateSlug(data.title)
        let counter = 0
        while (await db.blogPost.findFirst({ where: { slug, NOT: { id } } })) {
          counter++
          slug = `${generateSlug(data.title)}-${counter}`
        }
      }

      // Wenn Status auf VEROEFFENTLICHT wechselt, publishedAt setzen
      let newPublishedAt = existing.publishedAt
      if (data.status === "VEROEFFENTLICHT" && existing.status !== "VEROEFFENTLICHT") {
        newPublishedAt = publishedAt ? new Date(publishedAt) : new Date()
      }

      const post = await db.blogPost.update({
        where: { id },
        data: {
          ...updateData,
          slug,
          publishedAt: newPublishedAt,
        },
      })

      return post
    }),

  // Blog-Beitrag löschen
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const existing = await db.blogPost.findUnique({ where: { id: input.id } })
      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Blog-Beitrag nicht gefunden",
        })
      }

      await db.blogPost.delete({ where: { id: input.id } })
      return { success: true }
    }),

  // Blog Statistiken
  getStats: protectedProcedure.query(async () => {
    const [total, published, draft] = await Promise.all([
      db.blogPost.count(),
      db.blogPost.count({ where: { status: "VEROEFFENTLICHT" } }),
      db.blogPost.count({ where: { status: "ENTWURF" } }),
    ])

    return { total, published, draft }
  }),
})

