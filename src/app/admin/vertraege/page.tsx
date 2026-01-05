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
  FileText,
  ChevronLeft,
  ChevronRight,
  Eye,
  Car,
} from "lucide-react"

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

export default function VertraegePage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const { data, isLoading } = trpc.contract.list.useQuery({
    page,
    limit: 15,
    search: search || undefined,
    type: typeFilter !== "all" ? (typeFilter as "KAUFVERTRAG" | "ANKAUFVERTRAG") : undefined,
    status: statusFilter !== "all" ? (statusFilter as "ENTWURF" | "AKTIV" | "ABGESCHLOSSEN" | "STORNIERT") : undefined,
  })

  const { data: stats } = trpc.contract.getStats.useQuery()

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
          <h1 className="text-2xl font-bold text-zinc-900">Vertragsverwaltung</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Kauf- und Ankaufverträge verwalten
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/vertraege/neu">
            <Plus className="mr-2 h-4 w-4" />
            Neuer Vertrag
          </Link>
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <div className="rounded-xl border bg-white p-4">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-zinc-500">Gesamt</p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
            <p className="text-xs text-zinc-500">Aktiv</p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-xs text-zinc-500">Abgeschlossen</p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <p className="text-2xl font-bold">{stats.thisMonth}</p>
            <p className="text-xs text-zinc-500">Diesen Monat</p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <p className="text-2xl font-bold text-green-600">
              {Number(stats.totalValue).toLocaleString("de-DE", {
                style: "currency",
                currency: "EUR",
                maximumFractionDigits: 0,
              })}
            </p>
            <p className="text-xs text-zinc-500">Abgeschl. Umsatz</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Suchen nach Kunde, Fahrzeug..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-10"
          />
        </div>
        <Select
          value={typeFilter}
          onValueChange={(value) => {
            setTypeFilter(value)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Vertragstyp" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Typen</SelectItem>
            <SelectItem value="KAUFVERTRAG">Kaufvertrag</SelectItem>
            <SelectItem value="ANKAUFVERTRAG">Ankaufvertrag</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="ENTWURF">Entwurf</SelectItem>
            <SelectItem value="AKTIV">Aktiv</SelectItem>
            <SelectItem value="ABGESCHLOSSEN">Abgeschlossen</SelectItem>
            <SelectItem value="STORNIERT">Storniert</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Vertrag-Nr.</TableHead>
              <TableHead>Typ</TableHead>
              <TableHead>Kunde</TableHead>
              <TableHead>Fahrzeug</TableHead>
              <TableHead className="text-right">Betrag</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-zinc-500">
                  Laden...
                </TableCell>
              </TableRow>
            ) : data?.contracts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-zinc-500">
                  <FileText className="mx-auto h-12 w-12 text-zinc-300 mb-4" />
                  <p>Keine Verträge gefunden</p>
                  <Button asChild className="mt-4">
                    <Link href="/admin/vertraege/neu">Ersten Vertrag erstellen</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              data?.contracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell className="font-mono text-sm">
                    V-{String(contract.contractNumber).padStart(5, "0")}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {typeLabels[contract.type]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link 
                      href={`/admin/kunden/${contract.customer.id}`}
                      className="hover:underline"
                    >
                      {getCustomerName(contract.customer)}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link 
                      href={`/admin/fahrzeuge/${contract.vehicle.id}`}
                      className="flex items-center gap-2 hover:underline"
                    >
                      <Car className="h-4 w-4 text-zinc-400" />
                      {contract.vehicle.manufacturer} {contract.vehicle.model}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {Number(contract.priceGross).toLocaleString("de-DE", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[contract.status]}>
                      {statusLabels[contract.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-zinc-500">
                    {new Date(contract.contractDate).toLocaleDateString("de-DE")}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/vertraege/${contract.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
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

