"use client"

import { useParams } from "next/navigation"
import { trpc } from "@/lib/trpc"
import { toast } from "sonner"
import { ArrowLeft, User, FileText, Calendar, Euro, CheckCircle, Printer, Download, Loader2 } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table"

const statusLabels = {
  ENTWURF: "Entwurf",
  OFFEN: "Offen",
  BEZAHLT: "Bezahlt",
  STORNIERT: "Storniert",
}

const statusColors = {
  ENTWURF: "bg-zinc-100 text-zinc-800",
  OFFEN: "bg-yellow-100 text-yellow-800",
  BEZAHLT: "bg-green-100 text-green-800",
  STORNIERT: "bg-red-100 text-red-800",
}

export default function RechnungDetailPage() {
  const params = useParams()
  const id = params.id as string
  const utils = trpc.useUtils()
  const [isDownloading, setIsDownloading] = useState(false)

  // PDF Download Handler
  const handlePdfDownload = async () => {
    setIsDownloading(true)
    try {
      const response = await fetch(`/api/export/pdf/invoice/${id}`)
      if (!response.ok) throw new Error("Download fehlgeschlagen")
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = response.headers.get("Content-Disposition")?.split("filename=")[1]?.replace(/"/g, "") || `rechnung-${id}.pdf`
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

  const { data: invoice, isLoading } = trpc.invoice.getById.useQuery({ id })

  const markAsPaidMutation = trpc.invoice.markAsPaid.useMutation({
    onSuccess: () => {
      toast.success("Rechnung als bezahlt markiert")
      utils.invoice.getById.invalidate({ id })
      utils.invoice.list.invalidate()
      utils.invoice.getStats.invalidate()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-zinc-500">Laden...</p>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-zinc-500 mb-4">Rechnung nicht gefunden</p>
        <Button asChild>
          <Link href="/admin/rechnungen">Zurück zur Übersicht</Link>
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
          <Link href="/admin/rechnungen">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-zinc-900">{invoice.invoiceNumber}</h1>
            <Badge className={statusColors[invoice.status]}>
              {statusLabels[invoice.status]}
            </Badge>
          </div>
          <p className="text-sm text-zinc-500 mt-1">
            Erstellt am {new Date(invoice.createdAt).toLocaleDateString("de-DE")} von {invoice.createdBy.name}
          </p>
        </div>
        <div className="flex gap-2">
          {invoice.status === "OFFEN" && (
            <Button
              onClick={() => markAsPaidMutation.mutate({ id })}
              disabled={markAsPaidMutation.isPending}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Als bezahlt markieren
            </Button>
          )}
          <Button variant="outline" onClick={handlePdfDownload} disabled={isDownloading}>
            {isDownloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            PDF Download
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Drucken
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Hauptinhalt */}
        <div className="lg:col-span-2 space-y-6">
          {/* Rechnungsempfänger */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Rechnungsempfänger
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                href={`/admin/kunden/${invoice.customer.id}`}
                className="block rounded-lg border p-4 hover:bg-zinc-50 transition-colors"
              >
                <p className="font-medium text-lg">{getCustomerName(invoice.customer)}</p>
                <p className="text-sm text-zinc-500">
                  Kd.-Nr. {String(invoice.customer.customerNumber).padStart(5, "0")}
                </p>
                {invoice.customer.street && (
                  <p className="text-sm text-zinc-500 mt-2">
                    {invoice.customer.street}<br />
                    {invoice.customer.zipCode} {invoice.customer.city}
                  </p>
                )}
              </Link>
            </CardContent>
          </Card>

          {/* Positionen */}
          <Card>
            <CardHeader>
              <CardTitle>Rechnungspositionen</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50%]">Beschreibung</TableHead>
                    <TableHead className="text-right">Menge</TableHead>
                    <TableHead className="text-right">Einzelpreis</TableHead>
                    <TableHead className="text-right">Gesamt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.positions.map((position) => (
                    <TableRow key={position.id}>
                      <TableCell>{position.description}</TableCell>
                      <TableCell className="text-right">{position.quantity}</TableCell>
                      <TableCell className="text-right">
                        {Number(position.unitPrice).toLocaleString("de-DE", {
                          style: "currency",
                          currency: "EUR",
                        })}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {Number(position.total).toLocaleString("de-DE", {
                          style: "currency",
                          currency: "EUR",
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3} className="text-right">Netto</TableCell>
                    <TableCell className="text-right">
                      {Number(invoice.netAmount).toLocaleString("de-DE", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={3} className="text-right">MwSt. (19%)</TableCell>
                    <TableCell className="text-right">
                      {Number(invoice.vatAmount).toLocaleString("de-DE", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </TableCell>
                  </TableRow>
                  <TableRow className="font-bold text-lg">
                    <TableCell colSpan={3} className="text-right">Brutto</TableCell>
                    <TableCell className="text-right">
                      {Number(invoice.grossAmount).toLocaleString("de-DE", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>

          {/* Zugehöriger Vertrag */}
          {invoice.contract && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Zugehöriger Vertrag
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/admin/vertraege/${invoice.contract.id}`}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-zinc-50"
                >
                  <div>
                    <p className="font-medium">
                      V-{String(invoice.contract.contractNumber).padStart(5, "0")}
                    </p>
                    <p className="text-sm text-zinc-500">
                      {invoice.contract.type === "KAUFVERTRAG" ? "Kaufvertrag" : "Ankaufvertrag"}
                    </p>
                  </div>
                  {invoice.contract.vehicle && (
                    <p className="text-sm text-zinc-500">
                      {invoice.contract.vehicle.manufacturer} {invoice.contract.vehicle.model}
                    </p>
                  )}
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Summen */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="h-5 w-5" />
                Betrag
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-zinc-500">Netto</span>
                <span>
                  {Number(invoice.netAmount).toLocaleString("de-DE", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">MwSt.</span>
                <span>
                  {Number(invoice.vatAmount).toLocaleString("de-DE", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-3">
                <span>Brutto</span>
                <span>
                  {Number(invoice.grossAmount).toLocaleString("de-DE", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </span>
              </div>
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
                <span className="text-zinc-500">Rechnungsdatum</span>
                <span>{new Date(invoice.invoiceDate).toLocaleDateString("de-DE")}</span>
              </div>
              {invoice.dueDate && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Fällig bis</span>
                  <span>{new Date(invoice.dueDate).toLocaleDateString("de-DE")}</span>
                </div>
              )}
              {invoice.paidDate && (
                <div className="flex justify-between text-green-600">
                  <span>Bezahlt am</span>
                  <span>{new Date(invoice.paidDate).toLocaleDateString("de-DE")}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Info */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={`${statusColors[invoice.status]} text-sm px-3 py-1`}>
                {statusLabels[invoice.status]}
              </Badge>
              {invoice.status === "OFFEN" && (
                <p className="text-sm text-zinc-500 mt-3">
                  Warten Sie auf Zahlungseingang und markieren Sie die Rechnung dann als bezahlt.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

