import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"
import { hash } from "bcryptjs"

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("DATABASE_URL is not set")
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({
  adapter,
  log: ["error"],
})

async function main() {
  console.log("🌱 Seeding database...")

  // Admin User erstellen
  const adminPassword = await hash("admin123", 12)
  
  const admin = await prisma.user.upsert({
    where: { email: "admin@stmotors.de" },
    update: {},
    create: {
      email: "admin@stmotors.de",
      name: "Administrator",
      password: adminPassword,
      role: "ADMIN",
    },
  })

  console.log("✅ Admin User erstellt:", admin.email)

  // Mitarbeiter User erstellen
  const mitarbeiterPassword = await hash("mitarbeiter123", 12)
  
  const mitarbeiter = await prisma.user.upsert({
    where: { email: "mitarbeiter@stmotors.de" },
    update: {},
    create: {
      email: "mitarbeiter@stmotors.de",
      name: "Mitarbeiter",
      password: mitarbeiterPassword,
      role: "MITARBEITER",
    },
  })

  console.log("✅ Mitarbeiter User erstellt:", mitarbeiter.email)

  // ============================================
  // Blog-Beiträge erstellen
  // ============================================
  console.log("📝 Erstelle Blog-Beiträge...")

  const blogPosts = [
    {
      slug: "5-tipps-gebrauchtwagenkauf",
      title: "5 Tipps für den perfekten Gebrauchtwagenkauf",
      excerpt: "Worauf Sie beim Kauf eines gebrauchten Fahrzeugs unbedingt achten sollten. Von der Probefahrt bis zum Kaufvertrag – wir zeigen Ihnen die wichtigsten Punkte.",
      content: `
# 5 Tipps für den perfekten Gebrauchtwagenkauf

Der Kauf eines Gebrauchtwagens kann eine kluge finanzielle Entscheidung sein, birgt aber auch Risiken. Mit unseren fünf Expertentipps gehen Sie auf Nummer sicher.

## 1. Gründliche Recherche vor dem Kauf

Bevor Sie einen Händler besuchen, informieren Sie sich ausführlich über das gewünschte Modell. Recherchieren Sie:
- Typische Probleme und Schwachstellen
- Marktübliche Preise
- Unterhaltskosten (Versicherung, Steuern, Verbrauch)

## 2. Fahrzeughistorie prüfen

Ein seriöser Händler wie ST Motors stellt Ihnen alle relevanten Unterlagen zur Verfügung:
- Serviceheft mit vollständiger Wartungshistorie
- HU/AU-Berichte
- Unfallfreiheitsbescheinigung
- Vorbesitzer-Informationen

## 3. Ausführliche Probefahrt

Nehmen Sie sich Zeit für eine umfassende Probefahrt. Achten Sie auf:
- Ungewöhnliche Geräusche
- Fahrverhalten bei verschiedenen Geschwindigkeiten
- Funktion aller elektronischen Systeme
- Bremsen und Lenkung

## 4. Unabhängige Begutachtung

Bei hochpreisigen Fahrzeugen lohnt sich eine professionelle Begutachtung durch einen unabhängigen Sachverständigen. Die Kosten von 100-200€ können Sie vor teuren Überraschungen bewahren.

## 5. Kaufvertrag sorgfältig prüfen

Lesen Sie den Kaufvertrag genau durch und achten Sie auf:
- Vollständige Fahrzeugdaten
- Kilometerstand
- Garantie oder Gewährleistung
- Übergabezustand

Bei ST Motors erhalten Sie zu jedem Fahrzeug eine transparente Dokumentation und kompetente Beratung. Vereinbaren Sie noch heute einen Besichtigungstermin!
      `.trim(),
      featuredImage: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1200&h=630&fit=crop&q=80",
      status: "VEROEFFENTLICHT" as const,
      publishedAt: new Date("2026-01-03"),
    },
    {
      slug: "elektromobilitaet-zukunft-des-fahrens",
      title: "Elektromobilität – Die Zukunft des Fahrens",
      excerpt: "Alles was Sie über E-Autos, Hybrid-Fahrzeuge und nachhaltige Mobilität wissen müssen. Ein umfassender Leitfaden für den Umstieg auf elektrisches Fahren.",
      content: `
# Elektromobilität – Die Zukunft des Fahrens

Die Automobilbranche befindet sich im größten Wandel ihrer Geschichte. Elektromobilität ist nicht mehr nur Trend, sondern wird zur neuen Normalität. Wir erklären, was das für Sie bedeutet.

## Warum Elektromobilität?

### Umweltvorteile
- Keine lokalen Emissionen
- Bei Nutzung von Ökostrom nahezu CO2-neutral
- Geringere Lärmbelastung

### Wirtschaftliche Vorteile
- Niedrigere Betriebskosten (Strom vs. Benzin/Diesel)
- Geringere Wartungskosten
- Steuerliche Vorteile und Förderungen

## Reichweite – Kein Problem mehr

Moderne Elektrofahrzeuge erreichen Reichweiten von 400-600 km. Dank des wachsenden Ladenetzes und Schnellladestationen sind auch Langstrecken kein Problem mehr.

## Hybrid als Übergangslösung

Plug-in-Hybride kombinieren das Beste aus beiden Welten:
- Elektrisches Fahren im Alltag
- Verbrenner für Langstrecken
- Keine Reichweitenangst

## Ladeinfrastruktur

Das Ladenetz wächst rasant:
- Über 70.000 öffentliche Ladepunkte in Deutschland
- Wallbox für zu Hause möglich
- Schnellladung an Autobahnen (80% in 20-30 Min.)

## Unser Angebot

Bei ST Motors finden Sie eine wachsende Auswahl an Premium-Elektrofahrzeugen und Hybriden. Von Range Rover bis Porsche – entdecken Sie die Zukunft der Mobilität.

Lassen Sie sich von unseren Experten beraten!
      `.trim(),
      featuredImage: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1200&h=630&fit=crop&q=80",
      status: "VEROEFFENTLICHT" as const,
      publishedAt: new Date("2026-01-01"),
    },
    {
      slug: "premium-suv-vergleich-2026",
      title: "Premium SUV Vergleich 2026: Range Rover vs. Mercedes GLE vs. BMW X5",
      excerpt: "Der ultimative Vergleichstest der beliebtesten Premium-SUVs. Wir vergleichen Range Rover, Mercedes GLE und BMW X5 in allen wichtigen Kategorien.",
      content: `
# Premium SUV Vergleich 2026

Die Premium-SUV-Klasse ist hart umkämpft. Drei Modelle dominieren den Markt: Range Rover, Mercedes-Benz GLE und BMW X5. Wir haben sie verglichen.

## Design & Auftritt

### Range Rover
Der Range Rover setzt mit seinem ikonischen Design Maßstäbe. Die klaren Linien und die markante Front verleihen ihm eine unverwechselbare Präsenz. Neu: Die versteckten Türgriffe und das minimalistische Design.

### Mercedes-Benz GLE
Der GLE zeigt sich elegant und modern. Die fließenden Formen und der prominente Kühlergrill verkörpern die Mercedes-DNA perfekt.

### BMW X5
Dynamisch und sportlich – der X5 macht schon im Stand klar, dass er auch auf kurvigen Straßen zu Hause ist. Die große Niere und die markanten Scheinwerfer sind unverkennbar.

## Innenraum & Komfort

| Kriterium | Range Rover | Mercedes GLE | BMW X5 |
|-----------|-------------|--------------|--------|
| Materialqualität | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Platzangebot | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Infotainment | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Geräuschdämmung | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

## Fahrverhalten

**Range Rover**: Unübertroffen im Gelände, souverän auf der Straße. Das Luftfahrwerk bietet königlichen Komfort.

**Mercedes GLE**: Der Allrounder. E-Active Body Control (optional) hebt den Federungskomfort auf ein neues Level.

**BMW X5**: Der Sportlichste im Trio. Präzises Handling und agile Reaktionen machen ihn zur Fahrmaschine.

## Unser Fazit

Alle drei SUVs sind hervorragende Fahrzeuge. Die Wahl hängt von Ihren Prioritäten ab:
- **Range Rover**: Für maximalen Luxus und Geländetauglichkeit
- **Mercedes GLE**: Der ausgewogene Allrounder
- **BMW X5**: Für fahrdynamisch orientierte Käufer

Bei ST Motors finden Sie ausgewählte Exemplare aller drei Modelle. Vereinbaren Sie eine Probefahrt und erleben Sie den Unterschied!
      `.trim(),
      featuredImage: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=1200&h=630&fit=crop&q=80",
      status: "VEROEFFENTLICHT" as const,
      publishedAt: new Date("2025-12-28"),
    },
  ]

  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: post,
      create: post,
    })
    console.log(`  ✅ Blog-Beitrag erstellt: ${post.title}`)
  }

  // ============================================
  // Beispiel-Fahrzeuge erstellen
  // ============================================
  console.log("🚗 Erstelle Beispiel-Fahrzeuge...")

  const vehicles = [
    {
      slug: "range-rover-sport-p400-hse",
      manufacturer: "Land Rover",
      model: "Range Rover Sport",
      variant: "P400 HSE Dynamic",
      vehicleType: "SUV" as const,
      condition: "GEBRAUCHT" as const,
      status: "AKTIV" as const,
      firstRegistration: new Date("2023-03-15"),
      mileage: 28500,
      fuelType: "BENZIN" as const,
      transmission: "AUTOMATIK" as const,
      powerKW: 294,
      powerPS: 400,
      displacement: 2996,
      driveType: "ALLRAD" as const,
      exteriorColor: "Santorini Schwarz Metallic",
      interiorColor: "Ebony/Ebony",
      doors: 5,
      seats: 5,
      features: [
        "Panorama-Glasdach",
        "Meridian Surround Sound",
        "Matrix LED Scheinwerfer",
        "Luftfederung",
        "Head-Up Display",
        "360° Kamera",
        "Standheizung",
        "Memory-Sitze",
        "Lederausstattung",
        "Navigation Professional",
      ],
      sellingPrice: 89900,
      vatType: "MWST" as const,
      title: "Range Rover Sport P400 HSE Dynamic",
      description: "Traumhafter Range Rover Sport in Santorini Schwarz mit Top-Ausstattung. Das Fahrzeug befindet sich in einem einwandfreien Zustand und wurde ausschließlich bei Land Rover gewartet. Vollständige Servicehistorie vorhanden.",
      imageUrl: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop&q=80",
    },
    {
      slug: "mercedes-benz-gle-400d-amg-line",
      manufacturer: "Mercedes-Benz",
      model: "GLE 400 d",
      variant: "4MATIC AMG Line",
      vehicleType: "SUV" as const,
      condition: "GEBRAUCHT" as const,
      status: "AKTIV" as const,
      firstRegistration: new Date("2022-08-20"),
      mileage: 42000,
      fuelType: "DIESEL" as const,
      transmission: "AUTOMATIK" as const,
      powerKW: 243,
      powerPS: 330,
      displacement: 2925,
      driveType: "ALLRAD" as const,
      exteriorColor: "Polarweiß",
      interiorColor: "Schwarz",
      doors: 5,
      seats: 5,
      features: [
        "AMG Line Exterieur",
        "AMG Line Interieur",
        "MBUX mit Navigation",
        "Burmester Surround",
        "LED Intelligent Light",
        "Luftfederung AIRMATIC",
        "Fahrassistenz-Paket",
        "Panorama-Schiebedach",
        "Sitzheizung vorne & hinten",
        "Anhängerkupplung",
      ],
      sellingPrice: 72900,
      vatType: "MWST" as const,
      title: "Mercedes-Benz GLE 400 d 4MATIC AMG Line",
      description: "Eleganter Mercedes GLE in Polarweiß mit vollständiger AMG Line Ausstattung. Durchgehende Mercedes-Historie. Nichtraucherfahrzeug aus erster Hand.",
      imageUrl: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop&q=80",
    },
    {
      slug: "bmw-x5-xdrive40d-m-sport",
      manufacturer: "BMW",
      model: "X5",
      variant: "xDrive40d M Sport",
      vehicleType: "SUV" as const,
      condition: "GEBRAUCHT" as const,
      status: "AKTIV" as const,
      firstRegistration: new Date("2023-01-10"),
      mileage: 35800,
      fuelType: "DIESEL" as const,
      transmission: "AUTOMATIK" as const,
      powerKW: 250,
      powerPS: 340,
      displacement: 2993,
      driveType: "ALLRAD" as const,
      exteriorColor: "Phytonic Blau Metallic",
      interiorColor: "Cognac Vernasca Leder",
      doors: 5,
      seats: 5,
      features: [
        "M Sportpaket",
        "M Sportbremsen",
        "Laserlicht",
        "Driving Assistant Professional",
        "Parking Assistant Plus",
        "Harman Kardon",
        "Live Cockpit Professional",
        "Luftfederung",
        "Komfortsitze",
        "Sky Lounge Panoramadach",
      ],
      sellingPrice: 79900,
      vatType: "MWST" as const,
      title: "BMW X5 xDrive40d M Sport",
      description: "Sportlicher BMW X5 in seltener Farbkombination Phytonic Blau mit Cognac Leder. Vollausstattung inklusive M Sportpaket und Sky Lounge Panoramadach. Scheckheftgepflegt.",
      imageUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop&q=80",
    },
    {
      slug: "audi-q7-55-tfsi-quattro-s-line",
      manufacturer: "Audi",
      model: "Q7",
      variant: "55 TFSI quattro S line",
      vehicleType: "SUV" as const,
      condition: "GEBRAUCHT" as const,
      status: "AKTIV" as const,
      firstRegistration: new Date("2022-05-25"),
      mileage: 51200,
      fuelType: "BENZIN" as const,
      transmission: "AUTOMATIK" as const,
      powerKW: 250,
      powerPS: 340,
      displacement: 2995,
      driveType: "ALLRAD" as const,
      exteriorColor: "Daytonagrau Metallic",
      interiorColor: "Schwarz/Felsgrau",
      doors: 5,
      seats: 7,
      features: [
        "S line Exterieur",
        "S line Interieur",
        "Matrix LED",
        "MMI Navigation plus",
        "Bang & Olufsen 3D Sound",
        "Adaptive Luftfederung",
        "Assistenzpaket Stadt",
        "Assistenzpaket Tour",
        "Virtual Cockpit Plus",
        "7-Sitzer",
      ],
      sellingPrice: 67900,
      vatType: "MWST" as const,
      title: "Audi Q7 55 TFSI quattro S line 7-Sitzer",
      description: "Geräumiger Audi Q7 als praktischer 7-Sitzer in Daytonagrau. Perfekt für die Familie mit umfangreicher S line Ausstattung und allen wichtigen Assistenzsystemen.",
      imageUrl: "https://images.unsplash.com/photo-1606664438807-d0de45a2b00b?w=800&h=600&fit=crop&q=80",
    },
    {
      slug: "porsche-cayenne-e-hybrid-coupe",
      manufacturer: "Porsche",
      model: "Cayenne E-Hybrid",
      variant: "Coupé",
      vehicleType: "SUV" as const,
      condition: "GEBRAUCHT" as const,
      status: "AKTIV" as const,
      firstRegistration: new Date("2023-06-01"),
      mileage: 18500,
      fuelType: "HYBRID" as const,
      transmission: "AUTOMATIK" as const,
      powerKW: 340,
      powerPS: 462,
      displacement: 2995,
      driveType: "ALLRAD" as const,
      exteriorColor: "Karminrot",
      interiorColor: "Schwarz",
      doors: 5,
      seats: 4,
      features: [
        "SportDesign Paket",
        "Sport Chrono Paket",
        "PASM Luftfederung",
        "Matrix LED mit PDLS Plus",
        "Bose Surround Sound",
        "Head-Up Display",
        "Lane Keeping Assist",
        "Panoramadach",
        "Porsche InnoDrive",
        "21 Zoll RS Spyder Design Felgen",
      ],
      sellingPrice: 109900,
      vatType: "MWST" as const,
      title: "Porsche Cayenne E-Hybrid Coupé",
      description: "Atemberaubender Porsche Cayenne E-Hybrid Coupé in Karminrot. Die perfekte Kombination aus Sportlichkeit und Effizienz. Nur 18.500 km, Erstbesitz, Porsche Scheckheft.",
      imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop&q=80",
    },
    {
      slug: "vw-touareg-r-line-v6-tdi",
      manufacturer: "Volkswagen",
      model: "Touareg",
      variant: "3.0 V6 TDI R-Line",
      vehicleType: "SUV" as const,
      condition: "GEBRAUCHT" as const,
      status: "AKTIV" as const,
      firstRegistration: new Date("2022-11-12"),
      mileage: 48700,
      fuelType: "DIESEL" as const,
      transmission: "AUTOMATIK" as const,
      powerKW: 210,
      powerPS: 286,
      displacement: 2967,
      driveType: "ALLRAD" as const,
      exteriorColor: "Aquamarinblau Metallic",
      interiorColor: "Titan Schwarz",
      doors: 5,
      seats: 5,
      features: [
        "R-Line Exterieur",
        "R-Line Interieur",
        "IQ.Light Matrix LED",
        "Innovision Cockpit",
        "Luftfederung",
        "Dynaudio Soundsystem",
        "Travel Assist",
        "Park Assist Plus",
        "Night Vision",
        "Anhängerassistent",
      ],
      sellingPrice: 54900,
      vatType: "MWST" as const,
      title: "VW Touareg V6 TDI R-Line",
      description: "Volkswagen Touareg in der begehrten R-Line Ausstattung. Souveräner Reisekomfort dank Luftfederung und modernster Assistenzsysteme. Attraktives Preis-Leistungs-Verhältnis.",
      imageUrl: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop&q=80",
    },
  ]

  for (const vehicleData of vehicles) {
    const { imageUrl, ...vehicle } = vehicleData
    
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { slug: vehicle.slug },
    })

    if (existingVehicle) {
      await prisma.vehicle.update({
        where: { slug: vehicle.slug },
        data: {
          ...vehicle,
          createdById: admin.id,
        },
      })
      // Update image
      await prisma.vehicleImage.deleteMany({
        where: { vehicleId: existingVehicle.id },
      })
      await prisma.vehicleImage.create({
        data: {
          url: imageUrl,
          order: 0,
          vehicleId: existingVehicle.id,
        },
      })
    } else {
      const createdVehicle = await prisma.vehicle.create({
        data: {
          ...vehicle,
          createdById: admin.id,
        },
      })
      await prisma.vehicleImage.create({
        data: {
          url: imageUrl,
          order: 0,
          vehicleId: createdVehicle.id,
        },
      })
    }
    
    console.log(`  ✅ Fahrzeug erstellt: ${vehicle.title}`)
  }

  console.log("")
  console.log("🎉 Seeding abgeschlossen!")
  console.log("")
  console.log("Login-Daten:")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log("Admin:       admin@stmotors.de / admin123")
  console.log("Mitarbeiter: mitarbeiter@stmotors.de / mitarbeiter123")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log("")
  console.log("📊 Erstellte Inhalte:")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log(`  📝 ${blogPosts.length} Blog-Beiträge`)
  console.log(`  🚗 ${vehicles.length} Fahrzeuge`)
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
}

main()
  .then(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    await pool.end()
    process.exit(1)
  })
