import { VehicleForm } from "@/components/vehicles/VehicleForm"

export const metadata = {
  title: "Neues Fahrzeug",
}

export default function NewVehiclePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Neues Fahrzeug</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Fügen Sie ein neues Fahrzeug zum Bestand hinzu
        </p>
      </div>
      <VehicleForm />
    </div>
  )
}

