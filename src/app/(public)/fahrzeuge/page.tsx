import { Suspense } from "react"
import Link from "next/link"
import { Car, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VehicleCard } from "@/components/vehicles/VehicleCard"
import { VehicleFilterPublic } from "@/components/vehicles/VehicleFilterPublic"
import { SortSelect } from "@/components/vehicles/SortSelect"
import { db } from "@/lib/db"
import { Prisma } from "@prisma/client"

// Force dynamic rendering - don't try to build statically
export const dynamic = 'force-dynamic'

interface SearchParams {
  hersteller?: string
  typ?: string
  kraftstoff?: string
  getriebe?: string
  preisMin?: string
  preisMax?: string
  kmMax?: string
  sort?: string
}

async function getVehicles(searchParams: SearchParams) {
  const where: Prisma.VehicleWhereInput = {
    status: "AKTIV",
  }

  if (searchParams.hersteller) {
    where.manufacturer = {
      contains: searchParams.hersteller,
      mode: "insensitive",
    }
  }

  if (searchParams.typ) {
    where.vehicleType = searchParams.typ as Prisma.EnumVehicleTypeFilter<"Vehicle">["equals"]
  }

  if (searchParams.kraftstoff) {
    where.fuelType = searchParams.kraftstoff as Prisma.EnumFuelTypeNullableFilter<"Vehicle">["equals"]
  }

  if (searchParams.getriebe) {
    where.transmission = searchParams.getriebe as Prisma.EnumTransmissionNullableFilter<"Vehicle">["equals"]
  }

  if (searchParams.preisMin || searchParams.preisMax) {
    where.sellingPrice = {}
    if (searchParams.preisMin) {
      where.sellingPrice.gte = parseFloat(searchParams.preisMin)
    }
    if (searchParams.preisMax) {
      where.sellingPrice.lte = parseFloat(searchParams.preisMax)
    }
  }

  if (searchParams.kmMax) {
    where.mileage = {
      lte: parseInt(searchParams.kmMax),
    }
  }

  let orderBy: Prisma.VehicleOrderByWithRelationInput = { createdAt: "desc" }

  switch (searchParams.sort) {
    case "price-asc":
      orderBy = { sellingPrice: "asc" }
      break
    case "price-desc":
      orderBy = { sellingPrice: "desc" }
      break
    case "km-asc":
      orderBy = { mileage: "asc" }
      break
    case "newest":
    default:
      orderBy = { createdAt: "desc" }
  }

  try {
    const vehicles = await db.vehicle.findMany({
      where,
      include: {
        images: true,
      },
      orderBy,
    })
    return vehicles
  } catch {
    return []
  }
}

async function getFilterOptions() {
  try {
    const [manufacturers, vehicleTypes, fuelTypes] = await Promise.all([
      db.vehicle.findMany({
        where: { status: "AKTIV" },
        select: { manufacturer: true },
        distinct: ["manufacturer"],
      }),
      db.vehicle.findMany({
        where: { status: "AKTIV" },
        select: { vehicleType: true },
        distinct: ["vehicleType"],
      }),
      db.vehicle.findMany({
        where: { status: "AKTIV", fuelType: { not: null } },
        select: { fuelType: true },
        distinct: ["fuelType"],
      }),
    ])

    return {
      manufacturers: manufacturers.map((m) => m.manufacturer),
      vehicleTypes: vehicleTypes.map((v) => v.vehicleType),
      fuelTypes: fuelTypes.map((f) => f.fuelType).filter(Boolean) as string[],
    }
  } catch {
    return {
      manufacturers: [],
      vehicleTypes: [],
      fuelTypes: [],
    }
  }
}

export const metadata = {
  title: "Fahrzeuge",
  description:
    "Entdecken Sie unsere Auswahl an Premium SUVs und Limousinen. Range Rover, Mercedes, BMW, Audi und mehr.",
}

export default async function FahrzeugePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const [vehicles, filterOptions] = await Promise.all([
    getVehicles(params),
    getFilterOptions(),
  ])

  const hasActiveFilters = Object.values(params).some(
    (v) => v !== undefined && v !== ""
  )

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Hero Section */}
      <section className="bg-white py-12 border-b">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Unsere Fahrzeuge
            </h1>
            <p className="text-lg text-muted-foreground">
              Entdecken Sie unsere handverlesene Auswahl an Premium SUVs und
              Limousinen. Alle Fahrzeuge sind geprüft und sofort verfügbar.
            </p>
          </div>
        </div>
      </section>

      <div className="container-custom py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter Sidebar */}
          <aside className="lg:w-72 shrink-0">
            <div className="lg:sticky lg:top-24">
              <Suspense fallback={<div className="animate-pulse h-96 bg-white rounded-xl" />}>
                <VehicleFilterPublic
                  filterOptions={filterOptions}
                  currentFilters={params}
                />
              </Suspense>
            </div>
          </aside>

          {/* Vehicle Grid */}
          <main className="flex-1">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">
                  {vehicles.length} Fahrzeug{vehicles.length !== 1 ? "e" : ""}{" "}
                  gefunden
                </span>
                {hasActiveFilters && (
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/fahrzeuge">Filter zurücksetzen</Link>
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                <SortSelect defaultValue={params.sort || "newest"} />
              </div>
            </div>

            {/* Vehicle Grid */}
            {vehicles.length > 0 ? (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {vehicles.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl">
                <Car className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="font-display text-xl font-semibold mb-2">
                  Keine Fahrzeuge gefunden
                </h3>
                <p className="text-muted-foreground mb-6">
                  {hasActiveFilters
                    ? "Versuchen Sie andere Filterkriterien."
                    : "Aktuell sind keine Fahrzeuge verfügbar."}
                </p>
                {hasActiveFilters && (
                  <Button asChild>
                    <Link href="/fahrzeuge">Filter zurücksetzen</Link>
                  </Button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

