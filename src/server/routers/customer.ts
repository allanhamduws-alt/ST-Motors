import { z } from "zod"
import { router, protectedProcedure, adminProcedure } from "../trpc"
import { db } from "@/lib/db"
import { TRPCError } from "@trpc/server"

// Zod Schema für Kunden-Input
const customerInputSchema = z.object({
  type: z.enum(["PRIVAT", "GEWERBE"]).default("PRIVAT"),
  role: z.enum(["INTERESSENT", "KAEUFER", "VERKAEUFER"]).default("INTERESSENT"),
  company: z.string().optional(),
  salutation: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().min(1, "Nachname ist erforderlich"),
  street: z.string().optional(),
  zipCode: z.string().optional(),
  city: z.string().optional(),
  country: z.string().default("Deutschland"),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  notes: z.string().optional(),
})

export const customerRouter = router({
  // Alle Kunden auflisten (mit Pagination und Filter)
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
        type: z.enum(["PRIVAT", "GEWERBE"]).optional(),
        role: z.enum(["INTERESSENT", "KAEUFER", "VERKAEUFER"]).optional(),
        sortBy: z.enum(["createdAt", "customerNumber", "lastName"]).default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
      }).optional()
    )
    .query(async ({ input }) => {
      const { page = 1, limit = 20, search, type, role, sortBy = "createdAt", sortOrder = "desc" } = input || {}

      const where = {
        ...(search && {
          OR: [
            { firstName: { contains: search, mode: "insensitive" as const } },
            { lastName: { contains: search, mode: "insensitive" as const } },
            { company: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search, mode: "insensitive" as const } },
          ],
        }),
        ...(type && { type }),
        ...(role && { role }),
      }

      const [customers, total] = await Promise.all([
        db.customer.findMany({
          where,
          include: {
            _count: {
              select: {
                contracts: true,
                invoices: true,
              },
            },
          },
          orderBy: { [sortBy]: sortOrder },
          skip: (page - 1) * limit,
          take: limit,
        }),
        db.customer.count({ where }),
      ])

      return {
        customers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }
    }),

  // Einzelnen Kunden abrufen
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const customer = await db.customer.findUnique({
        where: { id: input.id },
        include: {
          contracts: {
            include: {
              vehicle: {
                select: {
                  id: true,
                  manufacturer: true,
                  model: true,
                  vehicleNumber: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
            take: 10,
          },
          invoices: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
          _count: {
            select: {
              contracts: true,
              invoices: true,
            },
          },
        },
      })

      if (!customer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kunde nicht gefunden",
        })
      }

      return customer
    }),

  // Neuen Kunden erstellen
  create: protectedProcedure
    .input(customerInputSchema)
    .mutation(async ({ input }) => {
      const customer = await db.customer.create({
        data: {
          ...input,
          email: input.email || null,
        },
      })

      return customer
    }),

  // Kunden aktualisieren
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: customerInputSchema.partial(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, data } = input

      const existing = await db.customer.findUnique({ where: { id } })
      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kunde nicht gefunden",
        })
      }

      const customer = await db.customer.update({
        where: { id },
        data: {
          ...data,
          email: data.email === "" ? null : data.email,
        },
      })

      return customer
    }),

  // Kunden löschen (nur Admin)
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const existing = await db.customer.findUnique({ 
        where: { id: input.id },
        include: {
          _count: {
            select: {
              contracts: true,
              invoices: true,
            },
          },
        },
      })

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kunde nicht gefunden",
        })
      }

      // Prüfen ob Kunde Verträge oder Rechnungen hat
      if (existing._count.contracts > 0 || existing._count.invoices > 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Kunde hat noch zugeordnete Verträge oder Rechnungen",
        })
      }

      await db.customer.delete({ where: { id: input.id } })
      return { success: true }
    }),

  // Kundensuche für Autocomplete
  search: protectedProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ input }) => {
      const customers = await db.customer.findMany({
        where: {
          OR: [
            { firstName: { contains: input.query, mode: "insensitive" } },
            { lastName: { contains: input.query, mode: "insensitive" } },
            { company: { contains: input.query, mode: "insensitive" } },
            { email: { contains: input.query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          customerNumber: true,
          type: true,
          company: true,
          firstName: true,
          lastName: true,
          email: true,
        },
        take: 10,
      })

      return customers
    }),

  // Statistiken
  getStats: protectedProcedure.query(async () => {
    const [total, private_, business, buyers, sellers] = await Promise.all([
      db.customer.count(),
      db.customer.count({ where: { type: "PRIVAT" } }),
      db.customer.count({ where: { type: "GEWERBE" } }),
      db.customer.count({ where: { role: "KAEUFER" } }),
      db.customer.count({ where: { role: "VERKAEUFER" } }),
    ])

    const thisMonth = await db.customer.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    })

    return {
      total,
      private: private_,
      business,
      buyers,
      sellers,
      thisMonth,
    }
  }),
})

