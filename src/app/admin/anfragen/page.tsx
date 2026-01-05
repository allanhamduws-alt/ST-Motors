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
  Search,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Eye,
  Car,
  UserPlus,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const typeLabels = {
  FAHRZEUGANFRAGE: "Fahrzeuganfrage",
  ANKAUFANFRAGE: "Ankaufanfrage",
  KONTAKT: "Kontaktanfrage",
}

const typeColors = {
  FAHRZEUGANFRAGE: "bg-blue-100 text-blue-800",
  ANKAUFANFRAGE: "bg-orange-100 text-orange-800",
  KONTAKT: "bg-purple-100 text-purple-800",
}

const statusLabels = {
  NEU: "Neu",
  IN_BEARBEITUNG: "In Bearbeitung",
  ABGESCHLOSSEN: "Abgeschlossen",
}

const statusColors = {
  NEU: "bg-yellow-100 text-yellow-800",
  IN_BEARBEITUNG: "bg-blue-100 text-blue-800",
  ABGESCHLOSSEN: "bg-green-100 text-green-800",
}

interface Lead {
  id: string
  type: "FAHRZEUGANFRAGE" | "ANKAUFANFRAGE" | "KONTAKT"
  status: "NEU" | "IN_BEARBEITUNG" | "ABGESCHLOSSEN"
  name: string
  email: string
  phone: string | null
  message: string
  createdAt: Date
  vehicle: {
    id: string
    vehicleNumber: number
    manufacturer: string
    model: string
    slug: string
  } | null
}

