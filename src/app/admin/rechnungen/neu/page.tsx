"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { trpc } from "@/lib/trpc"
import { toast } from "sonner"
import { ArrowLeft, Search, Plus, Trash2, User } from "lucide-react"
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

interface InvoicePosition {
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export default function NeueRechnungPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedCustomerId = searchParams.get("kunde")
  const utils = trpc.useUtils()

  const [formData, setFormData] = useState({
    customerId: preselectedCustomerId || "",
    contractId: "",
    status: "ENTWURF" as "ENTWURF" | "OFFEN",
  })

  const [positions, setPositions] = useState<InvoicePosition[]>([
    { description: "", quantity: 1, unitPrice: 0, total: 0 },
  ])

  const [customerSearch, setCustomerSearch] = useState("")

  // Kunden suchen
  const { data: customersData } = trpc.customer.list.useQuery({
    page: 1,
    limit: 10,
    search: customerSearch || undefined,
  })

  // Vorausgewählter Kunde laden
  const { data: preselectedCustomer } = trpc.customer.getById.useQuery(
    { id: preselectedCustomerId! },
    { enabled: !!preselectedCustomerId }
  )

  const createMutation = trpc.invoice.create.useMutation({
    onSuccess: (invoice) => {
      toast.success("Rechnung erfolgreich erstellt")
      utils.invoice.list.invalidate()
      utils.invoice.getStats.invalidate()
      router.push(`/admin/rechnungen/${invoice.id}`)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  // Position aktualisieren
  const updatePosition = (index: number, field: keyof InvoicePosition, value: string | number) => {
    setPositions((prev) => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        [field]: value,
      }
      // Total berechnen
      if (field === "quantity" || field === "unitPrice") {
        updated[index].total = updated[index].quantity * updated[index].unitPrice
      }
      return updated
    })
  }

  // Position hinzufügen
  const addPosition = () => {
    setPositions((prev) => [
      ...prev,
      { description: "", quantity: 1, unitPrice: 0, total: 0 },
    ])
  }

  // Position entfernen
  const removePosition = (index: number) => {
    if (positions.length > 1) {
      setPositions((prev) => prev.filter((_, i) => i !== index))
    }
  }

  // Summen berechnen
  const netAmount = positions.reduce((sum, pos) => sum + pos.total, 0)
  const vatAmount = netAmount * 0.19
  const grossAmount = netAmount + vatAmount

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.customerId) {
      toast.error("Bitte wählen Sie einen Kunden aus")
      return
    }

    const validPositions = positions.filter((pos) => pos.description && pos.total > 0)
    if (validPositions.length === 0) {
      toast.error("Bitte fügen Sie mindestens eine Position hinzu")
      return
    }

    createMutation.mutate({
      ...formData,
      contractId: formData.contractId || undefined,
      netAmount: Math.round(netAmount * 100) / 100,
      vatAmount: Math.round(vatAmount * 100) / 100,
      grossAmount: Math.round(grossAmount * 100) / 100,
      positions: validPositions,
    })
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
          <Link href="/admin/rechnungen">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Neue Rechnung</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Erstellen Sie eine neue Rechnung
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Kunde */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Rechnungsempfänger
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {preselectedCustomer ? (
              <div className="rounded-lg border bg-zinc-50 p-4">
                <p className="font-medium">{getCustomerName(preselectedCustomer)}</p>
                <p className="text-sm text-zinc-500">
                  Kd.-Nr. {String(preselectedCustomer.customerNumber).padStart(5, "0")}
                </p>
                {preselectedCustomer.street && (
                  <p className="text-sm text-zinc-500 mt-2">
                    {preselectedCustomer.street}<br />
                    {preselectedCustomer.zipCode} {preselectedCustomer.city}
                  </p>
                )}
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
              </>
            )}
          </CardContent>
        </Card>

        {/* Positionen */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Rechnungspositionen</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addPosition}>
              <Plus className="mr-2 h-4 w-4" />
              Position hinzufügen
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {positions.map((position, index) => (
              <div key={index} className="grid gap-4 md:grid-cols-12 items-end border-b pb-4">
                <div className="md:col-span-5 space-y-2">
                  <Label>Beschreibung</Label>
                  <Input
                    value={position.description}
                    onChange={(e) => updatePosition(index, "description", e.target.value)}
                    placeholder="z.B. Fahrzeugkauf BMW 320i"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Menge</Label>
                  <Input
                    type="number"
                    min="1"
                    value={position.quantity}
                    onChange={(e) => updatePosition(index, "quantity", parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Einzelpreis (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={position.unitPrice || ""}
                    onChange={(e) => updatePosition(index, "unitPrice", parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Gesamt (€)</Label>
                  <Input
                    type="number"
                    value={position.total.toFixed(2)}
                    disabled
                    className="bg-zinc-50 font-medium"
                  />
                </div>
                <div className="md:col-span-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removePosition(index)}
                    disabled={positions.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Summen */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Netto</span>
                <span>{netAmount.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">MwSt. (19%)</span>
                <span>{vatAmount.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Brutto</span>
                <span>{grossAmount.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}</span>
              </div>
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
              onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value as "ENTWURF" | "OFFEN" }))}
            >
              <SelectTrigger className="max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ENTWURF">Entwurf</SelectItem>
                <SelectItem value="OFFEN">Offen (Rechnung gestellt)</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/rechnungen">Abbrechen</Link>
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Wird erstellt..." : "Rechnung erstellen"}
          </Button>
        </div>
      </form>
    </div>
  )
}

