import { z } from "zod"
import { router, protectedProcedure, publicProcedure } from "../trpc"
import { db } from "@/lib/db"
import { TRPCError } from "@trpc/server"

// Zod Schema für Lead-Input
const leadInputSchema = z.object({
  type: z.enum(["FAHRZEUGANFRAGE", "ANKAUFANFRAGE", "KONTAKT"]),
  name: z.string().min(1, "Name ist erforderlich"),
  email: z.string().email("Gültige E-Mail erforderlich"),
  phone: z.string().optional(),
  message: z.string().min(1, "Nachricht ist erforderlich"),
  vehicleId: z.string().optional(),
})

export const leadRouter = router({
  // Alle Leads auflisten (nur Admin/Mitarbeiter)
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
        type: z.enum(["FAHRZEUGANFRAGE", "ANKAUFANFRAGE", "KONTAKT"]).optional(),
        status: z.enum(["NEU", "IN_BEARBEITUNG", "ABGESCHLOSSEN"]).optional(),
        sortBy: z.enum(["createdAt", "name", "type"]).default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
      }).optional()
    )
    .query(async ({ input }) => {
      const { page = 1, limit = 20, search, type, status, sortBy = "createdAt", sortOrder = "desc" } = input || {}

      const where = {
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search, mode: "insensitive" as const } },
            { message: { contains: search, mode: "insensitive" as const } },
          ],
        }),
        ...(type && { type }),
        ...(status && { status }),
      }

      const [leads, total] = await Promise.all([
        db.lead.findMany({
          where,
          include: {
            vehicle: {
              select: {
                id: true,
                vehicleNumber: true,
                manufacturer: true,
                model: true,
                slug: true,
              },
            },
          },
          orderBy: { [sortBy]: sortOrder },
          skip: (page - 1) * limit,
          take: limit,
        }),
        db.lead.count({ where }),
      ])

      return {
        leads,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }
    }),

  // Einzelnen Lead abrufen
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const lead = await db.lead.findUnique({
        where: { id: input.id },
        include: {
          vehicle: {
            include: {
              images: {
                orderBy: { order: "asc" },
                take: 1,
              },
            },
          },
        },
      })

      if (!lead) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Anfrage nicht gefunden",
        })
      }

      return lead
    }),

  // Neuen Lead erstellen (öffentlich - für Website-Formulare)
  create: publicProcedure
    .input(leadInputSchema)
    .mutation(async ({ input }) => {
      // Bei Fahrzeuganfrage: Prüfen ob Fahrzeug existiert
      if (input.vehicleId) {
        const vehicle = await db.vehicle.findUnique({ where: { id: input.vehicleId } })
        if (!vehicle) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Fahrzeug nicht gefunden",
          })
        }
      }

      const lead = await db.lead.create({
        data: input,
        include: {
          vehicle: {
            select: {
              id: true,
              manufacturer: true,
              model: true,
            },
          },
        },
      })

      return lead
    }),

  // Lead-Status aktualisieren
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["NEU", "IN_BEARBEITUNG", "ABGESCHLOSSEN"]),
      })
    )
    .mutation(async ({ input }) => {
      const existing = await db.lead.findUnique({ where: { id: input.id } })
      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Anfrage nicht gefunden",
        })
      }

      const lead = await db.lead.update({
        where: { id: input.id },
        data: { status: input.status },
      })

      return lead
    }),

  // Lead löschen
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const existing = await db.lead.findUnique({ where: { id: input.id } })

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Anfrage nicht gefunden",
        })
      }

      await db.lead.delete({ where: { id: input.id } })
      return { success: true }
    }),

  // Lead zu Kunde konvertieren
  convertToCustomer: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const lead = await db.lead.findUnique({ where: { id: input.id } })

      if (!lead) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Anfrage nicht gefunden",
        })
      }

      // Namen aufteilen (vereinfacht)
      const nameParts = lead.name.trim().split(" ")
      const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : undefined
      const lastName = nameParts[nameParts.length - 1]

      // Kunden erstellen
      const customer = await db.customer.create({
        data: {
          type: "PRIVAT",
          role: lead.type === "ANKAUFANFRAGE" ? "VERKAEUFER" : "INTERESSENT",
          firstName,
          lastName,
          email: lead.email,
          phone: lead.phone,
          notes: `Konvertiert aus ${lead.type}: ${lead.message}`,
        },
      })

      // Lead als abgeschlossen markieren
      await db.lead.update({
        where: { id: input.id },
        data: { status: "ABGESCHLOSSEN" },
      })

      return customer
    }),

  // Statistiken
  getStats: protectedProcedure.query(async () => {
    const [total, newLeads, inProgress, completed] = await Promise.all([
      db.lead.count(),
      db.lead.count({ where: { status: "NEU" } }),
      db.lead.count({ where: { status: "IN_BEARBEITUNG" } }),
      db.lead.count({ where: { status: "ABGESCHLOSSEN" } }),
    ])

    const today = await db.lead.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    })

    const thisWeek = await db.lead.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    })

    const byType = await db.lead.groupBy({
      by: ["type"],
      _count: true,
    })

    return {
      total,
      new: newLeads,
      inProgress,
      completed,
      today,
      thisWeek,
      byType: byType.reduce((acc, item) => {
        acc[item.type] = item._count
        return acc
      }, {} as Record<string, number>),
    }
  }),
})

