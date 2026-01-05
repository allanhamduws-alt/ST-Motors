"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ImageUpload } from "./ImageUpload"
import { trpc } from "@/lib/trpc"
import {
  manufacturers,
  models,
  fuelTypes,
  transmissions,
  driveTypes,
  vehicleTypes,
  vehicleConditions,
  vehicleStatuses,
  exteriorColors,
  features as allFeatures,
} from "@/lib/vehicle-data"

const formSchema = z.object({
  manufacturer: z.string().min(1, "Hersteller ist erforderlich"),
  model: z.string().min(1, "Modell ist erforderlich"),
  variant: z.string().optional(),
  vehicleType: z.enum(["PKW", "SUV", "KOMBI", "COUPE", "CABRIO", "LIMOUSINE", "VAN"]),
  condition: z.enum(["NEU", "GEBRAUCHT", "JAHRESWAGEN", "VORFUEHRWAGEN"]),
  status: z.enum(["ENTWURF", "AKTIV", "RESERVIERT", "VERKAUFT"]),
  vin: z.string().optional(),
  hsn: z.string().optional(),
  tsn: z.string().optional(),
  licensePlate: z.string().optional(),
  firstRegistration: z.string().optional(),
  mileage: z.coerce.number().min(0),
  previousOwners: z.coerce.number().min(0),
  fuelType: z.enum(["BENZIN", "DIESEL", "ELEKTRO", "HYBRID", "LPG"]).optional(),
  transmission: z.enum(["AUTOMATIK", "MANUELL"]).optional(),
  powerKW: z.coerce.number().min(0).optional(),
  powerPS: z.coerce.number().min(0).optional(),
  displacement: z.coerce.number().min(0).optional(),
  driveType: z.enum(["FRONT", "HECK", "ALLRAD"]).optional(),
  exteriorColor: z.string().optional(),
  interiorColor: z.string().optional(),
  doors: z.coerce.number().min(2).max(5).optional(),
  seats: z.coerce.number().min(2).max(9).optional(),
  purchasePrice: z.coerce.number().min(0).optional(),
  sellingPrice: z.coerce.number().min(0),
  vatType: z.enum(["MWST", "DIFFERENZ"]),
  title: z.string().optional(),
  description: z.string().optional(),
  exportMobileDE: z.boolean(),
  exportAutoScout: z.boolean(),
})

type FormData = z.infer<typeof formSchema>

interface VehicleFormProps {
  vehicle?: {
    id: string
    manufacturer: string
    model: string
    variant?: string | null
    vehicleType: "PKW" | "SUV" | "KOMBI" | "COUPE" | "CABRIO" | "LIMOUSINE" | "VAN"
    condition: "NEU" | "GEBRAUCHT" | "JAHRESWAGEN" | "VORFUEHRWAGEN"
    status: "ENTWURF" | "AKTIV" | "RESERVIERT" | "VERKAUFT"
    vin?: string | null
    hsn?: string | null
    tsn?: string | null
    licensePlate?: string | null
    firstRegistration?: Date | null
    mileage: number
    previousOwners: number
    fuelType?: "BENZIN" | "DIESEL" | "ELEKTRO" | "HYBRID" | "LPG" | null
    transmission?: "AUTOMATIK" | "MANUELL" | null
    powerKW?: number | null
    powerPS?: number | null
    displacement?: number | null
    driveType?: "FRONT" | "HECK" | "ALLRAD" | null
    exteriorColor?: string | null
    interiorColor?: string | null
    doors?: number | null
    seats?: number | null
    features: string[]
    purchasePrice?: unknown
    sellingPrice: unknown
    vatType: "MWST" | "DIFFERENZ"
    title?: string | null
    description?: string | null
    exportMobileDE: boolean
    exportAutoScout: boolean
    images: Array<{ id: string; url: string; order: number }>
  }
}

