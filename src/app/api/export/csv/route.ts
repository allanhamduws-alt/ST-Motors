import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// mobile.de CSV Format Header
const MOBILE_DE_HEADERS = [
  "Fahrzeugnummer",
  "Hersteller",
  "Modell",
  "Variante",
  "Fahrzeugtyp",
  "Zustand",
  "Preis",
  "MwSt",
  "Erstzulassung",
  "Kilometerstand",
  "Kraftstoff",
  "Getriebe",
  "Leistung_KW",
  "Leistung_PS",
  "Hubraum",
  "Antrieb",
  "Außenfarbe",
  "Innenfarbe",
  "Türen",
  "Sitze",
  "Vorbesitzer",
  "FIN",
  "HSN",
  "TSN",
  "Kurztitel",
  "Beschreibung",
  "Ausstattung",
  "Bild1",
  "Bild2",
  "Bild3",
  "Bild4",
  "Bild5",
  "Bild6",
  "Bild7",
  "Bild8",
  "Bild9",
  "Bild10",
]

// AutoScout24 CSV Format Header
const AUTOSCOUT_HEADERS = [
  "dealer_vehicle_id",
  "make",
  "model",
  "model_variant",
  "category",
  "condition",
  "price",
  "vat",
  "first_registration_year",
  "first_registration_month",
  "mileage",
  "fuel_type",
  "gearbox",
  "power_kw",
  "power_hp",
  "cubic_capacity",
  "drive_type",
  "exterior_color",
  "interior_color",
  "doors",
  "seats",
  "previous_owners",
  "vin",
  "title",
  "description",
  "equipment",
  "image_url_1",
  "image_url_2",
  "image_url_3",
  "image_url_4",
  "image_url_5",
  "image_url_6",
  "image_url_7",
  "image_url_8",
  "image_url_9",
  "image_url_10",
]

// Mapping für Kraftstoff
const FUEL_TYPE_MAP: Record<string, { mobile: string; autoscout: string }> = {
  BENZIN: { mobile: "Benzin", autoscout: "Petrol" },
  DIESEL: { mobile: "Diesel", autoscout: "Diesel" },
  ELEKTRO: { mobile: "Elektro", autoscout: "Electric" },
  HYBRID: { mobile: "Hybrid", autoscout: "Hybrid" },
  LPG: { mobile: "LPG", autoscout: "LPG" },
}

// Mapping für Getriebe
const TRANSMISSION_MAP: Record<string, { mobile: string; autoscout: string }> = {
  AUTOMATIK: { mobile: "Automatik", autoscout: "Automatic" },
  MANUELL: { mobile: "Schaltgetriebe", autoscout: "Manual" },
}

// Mapping für Fahrzeugtyp
const VEHICLE_TYPE_MAP: Record<string, { mobile: string; autoscout: string }> = {
  PKW: { mobile: "Limousine", autoscout: "Sedan" },
  SUV: { mobile: "SUV/Geländewagen", autoscout: "SUV" },
  KOMBI: { mobile: "Kombi", autoscout: "Station wagon" },
  COUPE: { mobile: "Coupé", autoscout: "Coupe" },
  CABRIO: { mobile: "Cabrio", autoscout: "Convertible" },
  LIMOUSINE: { mobile: "Limousine", autoscout: "Sedan" },
  VAN: { mobile: "Van/Kleinbus", autoscout: "Van" },
}

// Mapping für Zustand
const CONDITION_MAP: Record<string, { mobile: string; autoscout: string }> = {
  NEU: { mobile: "Neufahrzeug", autoscout: "New" },
  GEBRAUCHT: { mobile: "Gebraucht", autoscout: "Used" },
  JAHRESWAGEN: { mobile: "Jahreswagen", autoscout: "Used" },
  VORFUEHRWAGEN: { mobile: "Vorführfahrzeug", autoscout: "Demonstration" },
}

// Mapping für Antrieb
const DRIVE_TYPE_MAP: Record<string, { mobile: string; autoscout: string }> = {
  FRONT: { mobile: "Vorderrad", autoscout: "Front" },
  HECK: { mobile: "Hinterrad", autoscout: "Rear" },
  ALLRAD: { mobile: "Allrad", autoscout: "4WD" },
}

