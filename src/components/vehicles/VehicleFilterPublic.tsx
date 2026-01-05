"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState } from "react"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"

const vehicleTypeLabels: Record<string, string> = {
  PKW: "PKW",
  SUV: "SUV",
  KOMBI: "Kombi",
  COUPE: "Coupé",
  CABRIO: "Cabrio",
  LIMOUSINE: "Limousine",
  VAN: "Van",
}

const fuelTypeLabels: Record<string, string> = {
  BENZIN: "Benzin",
  DIESEL: "Diesel",
  ELEKTRO: "Elektro",
  HYBRID: "Hybrid",
  LPG: "LPG",
}

interface VehicleFilterPublicProps {
  filterOptions: {
    manufacturers: string[]
    vehicleTypes: string[]
    fuelTypes: string[]
  }
  currentFilters: {
    hersteller?: string
    typ?: string
    kraftstoff?: string
    getriebe?: string
    preisMin?: string
    preisMax?: string
    kmMax?: string
  }
}

export function VehicleFilterPublic({
  filterOptions,
  currentFilters,
}: VehicleFilterPublicProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [filters, setFilters] = useState({
    hersteller: currentFilters.hersteller || "",
    typ: currentFilters.typ || "",
    kraftstoff: currentFilters.kraftstoff || "",
    getriebe: currentFilters.getriebe || "",
    preisMin: currentFilters.preisMin || "",
    preisMax: currentFilters.preisMax || "",
    kmMax: currentFilters.kmMax || "",
  })

  const updateUrl = useCallback(
    (newFilters: typeof filters) => {
      const params = new URLSearchParams(searchParams.toString())

      // Clear all filter params first
      params.delete("hersteller")
      params.delete("typ")
      params.delete("kraftstoff")
      params.delete("getriebe")
      params.delete("preisMin")
      params.delete("preisMax")
      params.delete("kmMax")

      // Add non-empty filters
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value && value !== "all") {
          params.set(key, value)
        }
      })

      router.push(`/fahrzeuge?${params.toString()}`)
    },
    [router, searchParams]
  )

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value === "all" ? "" : value }
    setFilters(newFilters)
    updateUrl(newFilters)
  }

  const handleReset = () => {
    const emptyFilters = {
      hersteller: "",
      typ: "",
      kraftstoff: "",
      getriebe: "",
      preisMin: "",
      preisMax: "",
      kmMax: "",
    }
    setFilters(emptyFilters)
    router.push("/fahrzeuge")
  }

  const hasActiveFilters = Object.values(filters).some((v) => v !== "")

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filter
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-8 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Zurücksetzen
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Hersteller */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Hersteller</Label>
          <Select
            value={filters.hersteller || "all"}
            onValueChange={(v) => handleFilterChange("hersteller", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Alle Hersteller" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Hersteller</SelectItem>
              {filterOptions.manufacturers.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Fahrzeugtyp */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Fahrzeugtyp</Label>
          <Select
            value={filters.typ || "all"}
            onValueChange={(v) => handleFilterChange("typ", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Alle Typen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Typen</SelectItem>
              {filterOptions.vehicleTypes.map((t) => (
                <SelectItem key={t} value={t}>
                  {vehicleTypeLabels[t] || t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Kraftstoff */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Kraftstoff</Label>
          <Select
            value={filters.kraftstoff || "all"}
            onValueChange={(v) => handleFilterChange("kraftstoff", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Alle Kraftstoffe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Kraftstoffe</SelectItem>
              {filterOptions.fuelTypes.map((f) => (
                <SelectItem key={f} value={f}>
                  {fuelTypeLabels[f] || f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Getriebe */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Getriebe</Label>
          <Select
            value={filters.getriebe || "all"}
            onValueChange={(v) => handleFilterChange("getriebe", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Alle Getriebe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Getriebe</SelectItem>
              <SelectItem value="AUTOMATIK">Automatik</SelectItem>
              <SelectItem value="MANUELL">Schaltgetriebe</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Preis */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Preis (€)</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.preisMin}
              onChange={(e) => {
                const newFilters = { ...filters, preisMin: e.target.value }
                setFilters(newFilters)
              }}
              onBlur={() => updateUrl(filters)}
              className="h-10"
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.preisMax}
              onChange={(e) => {
                const newFilters = { ...filters, preisMax: e.target.value }
                setFilters(newFilters)
              }}
              onBlur={() => updateUrl(filters)}
              className="h-10"
            />
          </div>
        </div>

        {/* Kilometerstand */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Max. Kilometerstand</Label>
          <Select
            value={filters.kmMax || "all"}
            onValueChange={(v) => handleFilterChange("kmMax", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Beliebig" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Beliebig</SelectItem>
              <SelectItem value="10000">Bis 10.000 km</SelectItem>
              <SelectItem value="25000">Bis 25.000 km</SelectItem>
              <SelectItem value="50000">Bis 50.000 km</SelectItem>
              <SelectItem value="75000">Bis 75.000 km</SelectItem>
              <SelectItem value="100000">Bis 100.000 km</SelectItem>
              <SelectItem value="150000">Bis 150.000 km</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Apply Button (Mobile) */}
        <div className="pt-2 lg:hidden">
          <Button className="w-full" onClick={() => updateUrl(filters)}>
            Filter anwenden
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

