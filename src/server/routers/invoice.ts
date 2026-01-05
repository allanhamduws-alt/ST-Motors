import { z } from "zod"
import { router, protectedProcedure, adminProcedure } from "../trpc"
import { db } from "@/lib/db"
import { TRPCError } from "@trpc/server"

// Zod Schema für Rechnungs-Position
const invoicePositionSchema = z.object({
  description: z.string().min(1, "Beschreibung ist erforderlich"),
  quantity: z.number().min(1).default(1),
  unitPrice: z.number().min(0),
  total: z.number().min(0),
})

// Zod Schema für Rechnungs-Input
const invoiceInputSchema = z.object({
  customerId: z.string().min(1, "Kunde ist erforderlich"),
  contractId: z.string().optional(),
  netAmount: z.number().min(0),
  vatAmount: z.number().min(0),
  grossAmount: z.number().min(0),
  invoiceDate: z.string().optional(),
  dueDate: z.string().optional(),
  status: z.enum(["ENTWURF", "OFFEN", "BEZAHLT", "STORNIERT"]).default("ENTWURF"),
  positions: z.array(invoicePositionSchema).min(1, "Mindestens eine Position erforderlich"),
})

// Rechnungsnummer generieren
async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `RE-${year}-`
  
  const lastInvoice = await db.invoice.findFirst({
    where: {
      invoiceNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      invoiceNumber: "desc",
    },
  })

  let nextNumber = 1
  if (lastInvoice) {
    const lastNumber = parseInt(lastInvoice.invoiceNumber.split("-")[2])
    nextNumber = lastNumber + 1
  }

  return `${prefix}${String(nextNumber).padStart(4, "0")}`
}

export const invoiceRouter = router({
  // Alle Rechnungen auflisten
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
        status: z.enum(["ENTWURF", "OFFEN", "BEZAHLT", "STORNIERT"]).optional(),
        customerId: z.string().optional(),
        sortBy: z.enum(["createdAt", "invoiceNumber", "invoiceDate", "grossAmount"]).default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
      }).optional()
    )
    .query(async ({ input }) => {
      const { page = 1, limit = 20, search, status, customerId, sortBy = "createdAt", sortOrder = "desc" } = input || {}

      const where = {
        ...(search && {
          OR: [
            { invoiceNumber: { contains: search, mode: "insensitive" as const } },
            { customer: { lastName: { contains: search, mode: "insensitive" as const } } },
            { customer: { company: { contains: search, mode: "insensitive" as const } } },
          ],
        }),
        ...(status && { status }),
        ...(customerId && { customerId }),
      }

      const [invoices, total] = await Promise.all([
        db.invoice.findMany({
          where,
          include: {
            customer: {
              select: {
                id: true,
                customerNumber: true,
                type: true,
                company: true,
                firstName: true,
                lastName: true,
              },
            },
            contract: {
              select: {
                id: true,
                contractNumber: true,
                type: true,
              },
            },
            createdBy: {
              select: { name: true },
            },
            _count: {
              select: { positions: true },
            },
          },
          orderBy: { [sortBy]: sortOrder },
          skip: (page - 1) * limit,
          take: limit,
        }),
        db.invoice.count({ where }),
      ])

      return {
        invoices,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }
    }),

  // Einzelne Rechnung abrufen
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const invoice = await db.invoice.findUnique({
        where: { id: input.id },
        include: {
          customer: true,
          contract: {
            include: {
              vehicle: {
                select: {
                  id: true,
                  vehicleNumber: true,
                  manufacturer: true,
                  model: true,
                },
              },
            },
          },
          positions: true,
          createdBy: {
            select: { name: true, email: true },
          },
        },
      })

      if (!invoice) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Rechnung nicht gefunden",
        })
      }

      return invoice
    }),

  // Neue Rechnung erstellen
  create: protectedProcedure
    .input(invoiceInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { positions, invoiceDate, dueDate, ...invoiceData } = input

      // Prüfen ob Kunde existiert
      const customer = await db.customer.findUnique({ where: { id: input.customerId } })
      if (!customer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kunde nicht gefunden",
        })
      }

      // Rechnungsnummer generieren
      const invoiceNumber = await generateInvoiceNumber()

      const invoice = await db.invoice.create({
        data: {
          ...invoiceData,
          invoiceNumber,
          invoiceDate: invoiceDate ? new Date(invoiceDate) : new Date(),
          dueDate: dueDate ? new Date(dueDate) : null,
          createdById: ctx.session.user.id,
          positions: {
            create: positions,
          },
        },
        include: {
          customer: true,
          positions: true,
        },
      })

      return invoice
    }),

  // Rechnung aktualisieren
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: invoiceInputSchema.partial().extend({
          positions: z.array(invoicePositionSchema).optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      const { id, data } = input
      const { positions, invoiceDate, dueDate, ...invoiceData } = data

      const existing = await db.invoice.findUnique({ where: { id } })
      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Rechnung nicht gefunden",
        })
      }

      // Positionen aktualisieren falls vorhanden
      if (positions !== undefined) {
        await db.invoicePosition.deleteMany({ where: { invoiceId: id } })
        if (positions.length > 0) {
          await db.invoicePosition.createMany({
            data: positions.map((pos) => ({
              ...pos,
              invoiceId: id,
            })),
          })
        }
      }

      const invoice = await db.invoice.update({
        where: { id },
        data: {
          ...invoiceData,
          ...(invoiceDate && { invoiceDate: new Date(invoiceDate) }),
          ...(dueDate && { dueDate: new Date(dueDate) }),
        },
        include: {
          customer: true,
          positions: true,
        },
      })

      return invoice
    }),

  // Rechnung als bezahlt markieren
  markAsPaid: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const invoice = await db.invoice.update({
        where: { id: input.id },
        data: {
          status: "BEZAHLT",
          paidDate: new Date(),
        },
      })

      return invoice
    }),

  // Rechnung löschen (nur Admin)
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const existing = await db.invoice.findUnique({ where: { id: input.id } })

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Rechnung nicht gefunden",
        })
      }

      // Nur Entwürfe können gelöscht werden
      if (existing.status !== "ENTWURF") {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Nur Entwürfe können gelöscht werden",
        })
      }

      await db.invoice.delete({ where: { id: input.id } })
      return { success: true }
    }),

  // Statistiken
  getStats: protectedProcedure.query(async () => {
    const [total, draft, open, paid, cancelled] = await Promise.all([
      db.invoice.count(),
      db.invoice.count({ where: { status: "ENTWURF" } }),
      db.invoice.count({ where: { status: "OFFEN" } }),
      db.invoice.count({ where: { status: "BEZAHLT" } }),
      db.invoice.count({ where: { status: "STORNIERT" } }),
    ])

    const thisMonth = await db.invoice.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    })

    const [totalRevenue, openAmount] = await Promise.all([
      db.invoice.aggregate({
        where: { status: "BEZAHLT" },
        _sum: { grossAmount: true },
      }),
      db.invoice.aggregate({
        where: { status: "OFFEN" },
        _sum: { grossAmount: true },
      }),
    ])

    return {
      total,
      draft,
      open,
      paid,
      cancelled,
      thisMonth,
      totalRevenue: totalRevenue._sum.grossAmount || 0,
      openAmount: openAmount._sum.grossAmount || 0,
    }
  }),
})

