"use client"

import { useParams, useRouter } from "next/navigation"
import { CustomerForm } from "@/components/customers/CustomerForm"
import { trpc } from "@/lib/trpc"
import { toast } from "sonner"
import { ArrowLeft, FileText, Receipt } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const contractStatusLabels = {
  ENTWURF: "Entwurf",
  AKTIV: "Aktiv",
  ABGESCHLOSSEN: "Abgeschlossen",
  STORNIERT: "Storniert",
}

const contractStatusColors = {
  ENTWURF: "bg-zinc-100 text-zinc-800",
  AKTIV: "bg-blue-100 text-blue-800",
  ABGESCHLOSSEN: "bg-green-100 text-green-800",
  STORNIERT: "bg-red-100 text-red-800",
}

const invoiceStatusLabels = {
  ENTWURF: "Entwurf",
  OFFEN: "Offen",
  BEZAHLT: "Bezahlt",
  STORNIERT: "Storniert",
}

const invoiceStatusColors = {
  ENTWURF: "bg-zinc-100 text-zinc-800",
  OFFEN: "bg-yellow-100 text-yellow-800",
  BEZAHLT: "bg-green-100 text-green-800",
  STORNIERT: "bg-red-100 text-red-800",
}

export default function KundeBearbeitenPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const utils = trpc.useUtils()

  const { data: customer, isLoading } = trpc.customer.getById.useQuery({ id })

  const updateMutation = trpc.customer.update.useMutation({
    onSuccess: () => {
      toast.success("Kunde erfolgreich aktualisiert")
      utils.customer.getById.invalidate({ id })
      utils.customer.list.invalidate()
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

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-zinc-500 mb-4">Kunde nicht gefunden</p>
        <Button asChild>
          <Link href="/admin/kunden">Zurück zur Übersicht</Link>
        </Button>
      </div>
    )
  }

  const customerName = customer.type === "GEWERBE" && customer.company
    ? customer.company
    : [customer.firstName, customer.lastName].filter(Boolean).join(" ")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/kunden">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-zinc-900">{customerName}</h1>
            <Badge variant="outline">
              Kd.-Nr. {String(customer.customerNumber).padStart(5, "0")}
            </Badge>
          </div>
          <p className="text-sm text-zinc-500 mt-1">
            {customer._count.contracts} Verträge · {customer._count.invoices} Rechnungen
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/vertraege/neu?kunde=${customer.id}`}>
              <FileText className="mr-2 h-4 w-4" />
              Neuer Vertrag
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/admin/rechnungen/neu?kunde=${customer.id}`}>
              <Receipt className="mr-2 h-4 w-4" />
              Neue Rechnung
            </Link>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Stammdaten</TabsTrigger>
          <TabsTrigger value="contracts">
            Verträge ({customer._count.contracts})
          </TabsTrigger>
          <TabsTrigger value="invoices">
            Rechnungen ({customer._count.invoices})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6">
          <div className="rounded-xl border bg-white p-6">
            <CustomerForm
              defaultValues={{
                type: customer.type,
                role: customer.role,
                company: customer.company || "",
                salutation: customer.salutation || "",
                firstName: customer.firstName || "",
                lastName: customer.lastName,
                street: customer.street || "",
                zipCode: customer.zipCode || "",
                city: customer.city || "",
                country: customer.country,
                phone: customer.phone || "",
                email: customer.email || "",
                notes: customer.notes || "",
              }}
              onSubmit={(data) => updateMutation.mutate({ id, data })}
              isLoading={updateMutation.isPending}
              isEdit
            />
          </div>
        </TabsContent>

        <TabsContent value="contracts" className="mt-6">
          <div className="rounded-xl border bg-white">
            {customer.contracts.length === 0 ? (
              <div className="py-12 text-center text-zinc-500">
                Keine Verträge vorhanden
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vertrag-Nr.</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead>Fahrzeug</TableHead>
                    <TableHead>Betrag</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customer.contracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-mono">
                        {String(contract.contractNumber).padStart(5, "0")}
                      </TableCell>
                      <TableCell>
                        {contract.type === "KAUFVERTRAG" ? "Kaufvertrag" : "Ankaufvertrag"}
                      </TableCell>
                      <TableCell>
                        {contract.vehicle.manufacturer} {contract.vehicle.model}
                      </TableCell>
                      <TableCell>
                        {Number(contract.priceGross).toLocaleString("de-DE", {
                          style: "currency",
                          currency: "EUR",
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge className={contractStatusColors[contract.status]}>
                          {contractStatusLabels[contract.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(contract.contractDate).toLocaleDateString("de-DE")}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/vertraege/${contract.id}`}>
                            Öffnen
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="mt-6">
          <div className="rounded-xl border bg-white">
            {customer.invoices.length === 0 ? (
              <div className="py-12 text-center text-zinc-500">
                Keine Rechnungen vorhanden
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rechnungs-Nr.</TableHead>
                    <TableHead>Betrag</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customer.invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono">
                        {invoice.invoiceNumber}
                      </TableCell>
                      <TableCell>
                        {Number(invoice.grossAmount).toLocaleString("de-DE", {
                          style: "currency",
                          currency: "EUR",
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge className={invoiceStatusColors[invoice.status]}>
                          {invoiceStatusLabels[invoice.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(invoice.invoiceDate).toLocaleDateString("de-DE")}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/rechnungen/${invoice.id}`}>
                            Öffnen
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

