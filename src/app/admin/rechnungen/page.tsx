"use client"

import { useState } from "react"
import Link from "next/link"
import { trpc } from "@/lib/trpc"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  Search,
  Receipt,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle,
  AlertCircle,
  Euro,
} from "lucide-react"
import { toast } from "sonner"

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

export default function RechnungenPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const utils = trpc.useUtils()

  const { data, isLoading } = trpc.invoice.list.useQuery({
    page,
    limit: 15,
    search: search || undefined,
    status: statusFilter !== "all" ? (statusFilter as "ENTWURF" | "OFFEN" | "BEZAHLT" | "STORNIERT") : undefined,
  })

  const { data: stats } = trpc.invoice.getStats.useQuery()

  const markAsPaidMutation = trpc.invoice.markAsPaid.useMutation({
    onSuccess: () => {
      toast.success("Rechnung als bezahlt markiert")
      utils.invoice.list.invalidate()
      utils.invoice.getStats.invalidate()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const getCustomerName = (customer: { type: string; company?: string | null; firstName?: string | null; lastName: string }) => {
    if (customer.type === "GEWERBE" && customer.company) {
      return customer.company
    }
    return [customer.firstName, customer.lastName].filter(Boolean).join(" ")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Rechnungen</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Rechnungen erstellen und verwalten
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/rechnungen/neu">
            <Plus className="mr-2 h-4 w-4" />
            Neue Rechnung
          </Link>
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl border bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100">
                <Receipt className="h-5 w-5 text-zinc-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-zinc-500">Gesamt</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{stats.open}</p>
                <p className="text-xs text-zinc-500">Offen</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {Number(stats.totalRevenue).toLocaleString("de-DE", {
                    style: "currency",
                    currency: "EUR",
                    maximumFractionDigits: 0,
                  })}
                </p>
                <p className="text-xs text-zinc-500">Bezahlt</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                <Euro className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {Number(stats.openAmount).toLocaleString("de-DE", {
                    style: "currency",
                    currency: "EUR",
                    maximumFractionDigits: 0,
                  })}
                </p>
                <p className="text-xs text-zinc-500">Ausstehend</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Suchen nach Rechnungsnummer, Kunde..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-10"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="ENTWURF">Entwurf</SelectItem>
            <SelectItem value="OFFEN">Offen</SelectItem>
            <SelectItem value="BEZAHLT">Bezahlt</SelectItem>
            <SelectItem value="STORNIERT">Storniert</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px]">Rechnungs-Nr.</TableHead>
              <TableHead>Kunde</TableHead>
              <TableHead>Vertrag</TableHead>
              <TableHead className="text-right">Netto</TableHead>
              <TableHead className="text-right">Brutto</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead className="w-[120px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-zinc-500">
                  Laden...
                </TableCell>
              </TableRow>
            ) : data?.invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-zinc-500">
                  <Receipt className="mx-auto h-12 w-12 text-zinc-300 mb-4" />
                  <p>Keine Rechnungen gefunden</p>
                  <Button asChild className="mt-4">
                    <Link href="/admin/rechnungen/neu">Erste Rechnung erstellen</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              data?.invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-mono text-sm font-medium">
                    {invoice.invoiceNumber}
                  </TableCell>
                  <TableCell>
                    <Link 
                      href={`/admin/kunden/${invoice.customer.id}`}
                      className="hover:underline"
                    >
                      {getCustomerName(invoice.customer)}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {invoice.contract ? (
                      <Link 
                        href={`/admin/vertraege/${invoice.contract.id}`}
                        className="hover:underline text-zinc-500"
                      >
                        V-{String(invoice.contract.contractNumber).padStart(5, "0")}
                      </Link>
                    ) : (
                      <span className="text-zinc-400">–</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {Number(invoice.netAmount).toLocaleString("de-DE", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {Number(invoice.grossAmount).toLocaleString("de-DE", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[invoice.status]}>
                      {statusLabels[invoice.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-zinc-500">
                    {new Date(invoice.invoiceDate).toLocaleDateString("de-DE")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {invoice.status === "OFFEN" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsPaidMutation.mutate({ id: invoice.id })}
                          disabled={markAsPaidMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Bezahlt
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/rechnungen/${invoice.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {data && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-zinc-500">
              Seite {data.pagination.page} von {data.pagination.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= data.pagination.totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

