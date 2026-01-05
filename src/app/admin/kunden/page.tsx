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
  Users,
  Building2,
  User,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  FileText,
  Receipt,
} from "lucide-react"
import { toast } from "sonner"

const roleLabels = {
  INTERESSENT: "Interessent",
  KAEUFER: "Käufer",
  VERKAEUFER: "Verkäufer",
}

const roleColors = {
  INTERESSENT: "bg-blue-100 text-blue-800",
  KAEUFER: "bg-green-100 text-green-800",
  VERKAEUFER: "bg-orange-100 text-orange-800",
}

export default function KundenPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const utils = trpc.useUtils()

  const { data, isLoading } = trpc.customer.list.useQuery({
    page,
    limit: 15,
    search: search || undefined,
    type: typeFilter !== "all" ? (typeFilter as "PRIVAT" | "GEWERBE") : undefined,
    role: roleFilter !== "all" ? (roleFilter as "INTERESSENT" | "KAEUFER" | "VERKAEUFER") : undefined,
  })

  const { data: stats } = trpc.customer.getStats.useQuery()

  const deleteMutation = trpc.customer.delete.useMutation({
    onSuccess: () => {
      toast.success("Kunde erfolgreich gelöscht")
      utils.customer.list.invalidate()
      utils.customer.getStats.invalidate()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Möchten Sie den Kunden "${name}" wirklich löschen?`)) {
      deleteMutation.mutate({ id })
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Kundenverwaltung</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Verwalten Sie Ihre Kunden, Interessenten und Geschäftspartner
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/kunden/neu">
            <Plus className="mr-2 h-4 w-4" />
            Neuer Kunde
          </Link>
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl border bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100">
                <Users className="h-5 w-5 text-zinc-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-zinc-500">Gesamt</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.private}</p>
                <p className="text-xs text-zinc-500">Privatkunden</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <Building2 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.business}</p>
                <p className="text-xs text-zinc-500">Geschäftskunden</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.thisMonth}</p>
                <p className="text-xs text-zinc-500">Diesen Monat</p>
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
            placeholder="Suchen nach Name, Firma, E-Mail..."
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
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Kundentyp" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Typen</SelectItem>
            <SelectItem value="PRIVAT">Privat</SelectItem>
            <SelectItem value="GEWERBE">Gewerbe</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={roleFilter}
          onValueChange={(value) => {
            setRoleFilter(value)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Rolle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Rollen</SelectItem>
            <SelectItem value="INTERESSENT">Interessent</SelectItem>
            <SelectItem value="KAEUFER">Käufer</SelectItem>
            <SelectItem value="VERKAEUFER">Verkäufer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Kd.-Nr.</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Typ</TableHead>
              <TableHead>Kontakt</TableHead>
              <TableHead>Rolle</TableHead>
              <TableHead className="text-center">Verträge</TableHead>
              <TableHead className="text-center">Rechnungen</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-zinc-500">
                  Laden...
                </TableCell>
              </TableRow>
            ) : data?.customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-zinc-500">
                  Keine Kunden gefunden
                </TableCell>
              </TableRow>
            ) : (
              data?.customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-mono text-sm">
                    {String(customer.customerNumber).padStart(5, "0")}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{getCustomerName(customer)}</p>
                      {customer.type === "GEWERBE" && customer.firstName && customer.lastName && (
                        <p className="text-sm text-zinc-500">
                          {customer.firstName} {customer.lastName}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {customer.type === "GEWERBE" ? (
                        <><Building2 className="mr-1 h-3 w-3" /> Gewerbe</>
                      ) : (
                        <><User className="mr-1 h-3 w-3" /> Privat</>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {customer.email && <p>{customer.email}</p>}
                      {customer.phone && <p className="text-zinc-500">{customer.phone}</p>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={roleColors[customer.role]}>
                      {roleLabels[customer.role]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <FileText className="h-4 w-4 text-zinc-400" />
                      <span>{customer._count.contracts}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Receipt className="h-4 w-4 text-zinc-400" />
                      <span>{customer._count.invoices}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/kunden/${customer.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(customer.id, getCustomerName(customer))}
                        disabled={customer._count.contracts > 0 || customer._count.invoices > 0}
                      >
                        <Trash2 className="h-4 w-4" />
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
              Seite {data.pagination.page} von {data.pagination.totalPages} ({data.pagination.total} Einträge)
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