export function VehicleForm({ vehicle }: VehicleFormProps) {
  const router = useRouter()
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(vehicle?.features || [])
  const [images, setImages] = useState<Array<{ url: string; order: number }>>(
    vehicle?.images?.map((img) => ({ url: img.url, order: img.order })) || []
  )
  const [selectedManufacturer, setSelectedManufacturer] = useState(vehicle?.manufacturer || "")

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      manufacturer: vehicle?.manufacturer || "",
      model: vehicle?.model || "",
      variant: vehicle?.variant || "",
      vehicleType: vehicle?.vehicleType || "SUV",
      condition: vehicle?.condition || "GEBRAUCHT",
      status: vehicle?.status || "ENTWURF",
      vin: vehicle?.vin || "",
      hsn: vehicle?.hsn || "",
      tsn: vehicle?.tsn || "",
      licensePlate: vehicle?.licensePlate || "",
      firstRegistration: vehicle?.firstRegistration
        ? new Date(vehicle.firstRegistration).toISOString().split("T")[0]
        : "",
      mileage: vehicle?.mileage || 0,
      previousOwners: vehicle?.previousOwners || 0,
      fuelType: vehicle?.fuelType || undefined,
      transmission: vehicle?.transmission || undefined,
      powerKW: vehicle?.powerKW || undefined,
      powerPS: vehicle?.powerPS || undefined,
      displacement: vehicle?.displacement || undefined,
      driveType: vehicle?.driveType || undefined,
      exteriorColor: vehicle?.exteriorColor || "",
      interiorColor: vehicle?.interiorColor || "",
      doors: vehicle?.doors || undefined,
      seats: vehicle?.seats || undefined,
      purchasePrice: vehicle?.purchasePrice ? Number(vehicle.purchasePrice) : undefined,
      sellingPrice: vehicle?.sellingPrice ? Number(vehicle.sellingPrice) : 0,
      vatType: vehicle?.vatType || "MWST",
      title: vehicle?.title || "",
      description: vehicle?.description || "",
      exportMobileDE: vehicle?.exportMobileDE || false,
      exportAutoScout: vehicle?.exportAutoScout || false,
    },
  })

  const watchManufacturer = watch("manufacturer")
  const watchPowerKW = watch("powerKW")

  // PS automatisch berechnen wenn KW geändert wird
  useEffect(() => {
    if (watchPowerKW) {
      setValue("powerPS", Math.round(watchPowerKW * 1.36))
    }
  }, [watchPowerKW, setValue])

  // Modelle filtern wenn Hersteller geändert wird
  useEffect(() => {
    if (watchManufacturer && watchManufacturer !== selectedManufacturer) {
      setSelectedManufacturer(watchManufacturer)
      if (!vehicle) {
        setValue("model", "")
      }
    }
  }, [watchManufacturer, selectedManufacturer, setValue, vehicle])

  const availableModels = selectedManufacturer ? models[selectedManufacturer] || [] : []

  const createMutation = trpc.vehicle.create.useMutation({
    onSuccess: () => {
      toast.success("Fahrzeug erfolgreich erstellt")
      router.push("/admin/fahrzeuge")
      router.refresh()
    },
    onError: (error) => {
      toast.error(error.message || "Fehler beim Erstellen")
    },
  })

  const updateMutation = trpc.vehicle.update.useMutation({
    onSuccess: () => {
      toast.success("Fahrzeug erfolgreich aktualisiert")
      router.push("/admin/fahrzeuge")
      router.refresh()
    },
    onError: (error) => {
      toast.error(error.message || "Fehler beim Aktualisieren")
    },
  })

  const isLoading = createMutation.isPending || updateMutation.isPending

  const onSubmit = (data: FormData) => {
    const payload = {
      ...data,
      features: selectedFeatures,
      images: images,
    }

    if (vehicle) {
      updateMutation.mutate({ id: vehicle.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const toggleFeature = (feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Grunddaten</TabsTrigger>
          <TabsTrigger value="technical">Technik</TabsTrigger>
          <TabsTrigger value="equipment">Ausstattung</TabsTrigger>
          <TabsTrigger value="price">Preis & Export</TabsTrigger>
          <TabsTrigger value="images">Bilder</TabsTrigger>
        </TabsList>

        {/* Grunddaten */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fahrzeugdaten</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="manufacturer">Hersteller *</Label>
                <Select
                  value={watchManufacturer}
                  onValueChange={(value) => setValue("manufacturer", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Hersteller wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {manufacturers.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.manufacturer && (
                  <p className="text-sm text-red-500">{errors.manufacturer.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Modell *</Label>
                <Select
                  value={watch("model")}
                  onValueChange={(value) => setValue("model", value)}
                  disabled={!selectedManufacturer}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Modell wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.model && (
                  <p className="text-sm text-red-500">{errors.model.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="variant">Variante</Label>
                <Input
                  id="variant"
                  placeholder="z.B. xDrive40i, AMG Line"
                  {...register("variant")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicleType">Fahrzeugtyp</Label>
                <Select
                  value={watch("vehicleType")}
                  onValueChange={(value) => setValue("vehicleType", value as FormData["vehicleType"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Zustand</Label>
                <Select
                  value={watch("condition")}
                  onValueChange={(value) => setValue("condition", value as FormData["condition"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleConditions.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={watch("status")}
                  onValueChange={(value) => setValue("status", value as FormData["status"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleStatuses.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Identifikation</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="vin">Fahrgestellnummer (VIN)</Label>
                <Input id="vin" {...register("vin")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hsn">HSN</Label>
                <Input id="hsn" {...register("hsn")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tsn">TSN</Label>
                <Input id="tsn" {...register("tsn")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="licensePlate">Kennzeichen</Label>
                <Input id="licensePlate" {...register("licensePlate")} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fahrzeughistorie</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="firstRegistration">Erstzulassung</Label>
                <Input
                  id="firstRegistration"
                  type="date"
                  {...register("firstRegistration")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mileage">Kilometerstand</Label>
                <Input
                  id="mileage"
                  type="number"
                  min="0"
                  {...register("mileage")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="previousOwners">Vorbesitzer</Label>
                <Input
                  id="previousOwners"
                  type="number"
                  min="0"
                  {...register("previousOwners")}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Technik */}
        <TabsContent value="technical" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Motorisierung</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="fuelType">Kraftstoff</Label>
                <Select
                  value={watch("fuelType") || ""}
                  onValueChange={(value) => setValue("fuelType", value as FormData["fuelType"])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {fuelTypes.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transmission">Getriebe</Label>
                <Select
                  value={watch("transmission") || ""}
                  onValueChange={(value) => setValue("transmission", value as FormData["transmission"])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {transmissions.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="driveType">Antrieb</Label>
                <Select
                  value={watch("driveType") || ""}
                  onValueChange={(value) => setValue("driveType", value as FormData["driveType"])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {driveTypes.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="powerKW">Leistung (kW)</Label>
                <Input
                  id="powerKW"
                  type="number"
                  min="0"
                  {...register("powerKW")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="powerPS">Leistung (PS)</Label>
                <Input
                  id="powerPS"
                  type="number"
                  min="0"
                  {...register("powerPS")}
                  className="bg-zinc-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="displacement">Hubraum (ccm)</Label>
                <Input
                  id="displacement"
                  type="number"
                  min="0"
                  {...register("displacement")}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Karosserie</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="exteriorColor">Außenfarbe</Label>
                <Select
                  value={watch("exteriorColor") || ""}
                  onValueChange={(value) => setValue("exteriorColor", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {exteriorColors.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="interiorColor">Innenfarbe</Label>
                <Input
                  id="interiorColor"
                  placeholder="z.B. Schwarz, Beige"
                  {...register("interiorColor")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="doors">Türen</Label>
                <Select
                  value={watch("doors")?.toString() || ""}
                  onValueChange={(value) => setValue("doors", parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seats">Sitze</Label>
                <Select
                  value={watch("seats")?.toString() || ""}
                  onValueChange={(value) => setValue("seats", parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 4, 5, 6, 7, 8, 9].map((n) => (
                      <SelectItem key={n} value={n.toString()}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ausstattung */}
        <TabsContent value="equipment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ausstattung ({selectedFeatures.length} ausgewählt)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {allFeatures.map((feature) => (
                  <Badge
                    key={feature}
                    variant={selectedFeatures.includes(feature) ? "default" : "outline"}
                    className="cursor-pointer transition-colors"
                    onClick={() => toggleFeature(feature)}
                  >
                    {feature}
                    {selectedFeatures.includes(feature) && (
                      <X className="ml-1 h-3 w-3" />
                    )}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Beschreibung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Kurztitel</Label>
                <Input
                  id="title"
                  placeholder="z.B. BMW X5 xDrive40i M-Sportpaket"
                  {...register("title")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Ausführliche Beschreibung</Label>
                <textarea
                  id="description"
                  rows={6}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Detaillierte Fahrzeugbeschreibung..."
                  {...register("description")}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preis & Export */}
        <TabsContent value="price" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preise</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Einkaufspreis (€)</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  min="0"
                  step="0.01"
                  {...register("purchasePrice")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sellingPrice">Verkaufspreis (€) *</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  {...register("sellingPrice")}
                />
                {errors.sellingPrice && (
                  <p className="text-sm text-red-500">{errors.sellingPrice.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="vatType">MwSt.-Typ</Label>
                <Select
                  value={watch("vatType")}
                  onValueChange={(value) => setValue("vatType", value as FormData["vatType"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MWST">MwSt. ausweisbar</SelectItem>
                    <SelectItem value="DIFFERENZ">Differenzbesteuert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Portal-Export</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="exportMobileDE"
                  className="h-4 w-4 rounded border-gray-300"
                  {...register("exportMobileDE")}
                />
                <Label htmlFor="exportMobileDE">Für mobile.de Export markieren</Label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="exportAutoScout"
                  className="h-4 w-4 rounded border-gray-300"
                  {...register("exportAutoScout")}
                />
                <Label htmlFor="exportAutoScout">Für AutoScout24 Export markieren</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bilder */}
        <TabsContent value="images" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fahrzeugbilder</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                images={images}
                onChange={setImages}
                maxImages={20}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Aktionen */}
      <div className="flex items-center justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Abbrechen
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {vehicle ? "Speichern" : "Fahrzeug erstellen"}
        </Button>
      </div>
    </form>
  )
}

