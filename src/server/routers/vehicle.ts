import { z } from "zod"
import { router, protectedProcedure, adminProcedure } from "../trpc"
import { db } from "@/lib/db"
import { TRPCError } from "@trpc/server"

// Zod Schema für Fahrzeug-Input
const vehicleInputSchema = z.object({
  manufacturer: z.string().min(1, "Hersteller ist erforderlich"),
  model: z.string().min(1, "Modell ist erforderlich"),
  variant: z.string().optional(),
  vehicleType: z.enum(["PKW", "SUV", "KOMBI", "COUPE", "CABRIO", "LIMOUSINE", "VAN"]).default("PKW"),
  condition: z.enum(["NEU", "GEBRAUCHT", "JAHRESWAGEN", "VORFUEHRWAGEN"]).default("GEBRAUCHT"),
  status: z.enum(["ENTWURF", "AKTIV", "RESERVIERT", "VERKAUFT"]).default("ENTWURF"),
  vin: z.string().optional(),
  hsn: z.string().optional(),
  tsn: z.string().optional(),
  licensePlate: z.string().optional(),
  firstRegistration: z.string().optional(),
  mileage: z.number().min(0).default(0),
  previousOwners: z.number().min(0).default(0),
  fuelType: z.enum(["BENZIN", "DIESEL", "ELEKTRO", "HYBRID", "LPG"]).optional(),
  transmission: z.enum(["AUTOMATIK", "MANUELL"]).optional(),
  powerKW: z.number().min(0).optional(),
  powerPS: z.number().min(0).optional(),
  displacement: z.number().min(0).optional(),
  driveType: z.enum(["FRONT", "HECK", "ALLRAD"]).optional(),
  exteriorColor: z.string().optional(),
  interiorColor: z.string().optional(),
  doors: z.number().min(2).max(5).optional(),
  seats: z.number().min(2).max(9).optional(),
  features: z.array(z.string()).default([]),
  purchasePrice: z.number().min(0).optional(),
  sellingPrice: z.number().min(0),
  vatType: z.enum(["MWST", "DIFFERENZ"]).default("MWST"),
  title: z.string().optional(),
  description: z.string().optional(),
  exportMobileDE: z.boolean().default(false),
  exportAutoScout: z.boolean().default(false),
  images: z.array(z.object({
    url: z.string(),
    order: z.number(),
  })).default([]),
})

// Helper: Slug generieren
function generateSlug(manufacturer: string, model: string, vehicleNumber: number): string {
  const base = `${manufacturer}-${model}-${vehicleNumber}`
    .toLowerCase()
    .replace(/[äöü]/g, (match) => ({ "ä": "ae", "ö": "oe", "ü": "ue" })[match] || match)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
  return base
}

