import { notFound } from "next/navigation"
import Link from "next/link"
import { Metadata } from "next"
import {
  Calendar,
  Gauge,
  Fuel,
  Cog,
  Car,
  Palette,
  Users,
  ArrowLeft,
  Phone,
  Mail,
  CheckCircle,
  Shield,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { VehicleGallery } from "@/components/vehicles/VehicleGallery"
import { VehicleInquiryForm } from "@/components/vehicles/VehicleInquiryForm"
import { VehicleJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd"
import { db } from "@/lib/db"

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://stmotors.de"

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getVehicle(slug: string) {
  try {
    const vehicle = await db.vehicle.findUnique({
      where: { slug },
      include: {
        images: {
          orderBy: { order: "asc" },
        },
      },
    })
    return vehicle
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const vehicle = await getVehicle(slug)

  if (!vehicle) {
    return { title: "Fahrzeug nicht gefunden" }
  }

  const title = vehicle.title || `${vehicle.manufacturer} ${vehicle.model}`
  const price = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(Number(vehicle.sellingPrice))

  const description = vehicle.description 
    ? vehicle.description.substring(0, 160) 
    : `${title} - ${price} - ${vehicle.mileage.toLocaleString("de-DE")} km - Jetzt bei ST Motors in Lilienthal kaufen`
  
  const images = vehicle.images?.length > 0 
    ? vehicle.images.map(img => img.url) 
    : [`${baseUrl}/images/og-image.jpg`]

  return {
    title: `${title} | ${price}`,
    description,
    alternates: {
      canonical: `${baseUrl}/fahrzeuge/${slug}`,
    },
    openGraph: {
      title: `${title} - ${price}`,
      description,
      type: "website",
      url: `${baseUrl}/fahrzeuge/${slug}`,
      images: images.slice(0, 4).map((url) => ({
        url,
        width: 1200,
        height: 630,
        alt: title,
      })),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} - ${price}`,
      description,
      images: images.slice(0, 1),
    },
  }
}

const fuelTypeLabels: Record<string, string> = {
  BENZIN: "Benzin",
  DIESEL: "Diesel",
  ELEKTRO: "Elektro",
  HYBRID: "Hybrid",
  LPG: "LPG",
}

const transmissionLabels: Record<string, string> = {
  AUTOMATIK: "Automatik",
  MANUELL: "Schaltgetriebe",
}

const vehicleTypeLabels: Record<string, string> = {
  PKW: "PKW",
  SUV: "SUV",
  KOMBI: "Kombi",
  COUPE: "Coupé",
  CABRIO: "Cabrio",
  LIMOUSINE: "Limousine",
  VAN: "Van",
}

const conditionLabels: Record<string, string> = {
  NEU: "Neuwagen",
  GEBRAUCHT: "Gebrauchtwagen",
  JAHRESWAGEN: "Jahreswagen",
  VORFUEHRWAGEN: "Vorführwagen",
}

const driveTypeLabels: Record<string, string> = {
  FRONT: "Frontantrieb",
  HECK: "Heckantrieb",
  ALLRAD: "Allradantrieb",
}

export default async function VehicleDetailPage({ params }: PageProps) {
  const { slug } = await params
  const vehicle = await getVehicle(slug)

  if (!vehicle || vehicle.status === "ENTWURF") {
    notFound()
  }

  const price = Number(vehicle.sellingPrice)
  const formatPrice = (p: number) =>
    new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    }).format(p)

  const formatMileage = (km: number) =>
    new Intl.NumberFormat("de-DE").format(km) + " km"

  const formatDate = (date: Date | null) => {
    if (!date) return "-"
    const d = new Date(date)
    return `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
  }

  const vehicleTitle =
    vehicle.title || `${vehicle.manufacturer} ${vehicle.model}`

  const specs = [
    {
      icon: Calendar,
      label: "Erstzulassung",
      value: formatDate(vehicle.firstRegistration),
    },
    { icon: Gauge, label: "Kilometerstand", value: formatMileage(vehicle.mileage) },
    {
      icon: Fuel,
      label: "Kraftstoff",
      value: vehicle.fuelType ? fuelTypeLabels[vehicle.fuelType] : "-",
    },
    {
      icon: Cog,
      label: "Getriebe",
      value: vehicle.transmission ? transmissionLabels[vehicle.transmission] : "-",
    },
    {
      icon: Car,
      label: "Fahrzeugtyp",
      value: vehicleTypeLabels[vehicle.vehicleType] || vehicle.vehicleType,
    },
    {
      icon: Palette,
      label: "Außenfarbe",
      value: vehicle.exteriorColor || "-",
    },
  ]

  const technicalSpecs = [
    { label: "Leistung", value: vehicle.powerPS ? `${vehicle.powerPS} PS (${vehicle.powerKW} kW)` : "-" },
    { label: "Hubraum", value: vehicle.displacement ? `${vehicle.displacement} ccm` : "-" },
    { label: "Antrieb", value: vehicle.driveType ? driveTypeLabels[vehicle.driveType] : "-" },
    { label: "Türen", value: vehicle.doors?.toString() || "-" },
    { label: "Sitze", value: vehicle.seats?.toString() || "-" },
    { label: "Innenfarbe", value: vehicle.interiorColor || "-" },
    { label: "Vorbesitzer", value: vehicle.previousOwners.toString() },
    { label: "Zustand", value: conditionLabels[vehicle.condition] },
    { label: "HSN/TSN", value: vehicle.hsn && vehicle.tsn ? `${vehicle.hsn}/${vehicle.tsn}` : "-" },
  ]

  // Prepare data for JSON-LD
  const vehicleYear = vehicle.firstRegistration 
    ? new Date(vehicle.firstRegistration).getFullYear() 
    : undefined

  const fuelTypeMap: Record<string, string> = {
    BENZIN: "Gasoline",
    DIESEL: "Diesel",
    ELEKTRO: "Electric",
    HYBRID: "Hybrid",
    LPG: "LPG",
  }

  const transmissionMap: Record<string, string> = {
    AUTOMATIK: "AutomaticTransmission",
    MANUELL: "ManualTransmission",
  }

  return (
    <>
      {/* Structured Data */}
      <VehicleJsonLd
        name={vehicleTitle}
        description={vehicle.description || `${vehicleTitle} - Jetzt bei ST Motors`}
        image={vehicle.images.map((img) => img.url)}
        url={`${baseUrl}/fahrzeuge/${vehicle.slug}`}
        price={price}
        manufacturer={vehicle.manufacturer}
        model={vehicle.model}
        variant={vehicle.variant || undefined}
        mileage={vehicle.mileage}
        year={vehicleYear}
        fuelType={vehicle.fuelType ? fuelTypeMap[vehicle.fuelType] : undefined}
        transmission={vehicle.transmission ? transmissionMap[vehicle.transmission] : undefined}
        color={vehicle.exteriorColor || undefined}
        vin={vehicle.vin || undefined}
        condition={vehicle.condition === "NEU" ? "NewCondition" : "UsedCondition"}
        availability={vehicle.status === "AKTIV" ? "InStock" : "OutOfStock"}
        seller={{
          name: "ST Motors GmbH",
          url: baseUrl,
        }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Startseite", url: baseUrl },
          { name: "Fahrzeuge", url: `${baseUrl}/fahrzeuge` },
          { name: vehicleTitle, url: `${baseUrl}/fahrzeuge/${vehicle.slug}` },
        ]}
      />

      <div className="min-h-screen bg-secondary/30">
        {/* Back Link */}
        <div className="bg-white border-b">
          <div className="container-custom py-4">
            <Link
              href="/fahrzeuge"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Zurück zur Übersicht
            </Link>
          </div>
        </div>

      <div className="container-custom py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Gallery & Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            <VehicleGallery
              images={vehicle.images.map((img) => img.url)}
              title={vehicleTitle}
            />

            {/* Title & Quick Specs (Mobile) */}
            <div className="lg:hidden">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                {/* Status Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {vehicle.status === "RESERVIERT" && (
                    <Badge className="bg-amber-500">Reserviert</Badge>
                  )}
                  <Badge variant="secondary">
                    {vehicle.vatType === "MWST"
                      ? "MwSt. ausweisbar"
                      : "Differenzbesteuert"}
                  </Badge>
                </div>

                <h1 className="font-display text-2xl font-bold mb-2">
                  {vehicleTitle}
                </h1>
                {vehicle.variant && (
                  <p className="text-muted-foreground mb-4">{vehicle.variant}</p>
                )}
                <div className="text-3xl font-display font-bold text-primary">
                  {formatPrice(price)}
                </div>
              </div>
            </div>

            {/* Quick Specs Grid */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {specs.map((spec) => (
                    <div key={spec.label} className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                        <spec.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">
                          {spec.label}
                        </div>
                        <div className="font-medium">{spec.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {vehicle.description && (
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Beschreibung
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    {vehicle.description.split("\n").map((paragraph, index) => (
                      <p key={index} className="text-muted-foreground">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Features */}
            {vehicle.features && vehicle.features.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Ausstattung
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {vehicle.features.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-center gap-2 text-sm"
                      >
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Technical Specs */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cog className="h-5 w-5" />
                  Technische Daten
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {technicalSpecs.map((spec) => (
                    <div key={spec.label} className="py-2">
                      <div className="text-sm text-muted-foreground">
                        {spec.label}
                      </div>
                      <div className="font-medium">{spec.value}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Price & Contact */}
          <div className="space-y-6">
            {/* Price Card (Desktop) */}
            <Card className="hidden lg:block border-0 shadow-lg sticky top-24">
              <CardContent className="p-6">
                {/* Status Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {vehicle.status === "RESERVIERT" && (
                    <Badge className="bg-amber-500">Reserviert</Badge>
                  )}
                  <Badge variant="secondary">
                    {vehicle.vatType === "MWST"
                      ? "MwSt. ausweisbar"
                      : "Differenzbesteuert"}
                  </Badge>
                </div>

                <h1 className="font-display text-2xl font-bold mb-2">
                  {vehicleTitle}
                </h1>
                {vehicle.variant && (
                  <p className="text-muted-foreground mb-4">{vehicle.variant}</p>
                )}

                <Separator className="my-4" />

                <div className="text-4xl font-display font-bold text-primary mb-6">
                  {formatPrice(price)}
                </div>

                {/* Quick Contact */}
                <div className="space-y-3">
                  <Button asChild className="w-full h-12 text-base" size="lg">
                    <a href="tel:+4942989099069">
                      <Phone className="mr-2 h-5 w-5" />
                      Anrufen
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full h-12 text-base"
                    size="lg"
                  >
                    <a href="mailto:info@stmotors.de">
                      <Mail className="mr-2 h-5 w-5" />
                      E-Mail senden
                    </a>
                  </Button>
                </div>

                <Separator className="my-6" />

                {/* Trust Signals */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span>Geprüfte Fahrzeughistorie</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Finanzierung möglich</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Inzahlungnahme möglich</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inquiry Form */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Anfrage senden</CardTitle>
              </CardHeader>
              <CardContent>
                <VehicleInquiryForm
                  vehicleId={vehicle.id}
                  vehicleTitle={vehicleTitle}
                />
              </CardContent>
            </Card>

            {/* Contact Card */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Kontakt</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <div className="font-medium">Telefon</div>
                      <a
                        href="tel:+4942989099069"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        +49 4298 9099069
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <div className="font-medium">E-Mail</div>
                      <a
                        href="mailto:info@stmotors.de"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        info@stmotors.de
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Fixed CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg z-50">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-2xl font-display font-bold text-primary">
              {formatPrice(price)}
            </div>
          </div>
          <Button asChild size="lg" className="h-12 px-6">
            <a href="tel:+4942989099069">
              <Phone className="mr-2 h-5 w-5" />
              Anrufen
            </a>
          </Button>
        </div>
      </div>
      </div>
    </>
  )
}

