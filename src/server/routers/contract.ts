import { z } from "zod"
import { router, protectedProcedure, adminProcedure } from "../trpc"
import { db } from "@/lib/db"
import { TRPCError } from "@trpc/server"

// Zod Schema für Vertrags-Input
const contractInputSchema = z.object({
  type: z.enum(["KAUFVERTRAG", "ANKAUFVERTRAG"]),
  customerId: z.string().min(1, "Kunde ist erforderlich"),
  vehicleId: z.string().min(1, "Fahrzeug ist erforderlich"),
  priceNet: z.number().min(0),
  vat: z.number().min(0),
  priceGross: z.number().min(0),
  deposit: z.number().min(0).default(0),
  contractDate: z.string().optional(),
  deliveryDate: z.string().optional(),
  paymentTerms: z.string().optional(),
  notes: z.string().optional(),
  isAccidentFree: z.boolean().default(true),
  reducedLiability: z.boolean().default(false),
  hasWarranty: z.boolean().default(false),
  status: z.enum(["ENTWURF", "AKTIV", "ABGESCHLOSSEN", "STORNIERT"]).default("ENTWURF"),
})

export const contractRouter = router({
  // Alle Verträge auflisten
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
        type: z.enum(["KAUFVERTRAG", "ANKAUFVERTRAG"]).optional(),
        status: z.enum(["ENTWURF", "AKTIV", "ABGESCHLOSSEN", "STORNIERT"]).optional(),
        customerId: z.string().optional(),
        sortBy: z.enum(["createdAt", "contractNumber", "contractDate", "priceGross"]).default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
      }).optional()
    )
    .query(async ({ input }) => {
      const { page = 1, limit = 20, search, type, status, customerId, sortBy = "createdAt", sortOrder = "desc" } = input || {}

      const where = {
        ...(search && {
          OR: [
            { customer: { lastName: { contains: search, mode: "insensitive" as const } } },
            { customer: { company: { contains: search, mode: "insensitive" as const } } },
            { vehicle: { manufacturer: { contains: search, mode: "insensitive" as const } } },
            { vehicle: { model: { contains: search, mode: "insensitive" as const } } },
          ],
        }),
        ...(type && { type }),
        ...(status && { status }),
        ...(customerId && { customerId }),
      }

      const [contracts, total] = await Promise.all([
        db.contract.findMany({
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
            vehicle: {
              select: {
                id: true,
                vehicleNumber: true,
                manufacturer: true,
                model: true,
                slug: true,
              },
            },
            createdBy: {
              select: { name: true },
            },
          },
          orderBy: { [sortBy]: sortOrder },
          skip: (page - 1) * limit,
          take: limit,
        }),
        db.contract.count({ where }),
      ])

      return {
        contracts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }
    }),

  // Einzelnen Vertrag abrufen
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const contract = await db.contract.findUnique({
        where: { id: input.id },
        include: {
          customer: true,
          vehicle: {
            include: {
              images: {
                orderBy: { order: "asc" },
                take: 1,
              },
            },
          },
          invoices: {
            orderBy: { createdAt: "desc" },
          },
          createdBy: {
            select: { name: true, email: true },
          },
        },
      })

      if (!contract) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Vertrag nicht gefunden",
        })
      }

      return contract
    }),

  // Neuen Vertrag erstellen
  create: protectedProcedure
    .input(contractInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { contractDate, deliveryDate, ...contractData } = input

      // Prüfen ob Kunde existiert
      const customer = await db.customer.findUnique({ where: { id: input.customerId } })
      if (!customer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kunde nicht gefunden",
        })
      }

      // Prüfen ob Fahrzeug existiert
      const vehicle = await db.vehicle.findUnique({ where: { id: input.vehicleId } })
      if (!vehicle) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Fahrzeug nicht gefunden",
        })
      }

      const contract = await db.contract.create({
        data: {
          ...contractData,
          contractDate: contractDate ? new Date(contractDate) : new Date(),
          deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
          createdById: ctx.session.user.id,
        },
        include: {
          customer: true,
          vehicle: true,
        },
      })

      // Kundenrolle aktualisieren basierend auf Vertragstyp
      const newRole = input.type === "KAUFVERTRAG" ? "KAEUFER" : "VERKAEUFER"
      if (customer.role === "INTERESSENT") {
        await db.customer.update({
          where: { id: customer.id },
          data: { role: newRole },
        })
      }

      // Bei Kaufvertrag: Fahrzeugstatus auf "RESERVIERT" setzen
      if (input.type === "KAUFVERTRAG" && input.status === "AKTIV") {
        await db.vehicle.update({
          where: { id: vehicle.id },
          data: { status: "RESERVIERT" },
        })
      }

      return contract
    }),

  // Vertrag aktualisieren
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: contractInputSchema.partial(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, data } = input
      const { contractDate, deliveryDate, ...contractData } = data

      const existing = await db.contract.findUnique({ 
        where: { id },
        include: { vehicle: true },
      })
      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Vertrag nicht gefunden",
        })
      }

      const contract = await db.contract.update({
        where: { id },
        data: {
          ...contractData,
          ...(contractDate && { contractDate: new Date(contractDate) }),
          ...(deliveryDate && { deliveryDate: new Date(deliveryDate) }),
        },
        include: {
          customer: true,
          vehicle: true,
        },
      })

      // Bei Statusänderung auf ABGESCHLOSSEN: Fahrzeug als VERKAUFT markieren
      if (data.status === "ABGESCHLOSSEN" && existing.type === "KAUFVERTRAG") {
        await db.vehicle.update({
          where: { id: existing.vehicleId },
          data: { status: "VERKAUFT" },
        })
      }

      // Bei Stornierung: Fahrzeug wieder AKTIV setzen
      if (data.status === "STORNIERT" && existing.type === "KAUFVERTRAG") {
        await db.vehicle.update({
          where: { id: existing.vehicleId },
          data: { status: "AKTIV" },
        })
      }

      return contract
    }),

  // Vertrag löschen (nur Admin)
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const existing = await db.contract.findUnique({ 
        where: { id: input.id },
        include: {
          _count: {
            select: { invoices: true },
          },
        },
      })

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Vertrag nicht gefunden",
        })
      }

      if (existing._count.invoices > 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Vertrag hat noch zugeordnete Rechnungen",
        })
      }

      await db.contract.delete({ where: { id: input.id } })
      return { success: true }
    }),

  // Statistiken
  getStats: protectedProcedure.query(async () => {
    const [total, draft, active, completed, cancelled] = await Promise.all([
      db.contract.count(),
      db.contract.count({ where: { status: "ENTWURF" } }),
      db.contract.count({ where: { status: "AKTIV" } }),
      db.contract.count({ where: { status: "ABGESCHLOSSEN" } }),
      db.contract.count({ where: { status: "STORNIERT" } }),
    ])

    const thisMonth = await db.contract.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    })

    const totalValue = await db.contract.aggregate({
      where: { status: "ABGESCHLOSSEN" },
      _sum: { priceGross: true },
    })

    return {
      total,
      draft,
      active,
      completed,
      cancelled,
      thisMonth,
      totalValue: totalValue._sum.priceGross || 0,
    }
  }),
})

