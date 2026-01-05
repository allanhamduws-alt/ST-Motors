"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Car,
  Users,
  FileText,
  TrendingUp,
  Plus,
  ArrowRight,
  Receipt,
  MessageSquare,
  AlertCircle,
  Euro,
  Clock,
  CheckCircle,
  Mail,
  Phone,
} from "lucide-react"
import { trpc } from "@/lib/trpc"
import { manufacturers } from "@/lib/vehicle-data"

const vehicleStatusColors: Record<string, string> = {
  ENTWURF: "bg-zinc-100 text-zinc-700",
  AKTIV: "bg-green-100 text-green-700",
  RESERVIERT: "bg-yellow-100 text-yellow-700",
  VERKAUFT: "bg-blue-100 text-blue-700",
}

const vehicleStatusLabels: Record<string, string> = {
  ENTWURF: "Entwurf",
  AKTIV: "Aktiv",
  RESERVIERT: "Reserviert",
  VERKAUFT: "Verkauft",
}

const leadTypeColors: Record<string, string> = {
  FAHRZEUGANFRAGE: "bg-blue-100 text-blue-800",
  ANKAUFANFRAGE: "bg-orange-100 text-orange-800",
  KONTAKT: "bg-purple-100 text-purple-800",
}

const leadTypeLabels: Record<string, string> = {
  FAHRZEUGANFRAGE: "Fahrzeuganfrage",
  ANKAUFANFRAGE: "Ankauf",
  KONTAKT: "Kontakt",
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  
  // Alle Stats abfragen
  const { data: vehicleStats, isLoading: vehicleStatsLoading } = trpc.vehicle.getStats.useQuery()
  const { data: customerStats, isLoading: customerStatsLoading } = trpc.customer.getStats.useQuery()
  const { data: contractStats, isLoading: contractStatsLoading } = trpc.contract.getStats.useQuery()
  const { data: invoiceStats, isLoading: invoiceStatsLoading } = trpc.invoice.getStats.useQuery()
  const { data: leadStats, isLoading: leadStatsLoading } = trpc.lead.getStats.useQuery()
  
  // Neueste Daten
  const { data: vehiclesData, isLoading: vehiclesLoading } = trpc.vehicle.list.useQuery({
    page: 1,
    limit: 5,
    sortBy: "createdAt",
    sortOrder: "desc",
  })
  
  const { data: leadsData, isLoading: leadsLoading } = trpc.lead.list.useQuery({
    page: 1,
    limit: 5,
    sortBy: "createdAt",
    sortOrder: "desc",
  })

  const formatPrice = (price: unknown) => {
    const num = typeof price === "object" ? Number(price) : Number(price)
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(num)
  }

  const getManufacturerLabel = (value: string) => {
    return manufacturers.find((m) => m.value === value)?.label || value
  }

  const isLoading = vehicleStatsLoading || customerStatsLoading || contractStatsLoading || invoiceStatsLoading || leadStatsLoading

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Willkommen zurück, {session?.user?.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/kunden/neu">
              <Plus className="mr-2 h-4 w-4" />
              Neuer Kunde
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/fahrzeuge/neu">
              <Plus className="mr-2 h-4 w-4" />
              Neues Fahrzeug
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards - Hauptübersicht */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Fahrzeuge */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Fahrzeuge im Bestand
            </CardTitle>
            <Car className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {isLoading ? "..." : vehicleStats?.active || 0}
            </div>
            <div className="mt-2 flex items-center gap-4 text-xs text-zinc-500">
              <span>{vehicleStats?.reserved || 0} reserviert</span>
              <span>{vehicleStats?.sold || 0} verkauft</span>
            </div>
          </CardContent>
        </Card>

        {/* Kunden */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Kunden
            </CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {isLoading ? "..." : customerStats?.total || 0}
            </div>
            <div className="mt-2 flex items-center gap-4 text-xs text-zinc-500">
              <span>{customerStats?.buyers || 0} Käufer</span>
              <span>{customerStats?.sellers || 0} Verkäufer</span>
            </div>
          </CardContent>
        </Card>

        {/* Offene Rechnungen */}
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Offene Rechnungen
            </CardTitle>
            <Receipt className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {isLoading ? "..." : invoiceStats?.open || 0}
            </div>
            <div className="mt-2 text-xs text-zinc-500">
              {formatPrice(invoiceStats?.openAmount || 0)} ausstehend
            </div>
          </CardContent>
        </Card>

        {/* Neue Anfragen */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Neue Anfragen
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {isLoading ? "..." : leadStats?.new || 0}
            </div>
            <div className="mt-2 text-xs text-zinc-500">
              {leadStats?.today || 0} heute eingegangen
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Zweite Reihe KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Bestandswert */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Bestandswert (aktiv)
            </CardTitle>
            <Euro className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : formatPrice(vehicleStats?.totalValue || 0)}
            </div>
          </CardContent>
        </Card>

        {/* Umsatz (bezahlt) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Umsatz (bezahlt)
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {isLoading ? "..." : formatPrice(invoiceStats?.totalRevenue || 0)}
            </div>
          </CardContent>
        </Card>

        {/* Aktive Verträge */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Aktive Verträge
            </CardTitle>
            <FileText className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : contractStats?.active || 0}
            </div>
            <div className="mt-1 text-xs text-zinc-500">
              {contractStats?.completed || 0} abgeschlossen
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hauptcontent */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Neueste Fahrzeuge */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Neueste Fahrzeuge</CardTitle>
            <Link href="/admin/fahrzeuge">
              <Button variant="ghost" size="sm">
                Alle anzeigen
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {vehiclesLoading ? (
              <p className="text-sm text-zinc-500">Laden...</p>
            ) : !vehiclesData?.vehicles.length ? (
              <div className="py-8 text-center">
                <Car className="mx-auto h-12 w-12 text-zinc-200" />
                <p className="mt-2 text-sm text-zinc-500">
                  Noch keine Fahrzeuge vorhanden
                </p>
                <Link href="/admin/fahrzeuge/neu" className="mt-4 inline-block">
                  <Button variant="outline" size="sm">
                    Erstes Fahrzeug anlegen
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {vehiclesData.vehicles.map((vehicle) => (
                  <Link
                    key={vehicle.id}
                    href={`/admin/fahrzeuge/${vehicle.id}`}
                    className="flex items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-zinc-50"
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
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">
                        {getManufacturerLabel(vehicle.manufacturer)} {vehicle.model}
                      </p>
                      <p className="text-sm text-zinc-500">
                        {formatPrice(vehicle.sellingPrice)}
                      </p>
                    </div>
                    <Badge className={vehicleStatusColors[vehicle.status]}>
                      {vehicleStatusLabels[vehicle.status]}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Neueste Anfragen */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Neueste Anfragen</CardTitle>
            <Link href="/admin/anfragen">
              <Button variant="ghost" size="sm">
                Alle anzeigen
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {leadsLoading ? (
              <p className="text-sm text-zinc-500">Laden...</p>
            ) : !leadsData?.leads.length ? (
              <div className="py-8 text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-zinc-200" />
                <p className="mt-2 text-sm text-zinc-500">
                  Noch keine Anfragen vorhanden
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  Anfragen erscheinen hier sobald Kunden das Kontaktformular nutzen
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {leadsData.leads.map((lead) => (
                  <Link
                    key={lead.id}
                    href="/admin/anfragen"
                    className={`block rounded-lg border p-3 transition-colors hover:bg-zinc-50 ${
                      lead.status === "NEU" ? "border-yellow-200 bg-yellow-50/50" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{lead.name}</p>
                          <Badge className={leadTypeColors[lead.type]} variant="secondary">
                            {leadTypeLabels[lead.type]}
                          </Badge>
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {lead.email}
                          </span>
                          {lead.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {lead.phone}
                            </span>
                          )}
                        </div>
                        {lead.vehicle && (
                          <p className="mt-1 text-xs text-zinc-500">
                            <Car className="inline h-3 w-3 mr-1" />
                            {lead.vehicle.manufacturer} {lead.vehicle.model}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {lead.status === "NEU" && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Neu
                          </Badge>
                        )}
                        <span className="text-xs text-zinc-400">
                          {new Date(lead.createdAt).toLocaleDateString("de-DE", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Schnellaktionen */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Schnellaktionen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/admin/fahrzeuge/neu">
              <Button variant="outline" className="w-full justify-start h-auto py-4">
                <Car className="mr-3 h-5 w-5 text-blue-500" />
                <div className="text-left">
                  <p className="font-medium">Neues Fahrzeug</p>
                  <p className="text-xs text-zinc-500">Fahrzeug anlegen</p>
                </div>
              </Button>
            </Link>
            <Link href="/admin/kunden/neu">
              <Button variant="outline" className="w-full justify-start h-auto py-4">
                <Users className="mr-3 h-5 w-5 text-green-500" />
                <div className="text-left">
                  <p className="font-medium">Neuer Kunde</p>
                  <p className="text-xs text-zinc-500">Kunden anlegen</p>
                </div>
              </Button>
            </Link>
            <Link href="/admin/vertraege/neu">
              <Button variant="outline" className="w-full justify-start h-auto py-4">
                <FileText className="mr-3 h-5 w-5 text-orange-500" />
                <div className="text-left">
                  <p className="font-medium">Neuer Vertrag</p>
                  <p className="text-xs text-zinc-500">Vertrag erstellen</p>
                </div>
              </Button>
            </Link>
            <Link href="/admin/rechnungen/neu">
              <Button variant="outline" className="w-full justify-start h-auto py-4">
                <Receipt className="mr-3 h-5 w-5 text-purple-500" />
                <div className="text-left">
                  <p className="font-medium">Neue Rechnung</p>
                  <p className="text-xs text-zinc-500">Rechnung erstellen</p>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