// CSV escapen
function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ""
  const str = String(value)
  if (str.includes(";") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

// Datum formatieren für mobile.de (MM.YYYY)
function formatDateMobile(date: Date | null): string {
  if (!date) return ""
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()
  return `${month}.${year}`
}

// Datum formatieren für AutoScout24 (Jahr und Monat getrennt)
function formatDateAutoScout(date: Date | null): { year: string; month: string } {
  if (!date) return { year: "", month: "" }
  return {
    year: String(date.getFullYear()),
    month: String(date.getMonth() + 1).padStart(2, "0"),
  }
}

export async function GET(req: NextRequest) {
  try {
    // Auth prüfen
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 })
    }

    // Query Parameter
    const { searchParams } = new URL(req.url)
    const format = searchParams.get("format") || "mobile" // "mobile" oder "autoscout"
    const vehicleIds = searchParams.get("ids")?.split(",").filter(Boolean) || []

    // Fahrzeuge abrufen (nur aktive, oder spezifische IDs)
    const whereClause = vehicleIds.length > 0 
      ? { id: { in: vehicleIds } }
      : { status: "AKTIV" as const }

    const vehicles = await db.vehicle.findMany({
      where: whereClause,
      include: {
        images: {
          orderBy: { order: "asc" },
          take: 10,
        },
      },
      orderBy: { vehicleNumber: "asc" },
    })

    if (vehicles.length === 0) {
      return NextResponse.json(
        { error: "Keine Fahrzeuge zum Exportieren gefunden" },
        { status: 404 }
      )
    }

    let csvContent: string
    let filename: string

    if (format === "autoscout") {
      // AutoScout24 Format
      csvContent = generateAutoScoutCSV(vehicles)
      filename = `st-motors-autoscout24-${new Date().toISOString().split("T")[0]}.csv`
    } else {
      // mobile.de Format (Default)
      csvContent = generateMobileDeCSV(vehicles)
      filename = `st-motors-mobile-de-${new Date().toISOString().split("T")[0]}.csv`
    }

    // Response mit CSV
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("CSV Export Error:", error)
    return NextResponse.json(
      { error: "Fehler beim Erstellen des CSV-Exports" },
      { status: 500 }
    )
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateMobileDeCSV(vehicles: any[]): string {
  const rows = [MOBILE_DE_HEADERS.join(";")]

  for (const vehicle of vehicles) {
    const images = vehicle.images || []
    const row = [
      vehicle.vehicleNumber,
      vehicle.manufacturer,
      vehicle.model,
      vehicle.variant || "",
      VEHICLE_TYPE_MAP[vehicle.vehicleType]?.mobile || vehicle.vehicleType,
      CONDITION_MAP[vehicle.condition]?.mobile || vehicle.condition,
      Number(vehicle.sellingPrice),
      vehicle.vatType === "MWST" ? "MwSt. ausweisbar" : "Differenzbesteuert",
      formatDateMobile(vehicle.firstRegistration),
      vehicle.mileage,
      FUEL_TYPE_MAP[vehicle.fuelType]?.mobile || "",
      TRANSMISSION_MAP[vehicle.transmission]?.mobile || "",
      vehicle.powerKW || "",
      vehicle.powerPS || "",
      vehicle.displacement || "",
      DRIVE_TYPE_MAP[vehicle.driveType]?.mobile || "",
      vehicle.exteriorColor || "",
      vehicle.interiorColor || "",
      vehicle.doors || "",
      vehicle.seats || "",
      vehicle.previousOwners || 0,
      vehicle.vin || "",
      vehicle.hsn || "",
      vehicle.tsn || "",
      vehicle.title || `${vehicle.manufacturer} ${vehicle.model}`,
      (vehicle.description || "").replace(/\n/g, " "),
      (vehicle.features || []).join(", "),
      images[0]?.url || "",
      images[1]?.url || "",
      images[2]?.url || "",
      images[3]?.url || "",
      images[4]?.url || "",
      images[5]?.url || "",
      images[6]?.url || "",
      images[7]?.url || "",
      images[8]?.url || "",
      images[9]?.url || "",
    ]

    rows.push(row.map(escapeCSV).join(";"))
  }

  // BOM für Excel UTF-8 Kompatibilität
  return "\uFEFF" + rows.join("\n")
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateAutoScoutCSV(vehicles: any[]): string {
  const rows = [AUTOSCOUT_HEADERS.join(";")]

  for (const vehicle of vehicles) {
    const images = vehicle.images || []
    const regDate = formatDateAutoScout(vehicle.firstRegistration)
    
    const row = [
      vehicle.vehicleNumber,
      vehicle.manufacturer,
      vehicle.model,
      vehicle.variant || "",
      VEHICLE_TYPE_MAP[vehicle.vehicleType]?.autoscout || vehicle.vehicleType,
      CONDITION_MAP[vehicle.condition]?.autoscout || vehicle.condition,
      Number(vehicle.sellingPrice),
      vehicle.vatType === "MWST" ? "1" : "0",
      regDate.year,
      regDate.month,
      vehicle.mileage,
      FUEL_TYPE_MAP[vehicle.fuelType]?.autoscout || "",
      TRANSMISSION_MAP[vehicle.transmission]?.autoscout || "",
      vehicle.powerKW || "",
      vehicle.powerPS || "",
      vehicle.displacement || "",
      DRIVE_TYPE_MAP[vehicle.driveType]?.autoscout || "",
      vehicle.exteriorColor || "",
      vehicle.interiorColor || "",
      vehicle.doors || "",
      vehicle.seats || "",
      vehicle.previousOwners || 0,
      vehicle.vin || "",
      vehicle.title || `${vehicle.manufacturer} ${vehicle.model}`,
      (vehicle.description || "").replace(/\n/g, " "),
      (vehicle.features || []).join(", "),
      images[0]?.url || "",
      images[1]?.url || "",
      images[2]?.url || "",
      images[3]?.url || "",
      images[4]?.url || "",
      images[5]?.url || "",
      images[6]?.url || "",
      images[7]?.url || "",
      images[8]?.url || "",
      images[9]?.url || "",
    ]

    rows.push(row.map(escapeCSV).join(";"))
  }

  // BOM für Excel UTF-8 Kompatibilität
  return "\uFEFF" + rows.join("\n")
}

