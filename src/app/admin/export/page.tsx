"use client"

import { useState } from "react"
import { trpc } from "@/lib/trpc"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Download, 
  FileSpreadsheet, 
  Car, 
  CheckCircle2, 
  Circle,
  Loader2,
  ExternalLink
} from "lucide-react"
import { toast } from "sonner"

type VehicleWithImages = {
  id: string
  vehicleNumber: number
  manufacturer: string
  model: string
  variant: string | null
  status: string
  sellingPrice: number | { toNumber: () => number }
  exportMobileDE: boolean
  exportAutoScout: boolean
  images: { url: string; order: number }[]
}

export default function ExportPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isExporting, setIsExporting] = useState(false)

  // Fahrzeuge laden (nur aktive)
  const { data, isLoading } = trpc.vehicle.list.useQuery({
    limit: 100,
    status: "AKTIV",
  })

  const vehicles = (data?.vehicles || []) as VehicleWithImages[]

  // Alle auswählen / abwählen
  const toggleSelectAll = () => {
    if (selectedIds.length === vehicles.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(vehicles.map((v) => v.id))
    }
  }

  // Einzelnes Fahrzeug auswählen
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    )
  }

  // Export durchführen
  const handleExport = async (format: "mobile" | "autoscout") => {
    if (selectedIds.length === 0) {
      toast.error("Bitte wählen Sie mindestens ein Fahrzeug aus")
      return
    }

    setIsExporting(true)

    try {
      const idsParam = selectedIds.join(",")
      const response = await fetch(`/api/export/csv?format=${format}&ids=${idsParam}`)

      if (!response.ok) {
        throw new Error("Export fehlgeschlagen")
      }

      // Download triggern
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = response.headers.get("Content-Disposition")?.split("filename=")[1]?.replace(/"/g, "") 
        || `export-${format}-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success(`${selectedIds.length} Fahrzeug(e) exportiert`)
    } catch {
      toast.error("Export fehlgeschlagen")
    } finally {
      setIsExporting(false)
    }
  }

  const formatPrice = (price: number | { toNumber: () => number }) => {
    const numPrice = typeof price === "number" ? price : price.toNumber()
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(numPrice)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Börsen-Export</h1>
        <p className="text-muted-foreground">
          Exportieren Sie Fahrzeuge als CSV für mobile.de und AutoScout24
        </p>
      </div>

      {/* Export-Buttons */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* mobile.de Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                <FileSpreadsheet className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <CardTitle>mobile.de</CardTitle>
                <CardDescription>Extended CSV Format</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Exportiert im mobile.de Extended Format. Laden Sie die CSV-Datei im 
              Händlerbereich unter &quot;Fahrzeuge&quot; &gt; &quot;Import&quot; hoch.
            </p>
            <Button 
              onClick={() => handleExport("mobile")} 
              disabled={isExporting || selectedIds.length === 0}
              className="w-full"
            >
              {isExporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              mobile.de Export ({selectedIds.length})
            </Button>
            <a 
              href="https://www.mobile.de/haendler" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center text-xs text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="mr-1 h-3 w-3" />
              Zum Händlerbereich
            </a>
          </CardContent>
        </Card>

        {/* AutoScout24 Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                <FileSpreadsheet className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <CardTitle>AutoScout24</CardTitle>
                <CardDescription>Standard CSV Format</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Exportiert im AutoScout24 CSV Format. Laden Sie die CSV-Datei im 
              Händlerbereich unter &quot;Bestand&quot; &gt; &quot;Import&quot; hoch.
            </p>
            <Button 
              onClick={() => handleExport("autoscout")} 
              disabled={isExporting || selectedIds.length === 0}
              variant="outline"
              className="w-full"
            >
              {isExporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              AutoScout24 Export ({selectedIds.length})
            </Button>
            <a 
              href="https://www.autoscout24.de/haendler" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center text-xs text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="mr-1 h-3 w-3" />
              Zum Händlerbereich
            </a>
          </CardContent>
        </Card>
      </div>

      {/* Fahrzeug-Auswahl */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Fahrzeuge auswählen
              </CardTitle>
              <CardDescription>
                {vehicles.length} aktive Fahrzeuge verfügbar
              </CardDescription>
            </div>
            <Button variant="outline" onClick={toggleSelectAll}>
              {selectedIds.length === vehicles.length ? "Alle abwählen" : "Alle auswählen"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {vehicles.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Car className="mx-auto mb-2 h-8 w-8 opacity-50" />
              <p>Keine aktiven Fahrzeuge zum Exportieren vorhanden.</p>
              <p className="text-sm">
                Setzen Sie den Status der Fahrzeuge auf &quot;Aktiv&quot;, um sie zu exportieren.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  onClick={() => toggleSelect(vehicle.id)}
                  className={`flex cursor-pointer items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/50 ${
                    selectedIds.includes(vehicle.id) 
                      ? "border-primary bg-primary/5" 
                      : "border-border"
                  }`}
                >
                  {/* Checkbox */}
                  <div className="flex-shrink-0">
                    {selectedIds.includes(vehicle.id) ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>

                  {/* Bild */}
                  <div className="flex-shrink-0">
                    {vehicle.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={vehicle.images[0].url}
                        alt={`${vehicle.manufacturer} ${vehicle.model}`}
                        className="h-12 w-16 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-16 items-center justify-center rounded bg-muted">
                        <Car className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Fahrzeug-Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        #{vehicle.vehicleNumber} {vehicle.manufacturer} {vehicle.model}
                      </span>
                      {vehicle.variant && (
                        <span className="text-muted-foreground">{vehicle.variant}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{formatPrice(vehicle.sellingPrice)}</span>
                      {vehicle.exportMobileDE && (
                        <Badge variant="outline" className="text-xs">mobile.de</Badge>
                      )}
                      {vehicle.exportAutoScout && (
                        <Badge variant="outline" className="text-xs">AutoScout24</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hinweise zum Export</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>mobile.de:</strong> Nutzen Sie das Extended Format für alle 
            Fahrzeugdaten inkl. Bildern. Die Bilder werden als URLs exportiert.
          </p>
          <p>
            <strong>AutoScout24:</strong> Laden Sie die CSV im Händlerbereich hoch. 
            Stellen Sie sicher, dass Ihre Bilder öffentlich erreichbar sind.
          </p>
          <p>
            <strong>Tipp:</strong> Markieren Sie in den Fahrzeugdetails die gewünschten 
            Export-Plattformen, um den Überblick zu behalten.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

