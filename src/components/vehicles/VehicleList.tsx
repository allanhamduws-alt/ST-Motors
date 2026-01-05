"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Car,
  Filter,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { trpc } from "@/lib/trpc"
import { manufacturers } from "@/lib/vehicle-data"

const statusColors: Record<string, string> = {
  ENTWURF: "bg-zinc-100 text-zinc-700",
  AKTIV: "bg-green-100 text-green-700",
  RESERVIERT: "bg-yellow-100 text-yellow-700",
  VERKAUFT: "bg-blue-100 text-blue-700",
}

const statusLabels: Record<string, string> = {
  ENTWURF: "Entwurf",
  AKTIV: "Aktiv",
  RESERVIERT: "Reserviert",
  VERKAUFT: "Verkauft",
}

export function VehicleList() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [manufacturer, setManufacturer] = useState<string>("")
  const [status, setStatus] = useState<string>("")
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading, refetch } = trpc.vehicle.list.useQuery({
    page,
    limit: 20,
    search: search || undefined,
    manufacturer: manufacturer || undefined,
    status: status as "ENTWURF" | "AKTIV" | "RESERVIERT" | "VERKAUFT" | undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  })

  const deleteMutation = trpc.vehicle.delete.useMutation({
    onSuccess: () => {
      toast.success("Fahrzeug gelöscht")
      setDeleteId(null)
      refetch()
    },
    onError: (error) => {
      toast.error(error.message || "Fehler beim Löschen")
    },
  })

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate({ id: deleteId })
    }
  }

  const formatPrice = (price: unknown) => {
    const num = typeof price === "object" ? Number(price) : Number(price)
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(num)
  }

  const formatMileage = (km: number) => {
    return new Intl.NumberFormat("de-DE").format(km) + " km"
  }

  const getManufacturerLabel = (value: string) => {
    return manufacturers.find((m) => m.value === value)?.label || value
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Fahrzeuge</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {data?.pagination.total || 0} Fahrzeuge im Bestand
          </p>
        </div>
        <Link href="/admin/fahrzeuge/neu">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Neues Fahrzeug
          </Button>
        </Link>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                placeholder="Suchen..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="pl-9"
              />
            </div>
            <Select
              value={manufacturer}
              onValueChange={(value) => {
                setManufacturer(value === "all" ? "" : value)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Alle Hersteller" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Hersteller</SelectItem>
                {manufacturers.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value === "all" ? "" : value)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Alle Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="ENTWURF">Entwurf</SelectItem>
                <SelectItem value="AKTIV">Aktiv</SelectItem>
                <SelectItem value="RESERVIERT">Reserviert</SelectItem>
                <SelectItem value="VERKAUFT">Verkauft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabelle */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="text-sm text-zinc-500">Laden...</div>
            </div>
          ) : !data?.vehicles.length ? (
            <div className="flex flex-col items-center justify-center p-12">
              <Car className="h-12 w-12 text-zinc-300" />
              <p className="mt-4 text-sm text-zinc-500">Keine Fahrzeuge gefunden</p>
              <Link href="/admin/fahrzeuge/neu" className="mt-4">
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Erstes Fahrzeug anlegen
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Bild</TableHead>
                  <TableHead>Fahrzeug</TableHead>
                  <TableHead>Preis</TableHead>
                  <TableHead>Kilometerstand</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell>
                      <div className="h-12 w-16 overflow-hidden rounded bg-zinc-100">
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
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {getManufacturerLabel(vehicle.manufacturer)} {vehicle.model}
                        </p>
                        <p className="text-sm text-zinc-500">
                          {vehicle.variant || "–"} • #{vehicle.vehicleNumber}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatPrice(vehicle.sellingPrice)}
                    </TableCell>
                    <TableCell>{formatMileage(vehicle.mileage)}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[vehicle.status]}>
                        {statusLabels[vehicle.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => router.push(`/admin/fahrzeuge/${vehicle.id}`)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Bearbeiten
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => window.open(`/fahrzeuge/${vehicle.slug}`, "_blank")}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Vorschau
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => setDeleteId(vehicle.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Löschen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            Seite {data.pagination.page} von {data.pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Zurück
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === data.pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Weiter
            </Button>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fahrzeug löschen</DialogTitle>
            <DialogDescription>
              Sind Sie sicher, dass Sie dieses Fahrzeug löschen möchten? Diese Aktion
              kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Abbrechen
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Löschen..." : "Löschen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

