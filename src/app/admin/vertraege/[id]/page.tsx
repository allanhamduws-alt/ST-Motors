"use client"

import { useParams } from "next/navigation"
import { trpc } from "@/lib/trpc"
import { toast } from "sonner"
import { ArrowLeft, Car, User, FileText, Receipt, Calendar, Euro, Download, Loader2 } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const typeLabels = {
  KAUFVERTRAG: "Kaufvertrag",
  ANKAUFVERTRAG: "Ankaufvertrag",
}

const statusLabels = {
  ENTWURF: "Entwurf",
  AKTIV: "Aktiv",
  ABGESCHLOSSEN: "Abgeschlossen",
  STORNIERT: "Storniert",
}

const statusColors = {
  ENTWURF: "bg-zinc-100 text-zinc-800",
  AKTIV: "bg-blue-100 text-blue-800",
  ABGESCHLOSSEN: "bg-green-100 text-green-800",
  STORNIERT: "bg-red-100 text-red-800",
}

export default function VertragDetailPage() {
  const params = useParams()
  const id = params.id as string
  const utils = trpc.useUtils()
  const [isDownloading, setIsDownloading] = useState(false)

  // PDF Download Handler
  const handlePdfDownload = async () => {
    setIsDownloading(true)
    try {
      const response = await fetch(`/api/export/pdf/contract/${id}`)
      if (!response.ok) throw new Error("Download fehlgeschlagen")
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = response.headers.get("Content-Disposition")?.split("filename=")[1]?.replace(/"/g, "") || `vertrag-${id}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch {
      toast.error("PDF-Download fehlgeschlagen")
    } finally {
      setIsDownloading(false)
    }
  }

  const { data: contract, isLoading } = trpc.contract.getById.useQuery({ id })

  const updateMutation = trpc.contract.update.useMutation({
    onSuccess: () => {
      toast.success("Status aktualisiert")
      utils.contract.getById.invalidate({ id })
      utils.contract.list.invalidate()
      utils.contract.getStats.invalidate()
      utils.vehicle.list.invalidate()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const handleStatusChange = (status: string) => {
    updateMutation.mutate({
      id,
      data: { status: status as "ENTWURF" | "AKTIV" | "ABGESCHLOSSEN" | "STORNIERT" },
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-zinc-500">Laden...</p>
      </div>
    )
  }

  if (!contract) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-zinc-500 mb-4">Vertrag nicht gefunden</p>
        <Button asChild>
          <Link href="/admin/vertraege">Zurück zur Übersicht</Link>
        </Button>
      </div>
    )
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
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-zinc-900">
              V-{String(contract.contractNumber).padStart(5, "0")}
            </h1>
            <Badge variant="outline">{typeLabels[contract.type]}</Badge>
            <Badge className={statusColors[contract.status]}>
              {statusLabels[contract.status]}
            </Badge>
          </div>
          <p className="text-sm text-zinc-500 mt-1">
            Erstellt am {new Date(contract.createdAt).toLocaleDateString("de-DE")} von {contract.createdBy.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePdfDownload} disabled={isDownloading}>
            {isDownloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            PDF Download
          </Button>
          {contract.status !== "ABGESCHLOSSEN" && contract.status !== "STORNIERT" && (
            <Button variant="outline" asChild>
              <Link href={`/admin/rechnungen/neu?vertrag=${contract.id}&kunde=${contract.customer.id}`}>
                <Receipt className="mr-2 h-4 w-4" />
                Rechnung erstellen
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Hauptinfo */}
        <div className="lg:col-span-2 space-y-6">
          {/* Kunde */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Kunde
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                href={`/admin/kunden/${contract.customer.id}`}
                className="block rounded-lg border p-4 hover:bg-zinc-50 transition-colors"
              >
                <p className="font-medium text-lg">{getCustomerName(contract.customer)}</p>
                <p className="text-sm text-zinc-500">
                  Kd.-Nr. {String(contract.customer.customerNumber).padStart(5, "0")}
                </p>
                {contract.customer.street && (
                  <p className="text-sm text-zinc-500 mt-2">
                    {contract.customer.street}<br />
                    {contract.customer.zipCode} {contract.customer.city}
                  </p>
                )}
                {contract.customer.email && (
                  <p className="text-sm text-zinc-500 mt-1">{contract.customer.email}</p>
                )}
              </Link>
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
            <CardContent>
              <Link
                href={`/admin/fahrzeuge/${contract.vehicle.id}`}
                className="flex items-center gap-4 rounded-lg border p-4 hover:bg-zinc-50 transition-colors"
              >
                <div className="h-20 w-28 flex-shrink-0 overflow-hidden rounded bg-zinc-100">
                  {contract.vehicle.images[0] ? (
                    <img
                      src={contract.vehicle.images[0].url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Car className="h-8 w-8 text-zinc-300" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-lg">
                    {contract.vehicle.manufacturer} {contract.vehicle.model}
                  </p>
                  <p className="text-sm text-zinc-500">
                    Fzg.-Nr. {contract.vehicle.vehicleNumber}
                  </p>
                  {contract.vehicle.vin && (
                    <p className="text-xs text-zinc-400 font-mono mt-1">
                      VIN: {contract.vehicle.vin}
                    </p>
                  )}
                </div>
              </Link>
            </CardContent>
          </Card>

          {/* Vertragsbedingungen */}
          <Card>
            <CardHeader>
              <CardTitle>Vertragsbedingungen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${contract.isAccidentFree ? "bg-green-500" : "bg-red-500"}`} />
                <span>{contract.isAccidentFree ? "Unfallfrei" : "Nicht unfallfrei"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${contract.reducedLiability ? "bg-orange-500" : "bg-zinc-300"}`} />
                <span>
                  {contract.reducedLiability
                    ? "Mit Gewährleistungsausschluss"
                    : "Ohne Gewährleistungsausschluss"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${contract.hasWarranty ? "bg-green-500" : "bg-zinc-300"}`} />
                <span>{contract.hasWarranty ? "Mit Garantie" : "Ohne Garantie"}</span>
              </div>
              {contract.notes && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-zinc-500">Notizen:</p>
                  <p className="text-sm mt-1">{contract.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rechnungen */}
          {contract.invoices.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Zugehörige Rechnungen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {contract.invoices.map((invoice) => (
                    <Link
                      key={invoice.id}
                      href={`/admin/rechnungen/${invoice.id}`}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-zinc-50"
                    >
                      <div>
                        <p className="font-mono font-medium">{invoice.invoiceNumber}</p>
                        <p className="text-sm text-zinc-500">
                          {new Date(invoice.invoiceDate).toLocaleDateString("de-DE")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {Number(invoice.grossAmount).toLocaleString("de-DE", {
                            style: "currency",
                            currency: "EUR",
                          })}
                        </p>
                        <Badge
                          className={
                            invoice.status === "BEZAHLT"
                              ? "bg-green-100 text-green-800"
                              : invoice.status === "OFFEN"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-zinc-100 text-zinc-800"
                          }
                        >
                          {invoice.status === "BEZAHLT"
                            ? "Bezahlt"
                            : invoice.status === "OFFEN"
                            ? "Offen"
                            : invoice.status}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Preise */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="h-5 w-5" />
                Preise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-zinc-500">Netto</span>
                <span>
                  {Number(contract.priceNet).toLocaleString("de-DE", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">MwSt.</span>
                <span>
                  {Number(contract.vat).toLocaleString("de-DE", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-3">
                <span>Brutto</span>
                <span>
                  {Number(contract.priceGross).toLocaleString("de-DE", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </span>
              </div>
              {Number(contract.deposit) > 0 && (
                <div className="flex justify-between text-sm border-t pt-3">
                  <span className="text-zinc-500">Anzahlung</span>
                  <span>
                    {Number(contract.deposit).toLocaleString("de-DE", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Termine */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Termine
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-zinc-500">Vertragsdatum</span>
                <span>{new Date(contract.contractDate).toLocaleDateString("de-DE")}</span>
              </div>
              {contract.deliveryDate && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Übergabe</span>
                  <span>{new Date(contract.deliveryDate).toLocaleDateString("de-DE")}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status ändern */}
          <Card>
            <CardHeader>
              <CardTitle>Status ändern</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={contract.status}
                onValueChange={handleStatusChange}
                disabled={updateMutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ENTWURF">Entwurf</SelectItem>
                  <SelectItem value="AKTIV">Aktiv</SelectItem>
                  <SelectItem value="ABGESCHLOSSEN">Abgeschlossen</SelectItem>
                  <SelectItem value="STORNIERT">Storniert</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-zinc-500 mt-2">
                {contract.type === "KAUFVERTRAG" && (
                  <>
                    "Abgeschlossen" setzt das Fahrzeug auf "Verkauft".
                    <br />
                    "Storniert" setzt es zurück auf "Aktiv".
                  </>
                )}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

