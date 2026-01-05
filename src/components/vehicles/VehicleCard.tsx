"use client"

import Image from "next/image"
import Link from "next/link"
import { Calendar, Gauge, Fuel, Cog, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

interface VehicleCardProps {
  vehicle: {
    id: string
    slug: string
    manufacturer: string
    model: string
    variant?: string | null
    title?: string | null
    sellingPrice: number | string
    firstRegistration?: Date | string | null
    mileage: number
    fuelType?: string | null
    transmission?: string | null
    powerPS?: number | null
    status: string
    vatType: string
    images: { url: string; order: number }[]
  }
}

const fuelTypeLabels: Record<string, string> = {
  BENZIN: "Benzin",
  DIESEL: "Diesel",
  ELEKTRO: "Elektro",
  HYBRID: "Hybrid",
  LPG: "LPG",
}

const transmissionLabels: Record<string, string> = {
  AUTOMATIK: "Automatik",
  MANUELL: "Schaltgetriebe",
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const mainImage = vehicle.images.sort((a, b) => a.order - b.order)[0]?.url
  const price = typeof vehicle.sellingPrice === "string" 
    ? parseFloat(vehicle.sellingPrice) 
    : vehicle.sellingPrice

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatMileage = (km: number) => {
    return new Intl.NumberFormat("de-DE").format(km) + " km"
  }

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return null
    const d = new Date(date)
    return `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
  }

  const vehicleTitle =
    vehicle.title || `${vehicle.manufacturer} ${vehicle.model}`

  return (
    <Link href={`/fahrzeuge/${vehicle.slug}`}>
      <Card className="group vehicle-card-premium overflow-hidden border-0 shadow-md hover:shadow-2xl bg-white rounded-2xl">
        {/* Image Container with Premium Hover Effect */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {/* Background gradient that shows on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 transition-opacity duration-500" />
          
          {/* Animated background pattern on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.05)_0%,transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(255,255,255,0.03)_0%,transparent_50%)]" />
          </div>
          
          {mainImage ? (
            <div className="relative w-full h-full">
              <Image
                src={mainImage}
                alt={vehicleTitle}
                fill
                className="object-cover relative z-10 transition-all duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-zinc-500">
                <svg
                  className="w-20 h-20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          )}

          {/* Status Badge */}
          {vehicle.status === "RESERVIERT" && (
            <Badge className="absolute top-3 left-3 z-20 bg-amber-500 hover:bg-amber-500 text-white shadow-lg">
              Reserviert
            </Badge>
          )}

          {/* MwSt Badge */}
          <Badge
            variant="secondary"
            className="absolute top-3 right-3 z-20 bg-white/95 text-foreground hover:bg-white/95 shadow-lg backdrop-blur-sm"
          >
            {vehicle.vatType === "MWST" ? "MwSt. ausweisbar" : "Differenzbesteuert"}
          </Badge>
          
          {/* Hover overlay with "Details" button hint */}
          <div className="absolute inset-0 z-10 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="px-4 py-2 bg-white/95 backdrop-blur-sm rounded-full text-sm font-medium text-zinc-800 shadow-lg flex items-center gap-2">
              Details ansehen
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-5">
          {/* Title */}
          <div className="mb-3">
            <h3 className="font-display font-semibold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1">
              {vehicleTitle}
            </h3>
            {vehicle.variant && (
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                {vehicle.variant}
              </p>
            )}
          </div>

          {/* Specs Grid */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {vehicle.firstRegistration && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span>{formatDate(vehicle.firstRegistration)}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Gauge className="h-4 w-4 flex-shrink-0" />
              <span>{formatMileage(vehicle.mileage)}</span>
            </div>
            {vehicle.fuelType && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Fuel className="h-4 w-4 flex-shrink-0" />
                <span>{fuelTypeLabels[vehicle.fuelType] || vehicle.fuelType}</span>
              </div>
            )}
            {vehicle.transmission && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Cog className="h-4 w-4 flex-shrink-0" />
                <span>{transmissionLabels[vehicle.transmission] || vehicle.transmission}</span>
              </div>
            )}
          </div>

          {/* Price & Power */}
          <div className="flex items-end justify-between pt-3 border-t">
            <div>
              <div className="text-2xl font-display font-bold text-primary">
                {formatPrice(price)}
              </div>
            </div>
            {vehicle.powerPS && (
              <div className="text-right">
                <div className="text-sm font-medium">{vehicle.powerPS} PS</div>
                <div className="text-xs text-muted-foreground">
                  {Math.round(vehicle.powerPS * 0.7355)} kW
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