export default function AnfragenPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const utils = trpc.useUtils()

  const { data, isLoading } = trpc.lead.list.useQuery({
    page,
    limit: 15,
    search: search || undefined,
    type: typeFilter !== "all" ? (typeFilter as "FAHRZEUGANFRAGE" | "ANKAUFANFRAGE" | "KONTAKT") : undefined,
    status: statusFilter !== "all" ? (statusFilter as "NEU" | "IN_BEARBEITUNG" | "ABGESCHLOSSEN") : undefined,
  })

  const { data: stats } = trpc.lead.getStats.useQuery()

  const updateStatusMutation = trpc.lead.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status aktualisiert")
      utils.lead.list.invalidate()
      utils.lead.getStats.invalidate()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const convertToCustomerMutation = trpc.lead.convertToCustomer.useMutation({
    onSuccess: (customer) => {
      toast.success("Kunde erfolgreich angelegt")
      utils.lead.list.invalidate()
      utils.lead.getStats.invalidate()
      setSelectedLead(null)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const deleteMutation = trpc.lead.delete.useMutation({
    onSuccess: () => {
      toast.success("Anfrage gelöscht")
      utils.lead.list.invalidate()
      utils.lead.getStats.invalidate()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const handleStatusChange = (id: string, status: "NEU" | "IN_BEARBEITUNG" | "ABGESCHLOSSEN") => {
    updateStatusMutation.mutate({ id, status })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Anfragen</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Website-Anfragen und Leads verwalten
          </p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <div className="rounded-xl border bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100">
                <MessageSquare className="h-5 w-5 text-zinc-600" />
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
                <p className="text-2xl font-bold text-yellow-600">{stats.new}</p>
                <p className="text-xs text-zinc-500">Neu</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                <p className="text-xs text-zinc-500">In Bearbeitung</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                <p className="text-xs text-zinc-500">Abgeschlossen</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <MessageSquare className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">{stats.thisWeek}</p>
                <p className="text-xs text-zinc-500">Diese Woche</p>
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
            placeholder="Suchen nach Name, E-Mail, Nachricht..."
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
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="Typ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Typen</SelectItem>
            <SelectItem value="FAHRZEUGANFRAGE">Fahrzeuganfrage</SelectItem>
            <SelectItem value="ANKAUFANFRAGE">Ankaufanfrage</SelectItem>
            <SelectItem value="KONTAKT">Kontakt</SelectItem>
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
            <SelectItem value="NEU">Neu</SelectItem>
            <SelectItem value="IN_BEARBEITUNG">In Bearbeitung</SelectItem>
            <SelectItem value="ABGESCHLOSSEN">Abgeschlossen</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Typ</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Kontakt</TableHead>
              <TableHead>Fahrzeug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Eingegangen</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-zinc-500">
                  Laden...
                </TableCell>
              </TableRow>
            ) : data?.leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-zinc-500">
                  <MessageSquare className="mx-auto h-12 w-12 text-zinc-300 mb-4" />
                  <p>Keine Anfragen gefunden</p>
                </TableCell>
              </TableRow>
            ) : (
              data?.leads.map((lead) => (
                <TableRow key={lead.id} className={lead.status === "NEU" ? "bg-yellow-50/50" : ""}>
                  <TableCell>
                    <Badge className={typeColors[lead.type]}>
                      {typeLabels[lead.type]}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-sm">
                      <a href={`mailto:${lead.email}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                        <Mail className="h-3 w-3" />
                        {lead.email}
                      </a>
                      {lead.phone && (
                        <a href={`tel:${lead.phone}`} className="flex items-center gap-1 text-zinc-500 hover:underline">
                          <Phone className="h-3 w-3" />
                          {lead.phone}
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {lead.vehicle ? (
                      <Link 
                        href={`/admin/fahrzeuge/${lead.vehicle.id}`}
                        className="flex items-center gap-2 hover:underline"
                      >
                        <Car className="h-4 w-4 text-zinc-400" />
                        <span>{lead.vehicle.manufacturer} {lead.vehicle.model}</span>
                      </Link>
                    ) : (
                      <span className="text-zinc-400">–</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={lead.status}
                      onValueChange={(value) => handleStatusChange(lead.id, value as "NEU" | "IN_BEARBEITUNG" | "ABGESCHLOSSEN")}
                    >
                      <SelectTrigger className="w-[140px] h-8">
                        <Badge className={statusColors[lead.status]}>
                          {statusLabels[lead.status]}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NEU">Neu</SelectItem>
                        <SelectItem value="IN_BEARBEITUNG">In Bearbeitung</SelectItem>
                        <SelectItem value="ABGESCHLOSSEN">Abgeschlossen</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-zinc-500">
                    {new Date(lead.createdAt).toLocaleDateString("de-DE", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedLead(lead as Lead)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm("Anfrage wirklich löschen?")) {
                            deleteMutation.mutate({ id: lead.id })
                          }
                        }}
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

      {/* Lead Detail Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Badge className={selectedLead ? typeColors[selectedLead.type] : ""}>
                {selectedLead && typeLabels[selectedLead.type]}
              </Badge>
              von {selectedLead?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedLead && new Date(selectedLead.createdAt).toLocaleDateString("de-DE", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </DialogDescription>
          </DialogHeader>
          
          {selectedLead && (
            <div className="space-y-4">
              {/* Contact Info */}
              <div className="rounded-lg bg-zinc-50 p-4 space-y-2">
                <a href={`mailto:${selectedLead.email}`} className="flex items-center gap-2 text-blue-600 hover:underline">
                  <Mail className="h-4 w-4" />
                  {selectedLead.email}
                </a>
                {selectedLead.phone && (
                  <a href={`tel:${selectedLead.phone}`} className="flex items-center gap-2 hover:underline">
                    <Phone className="h-4 w-4" />
                    {selectedLead.phone}
                  </a>
                )}
              </div>

              {/* Vehicle (if any) */}
              {selectedLead.vehicle && (
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-zinc-500 mb-1">Angefragtes Fahrzeug:</p>
                  <Link 
                    href={`/admin/fahrzeuge/${selectedLead.vehicle.id}`}
                    className="flex items-center gap-2 font-medium hover:underline"
                  >
                    <Car className="h-4 w-4" />
                    {selectedLead.vehicle.manufacturer} {selectedLead.vehicle.model}
                    <span className="text-zinc-400 font-mono text-sm">
                      #{selectedLead.vehicle.vehicleNumber}
                    </span>
                  </Link>
                </div>
              )}

              {/* Message */}
              <div>
                <p className="text-sm text-zinc-500 mb-2">Nachricht:</p>
                <p className="text-zinc-900 whitespace-pre-wrap">{selectedLead.message}</p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => selectedLead && convertToCustomerMutation.mutate({ id: selectedLead.id })}
              disabled={convertToCustomerMutation.isPending || selectedLead?.status === "ABGESCHLOSSEN"}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Als Kunde anlegen
            </Button>
            <Button onClick={() => setSelectedLead(null)}>
              Schließen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

