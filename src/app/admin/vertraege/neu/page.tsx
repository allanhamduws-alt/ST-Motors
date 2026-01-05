"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { trpc } from "@/lib/trpc"
import { toast } from "sonner"
import { ArrowLeft, Search, Car, User } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function NeuerVertragPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedCustomerId = searchParams.get("kunde")
  const utils = trpc.useUtils()

  const [formData, setFormData] = useState({
    type: "KAUFVERTRAG" as "KAUFVERTRAG" | "ANKAUFVERTRAG",
    customerId: preselectedCustomerId || "",
    vehicleId: "",
    priceNet: 0,
    vat: 0,
    priceGross: 0,
    deposit: 0,
    status: "ENTWURF" as "ENTWURF" | "AKTIV",
    isAccidentFree: true,
    reducedLiability: false,
    hasWarranty: false,
    notes: "",
  })

  const [customerSearch, setCustomerSearch] = useState("")
  const [vehicleSearch, setVehicleSearch] = useState("")

  // Kunden suchen
  const { data: customersData } = trpc.customer.list.useQuery({
    page: 1,
    limit: 10,
    search: customerSearch || undefined,
  })

  // Fahrzeuge suchen (nur aktive)
  const { data: vehiclesData } = trpc.vehicle.list.useQuery({
    page: 1,
    limit: 10,
    search: vehicleSearch || undefined,
    status: "AKTIV",
  })

  // Vorausgewählter Kunde laden
  const { data: preselectedCustomer } = trpc.customer.getById.useQuery(
    { id: preselectedCustomerId! },
    { enabled: !!preselectedCustomerId }
  )

  const createMutation = trpc.contract.create.useMutation({
    onSuccess: (contract) => {
      toast.success("Vertrag erfolgreich erstellt")
      utils.contract.list.invalidate()
      utils.contract.getStats.invalidate()
      router.push(`/admin/vertraege/${contract.id}`)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  // Berechnung Brutto/Netto
  const calculatePrices = (net: number, vatRate: number = 19) => {
    const vat = net * (vatRate / 100)
    const gross = net + vat
    setFormData((prev) => ({
      ...prev,
      priceNet: net,
      vat: Math.round(vat * 100) / 100,
      priceGross: Math.round(gross * 100) / 100,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.customerId) {
      toast.error("Bitte wählen Sie einen Kunden aus")
      return
    }
    if (!formData.vehicleId) {
      toast.error("Bitte wählen Sie ein Fahrzeug aus")
      return
    }
    if (formData.priceGross <= 0) {
      toast.error("Bitte geben Sie einen gültigen Preis ein")
      return
    }

    createMutation.mutate(formData)
  }

  const getCustomerName = (customer: { type: string; company?: string | null; firstName?: string | null; lastName: string }) => {
    if (customer.type === "GEWERBE" && customer.company) {
      return customer.company
    }
    return [customer.firstName, customer.lastName].filter(Boolean).join(" ")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/vertraege">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Neuer Vertrag</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Erstellen Sie einen Kauf- oder Ankaufvertrag
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Vertragstyp */}
        <Card>
          <CardHeader>
            <CardTitle>Vertragstyp</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div
                onClick={() => setFormData((prev) => ({ ...prev, type: "KAUFVERTRAG" }))}
                className={`cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                  formData.type === "KAUFVERTRAG"
                    ? "border-blue-500 bg-blue-50"
                    : "border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <p className="font-medium">Kaufvertrag</p>
                <p className="text-sm text-zinc-500">Fahrzeug an Kunde verkaufen</p>
              </div>
              <div
                onClick={() => setFormData((prev) => ({ ...prev, type: "ANKAUFVERTRAG" }))}
                className={`cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                  formData.type === "ANKAUFVERTRAG"
                    ? "border-orange-500 bg-orange-50"
                    : "border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <p className="font-medium">Ankaufvertrag</p>
                <p className="text-sm text-zinc-500">Fahrzeug von Kunde ankaufen</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kunde */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Kunde
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {preselectedCustomer ? (
              <div className="rounded-lg border bg-zinc-50 p-4">
                <p className="font-medium">{getCustomerName(preselectedCustomer)}</p>
                <p className="text-sm text-zinc-500">
                  Kd.-Nr. {String(preselectedCustomer.customerNumber).padStart(5, "0")}
                </p>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="mt-2 p-0 h-auto"
                  onClick={() => setFormData((prev) => ({ ...prev, customerId: "" }))}
                >
                  Anderen Kunden wählen
                </Button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <Input
                    placeholder="Kunde suchen..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {customersData?.customers && customersData.customers.length > 0 && (
                  <div className="rounded-lg border max-h-48 overflow-y-auto">
                    {customersData.customers.map((customer) => (
                      <div
                        key={customer.id}
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, customerId: customer.id }))
                          setCustomerSearch(getCustomerName(customer))
                        }}
                        className={`cursor-pointer p-3 hover:bg-zinc-50 border-b last:border-b-0 ${
                          formData.customerId === customer.id ? "bg-blue-50" : ""
                        }`}
                      >
                        <p className="font-medium">{getCustomerName(customer)}</p>
                        <p className="text-sm text-zinc-500">
                          Kd.-Nr. {String(customer.customerNumber).padStart(5, "0")}
                          {customer.email && ` · ${customer.email}`}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                <Button type="button" variant="outline" asChild>
                  <Link href="/admin/kunden/neu">Neuen Kunden anlegen</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Fahrzeug */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Fahrzeug
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                placeholder="Fahrzeug suchen..."
                value={vehicleSearch}
                onChange={(e) => setVehicleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            {vehiclesData?.vehicles && vehiclesData.vehicles.length > 0 && (
              <div className="rounded-lg border max-h-48 overflow-y-auto">
                {vehiclesData.vehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, vehicleId: vehicle.id }))
                      setVehicleSearch(`${vehicle.manufacturer} ${vehicle.model}`)
                      // Preis vorausfüllen
                      calculatePrices(Number(vehicle.sellingPrice) / 1.19) // Brutto zu Netto
                    }}
                    className={`cursor-pointer p-3 hover:bg-zinc-50 border-b last:border-b-0 flex items-center gap-3 ${
                      formData.vehicleId === vehicle.id ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="h-12 w-16 flex-shrink-0 overflow-hidden rounded bg-zinc-100">
                      {vehicle.images[0] ? (
                        <img
                          src={vehicle.images[0].url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Car className="h-5 w-5 text-zinc-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{vehicle.manufacturer} {vehicle.model}</p>
                      <p className="text-sm text-zinc-500">
                        Fzg.-Nr. {vehicle.vehicleNumber} · {Number(vehicle.sellingPrice).toLocaleString("de-DE", {
                          style: "currency",
                          currency: "EUR",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preise */}
        <Card>
          <CardHeader>
            <CardTitle>Preise</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="priceNet">Netto (€)</Label>
                <Input
                  id="priceNet"
                  type="number"
                  step="0.01"
                  value={formData.priceNet || ""}
                  onChange={(e) => calculatePrices(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vat">MwSt. (€)</Label>
                <Input
                  id="vat"
                  type="number"
                  step="0.01"
                  value={formData.vat || ""}
                  disabled
                  className="bg-zinc-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priceGross">Brutto (€)</Label>
                <Input
                  id="priceGross"
                  type="number"
                  step="0.01"
                  value={formData.priceGross || ""}
                  disabled
                  className="bg-zinc-50 font-bold"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deposit">Anzahlung (€)</Label>
              <Input
                id="deposit"
                type="number"
                step="0.01"
                value={formData.deposit || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, deposit: parseFloat(e.target.value) || 0 }))}
                className="max-w-xs"
              />
            </div>
          </CardContent>
        </Card>

        {/* Optionen */}
        <Card>
          <CardHeader>
            <CardTitle>Vertragsbedingungen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isAccidentFree"
                checked={formData.isAccidentFree}
                onChange={(e) => setFormData((prev) => ({ ...prev, isAccidentFree: e.target.checked }))}
                className="h-4 w-4 rounded border-zinc-300"
              />
              <Label htmlFor="isAccidentFree">Fahrzeug ist unfallfrei</Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="reducedLiability"
                checked={formData.reducedLiability}
                onChange={(e) => setFormData((prev) => ({ ...prev, reducedLiability: e.target.checked }))}
                className="h-4 w-4 rounded border-zinc-300"
              />
              <Label htmlFor="reducedLiability">Gewährleistungsausschluss (Differenzbesteuerung)</Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="hasWarranty"
                checked={formData.hasWarranty}
                onChange={(e) => setFormData((prev) => ({ ...prev, hasWarranty: e.target.checked }))}
                className="h-4 w-4 rounded border-zinc-300"
              />
              <Label htmlFor="hasWarranty">Zusätzliche Garantie</Label>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value as "ENTWURF" | "AKTIV" }))}
            >
              <SelectTrigger className="max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ENTWURF">Entwurf</SelectItem>
                <SelectItem value="AKTIV">Aktiv (Fahrzeug reservieren)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-zinc-500 mt-2">
              Bei Status "Aktiv" wird das Fahrzeug automatisch auf "Reserviert" gesetzt.
            </p>
          </CardContent>
        </Card>

        {/* Notizen */}
        <Card>
          <CardHeader>
            <CardTitle>Notizen</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              rows={4}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Interne Notizen zum Vertrag..."
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/vertraege">Abbrechen</Link>
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Wird erstellt..." : "Vertrag erstellen"}
          </Button>
        </div>
      </form>
    </div>
  )
}

