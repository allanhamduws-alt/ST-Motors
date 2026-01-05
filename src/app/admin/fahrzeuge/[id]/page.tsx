"use client"

import { useParams } from "next/navigation"
import { VehicleForm } from "@/components/vehicles/VehicleForm"
import { trpc } from "@/lib/trpc"
import { Loader2 } from "lucide-react"

export default function EditVehiclePage() {
  const params = useParams()
  const id = params.id as string

  const { data: vehicle, isLoading, error } = trpc.vehicle.getById.useQuery({ id })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  if (error || !vehicle) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-red-500">
          {error?.message || "Fahrzeug nicht gefunden"}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Fahrzeug bearbeiten</h1>
        <p className="mt-1 text-sm text-zinc-500">
          #{vehicle.vehicleNumber} • {vehicle.manufacturer} {vehicle.model}
        </p>
      </div>
      <VehicleForm vehicle={vehicle} />
    </div>
  )
}