export const vehicleRouter = router({
  // Alle Fahrzeuge auflisten (mit Pagination und Filter)
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
        manufacturer: z.string().optional(),
        status: z.enum(["ENTWURF", "AKTIV", "RESERVIERT", "VERKAUFT"]).optional(),
        sortBy: z.enum(["createdAt", "sellingPrice", "mileage", "vehicleNumber"]).default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
      }).optional()
    )
    .query(async ({ input }) => {
      const { page = 1, limit = 20, search, manufacturer, status, sortBy = "createdAt", sortOrder = "desc" } = input || {}

      const where = {
        ...(search && {
          OR: [
            { manufacturer: { contains: search, mode: "insensitive" as const } },
            { model: { contains: search, mode: "insensitive" as const } },
            { variant: { contains: search, mode: "insensitive" as const } },
            { title: { contains: search, mode: "insensitive" as const } },
          ],
        }),
        ...(manufacturer && { manufacturer }),
        ...(status && { status }),
      }

      const [vehicles, total] = await Promise.all([
        db.vehicle.findMany({
          where,
          include: {
            images: {
              orderBy: { order: "asc" },
              take: 1,
            },
            createdBy: {
              select: { name: true },
            },
          },
          orderBy: { [sortBy]: sortOrder },
          skip: (page - 1) * limit,
          take: limit,
        }),
        db.vehicle.count({ where }),
      ])

      return {
        vehicles,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }
    }),

  // Einzelnes Fahrzeug abrufen
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const vehicle = await db.vehicle.findUnique({
        where: { id: input.id },
        include: {
          images: {
            orderBy: { order: "asc" },
          },
          createdBy: {
            select: { name: true, email: true },
          },
        },
      })

      if (!vehicle) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Fahrzeug nicht gefunden",
        })
      }

      return vehicle
    }),

  // Neues Fahrzeug erstellen
  create: protectedProcedure
    .input(vehicleInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { images, firstRegistration, ...vehicleData } = input

      // Nächste Fahrzeugnummer ermitteln
      const lastVehicle = await db.vehicle.findFirst({
        orderBy: { vehicleNumber: "desc" },
        select: { vehicleNumber: true },
      })
      const nextNumber = (lastVehicle?.vehicleNumber || 0) + 1

      // Slug generieren
      const slug = generateSlug(input.manufacturer, input.model, nextNumber)

      const vehicle = await db.vehicle.create({
        data: {
          ...vehicleData,
          vehicleNumber: nextNumber,
          slug,
          firstRegistration: firstRegistration ? new Date(firstRegistration) : null,
          createdById: ctx.session.user.id,
          images: {
            create: images.map((img, index) => ({
              url: img.url,
              order: img.order ?? index,
            })),
          },
        },
        include: {
          images: true,
        },
      })

      return vehicle
    }),

  // Fahrzeug aktualisieren
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: vehicleInputSchema.partial(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, data } = input
      const { images, firstRegistration, ...vehicleData } = data

      // Prüfen ob Fahrzeug existiert
      const existing = await db.vehicle.findUnique({ where: { id } })
      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Fahrzeug nicht gefunden",
        })
      }

      // Bilder aktualisieren falls vorhanden
      if (images !== undefined) {
        // Alte Bilder löschen
        await db.vehicleImage.deleteMany({ where: { vehicleId: id } })
        // Neue Bilder hinzufügen
        if (images.length > 0) {
          await db.vehicleImage.createMany({
            data: images.map((img, index) => ({
              vehicleId: id,
              url: img.url,
              order: img.order ?? index,
            })),
          })
        }
      }

      const vehicle = await db.vehicle.update({
        where: { id },
        data: {
          ...vehicleData,
          firstRegistration: firstRegistration ? new Date(firstRegistration) : undefined,
        },
        include: {
          images: {
            orderBy: { order: "asc" },
          },
        },
      })

      return vehicle
    }),

  // Fahrzeug löschen (nur Admin)
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const existing = await db.vehicle.findUnique({ where: { id: input.id } })
      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Fahrzeug nicht gefunden",
        })
      }

      await db.vehicle.delete({ where: { id: input.id } })
      return { success: true }
    }),

  // Status ändern
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["ENTWURF", "AKTIV", "RESERVIERT", "VERKAUFT"]),
      })
    )
    .mutation(async ({ input }) => {
      const vehicle = await db.vehicle.update({
        where: { id: input.id },
        data: { status: input.status },
      })
      return vehicle
    }),

  // Statistiken für Dashboard
  getStats: protectedProcedure.query(async () => {
    const [total, active, reserved, sold, thisWeek] = await Promise.all([
      db.vehicle.count(),
      db.vehicle.count({ where: { status: "AKTIV" } }),
      db.vehicle.count({ where: { status: "RESERVIERT" } }),
      db.vehicle.count({ where: { status: "VERKAUFT" } }),
      db.vehicle.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ])

    const totalValue = await db.vehicle.aggregate({
      where: { status: "AKTIV" },
      _sum: { sellingPrice: true },
    })

    return {
      total,
      active,
      reserved,
      sold,
      thisWeek,
      totalValue: totalValue._sum.sellingPrice || 0,
    }
  }),
})

