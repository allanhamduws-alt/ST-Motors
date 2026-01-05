import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { jsPDF } from "jspdf"

// Deutsche Texte
const formatDate = (date: Date | null) => {
  if (!date) return "-"
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date))
}

const formatCurrency = (amount: number | { toNumber: () => number } | null) => {
  if (amount === null) return "-"
  const num = typeof amount === "number" ? amount : amount.toNumber()
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(num)
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Auth prüfen
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 })
    }

    const { id } = await params

    // Vertrag mit allen Relationen laden
    const contract = await db.contract.findUnique({
      where: { id },
      include: {
        customer: true,
        vehicle: {
          include: {
            images: {
              orderBy: { order: "asc" },
              take: 1,
            },
          },
        },
        createdBy: {
          select: { name: true },
        },
      },
    })

    if (!contract) {
      return NextResponse.json({ error: "Vertrag nicht gefunden" }, { status: 404 })
    }

    // PDF erstellen
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    const contentWidth = pageWidth - 2 * margin
    let y = margin

    // Firmendaten
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text("ST Motors GmbH", margin, y)
    y += 8

    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(100)
    doc.text("Am Wolfsberg 4 | 28865 Lilienthal | Tel: +49 4298 9099069", margin, y)
    y += 15

    // Vertragstyp Titel
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(0)
    const contractTitle = contract.type === "KAUFVERTRAG" ? "KAUFVERTRAG" : "ANKAUFVERTRAG"
    doc.text(contractTitle, margin, y)
    
    // Vertragsnummer rechts
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`Nr. ${contract.contractNumber}`, pageWidth - margin, y, { align: "right" })
    y += 15

    // Horizontale Linie
    doc.setDrawColor(200)
    doc.line(margin, y, pageWidth - margin, y)
    y += 10

    // Zwei-Spalten Layout für Vertragsparteien
    const colWidth = (contentWidth - 10) / 2

    // Verkäufer (Links)
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    const sellerLabel = contract.type === "KAUFVERTRAG" ? "Verkäufer" : "Käufer"
    doc.text(sellerLabel, margin, y)
    
    // Käufer (Rechts)
    const buyerLabel = contract.type === "KAUFVERTRAG" ? "Käufer" : "Verkäufer"
    doc.text(buyerLabel, margin + colWidth + 10, y)
    y += 6

    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)

    // Verkäufer Details
    doc.text("ST Motors GmbH", margin, y)
    y += 4
    doc.text("Am Wolfsberg 4", margin, y)
    y += 4
    doc.text("28865 Lilienthal", margin, y)
    y += 4
    doc.text("Tel: +49 4298 9099069", margin, y)

    // Käufer Details (auf gleicher Höhe)
    let yBuyer = y - 12
    const customer = contract.customer
    if (customer.company) {
      doc.text(customer.company, margin + colWidth + 10, yBuyer)
      yBuyer += 4
    }
    const fullName = [customer.salutation, customer.firstName, customer.lastName].filter(Boolean).join(" ")
    doc.text(fullName, margin + colWidth + 10, yBuyer)
    yBuyer += 4
    if (customer.street) {
      doc.text(customer.street, margin + colWidth + 10, yBuyer)
      yBuyer += 4
    }
    if (customer.zipCode && customer.city) {
      doc.text(`${customer.zipCode} ${customer.city}`, margin + colWidth + 10, yBuyer)
      yBuyer += 4
    }
    if (customer.phone) {
      doc.text(`Tel: ${customer.phone}`, margin + colWidth + 10, yBuyer)
    }

    y += 15

    // Horizontale Linie
    doc.setDrawColor(200)
    doc.line(margin, y, pageWidth - margin, y)
    y += 10

    // Fahrzeugdaten
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Fahrzeugdaten", margin, y)
    y += 8

    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")

    const vehicle = contract.vehicle
    const vehicleData = [
      ["Hersteller / Modell", `${vehicle.manufacturer} ${vehicle.model}${vehicle.variant ? ` ${vehicle.variant}` : ""}`],
      ["Fahrzeug-ID-Nr. (FIN)", vehicle.vin || "-"],
      ["HSN / TSN", `${vehicle.hsn || "-"} / ${vehicle.tsn || "-"}`],
      ["Kennzeichen", vehicle.licensePlate || "-"],
      ["Erstzulassung", formatDate(vehicle.firstRegistration)],
      ["Kilometerstand", vehicle.mileage ? `${vehicle.mileage.toLocaleString("de-DE")} km` : "-"],
      ["Kraftstoff", vehicle.fuelType || "-"],
      ["Getriebe", vehicle.transmission === "AUTOMATIK" ? "Automatik" : vehicle.transmission === "MANUELL" ? "Schaltgetriebe" : "-"],
      ["Leistung", vehicle.powerKW ? `${vehicle.powerKW} kW / ${vehicle.powerPS} PS` : "-"],
      ["Farbe außen", vehicle.exteriorColor || "-"],
      ["Vorbesitzer", vehicle.previousOwners?.toString() || "0"],
    ]

    for (const [label, value] of vehicleData) {
      doc.setFont("helvetica", "bold")
      doc.text(label + ":", margin, y)
      doc.setFont("helvetica", "normal")
      doc.text(value, margin + 50, y)
      y += 5
    }

    y += 10

    // Horizontale Linie
    doc.setDrawColor(200)
    doc.line(margin, y, pageWidth - margin, y)
    y += 10

    // Kaufpreis
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Kaufpreis", margin, y)
    y += 8

    doc.setFontSize(10)
    const priceData = [
      ["Netto", formatCurrency(contract.priceNet)],
      ["MwSt. (19%)", formatCurrency(contract.vat)],
      ["Brutto", formatCurrency(contract.priceGross)],
    ]

    if (Number(contract.deposit) > 0) {
      priceData.push(["Anzahlung", formatCurrency(contract.deposit)])
    }

    for (const [label, value] of priceData) {
      doc.setFont("helvetica", "normal")
      doc.text(label + ":", margin, y)
      doc.setFont("helvetica", "bold")
      doc.text(value, margin + 50, y)
      y += 6
    }

    // MwSt Hinweis
    y += 2
    doc.setFontSize(8)
    doc.setFont("helvetica", "italic")
    doc.setTextColor(100)
    const vatText = vehicle.vatType === "MWST" 
      ? "MwSt. ausweisbar" 
      : "Differenzbesteuerung nach § 25a UStG"
    doc.text(vatText, margin, y)
    doc.setTextColor(0)
    y += 10

    // Horizontale Linie
    doc.setDrawColor(200)
    doc.line(margin, y, pageWidth - margin, y)
    y += 8

    // Rechtliche Angaben
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text("Rechtliche Angaben", margin, y)
    y += 6

    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")

    const checkbox = (checked: boolean) => checked ? "[X]" : "[ ]"
    doc.text(`${checkbox(contract.isAccidentFree)} Das Fahrzeug ist unfallfrei`, margin, y)
    y += 5
    doc.text(`${checkbox(contract.reducedLiability)} Haftungsbeschränkung auf Vorsatz und grobe Fahrlässigkeit`, margin, y)
    y += 5
    doc.text(`${checkbox(contract.hasWarranty)} Gewährleistung / Garantie vereinbart`, margin, y)
    y += 10

    // Daten
    doc.setFontSize(9)
    doc.text(`Vertragsdatum: ${formatDate(contract.contractDate)}`, margin, y)
    if (contract.deliveryDate) {
      doc.text(`Übergabedatum: ${formatDate(contract.deliveryDate)}`, margin + 60, y)
    }
    y += 10

    // Zahlungsbedingungen
    if (contract.paymentTerms) {
      doc.setFont("helvetica", "bold")
      doc.text("Zahlungsbedingungen:", margin, y)
      y += 5
      doc.setFont("helvetica", "normal")
      const terms = doc.splitTextToSize(contract.paymentTerms, contentWidth)
      doc.text(terms, margin, y)
      y += terms.length * 4 + 5
    }

    // Bemerkungen
    if (contract.notes) {
      doc.setFont("helvetica", "bold")
      doc.text("Bemerkungen:", margin, y)
      y += 5
      doc.setFont("helvetica", "normal")
      const notes = doc.splitTextToSize(contract.notes, contentWidth)
      doc.text(notes, margin, y)
      y += notes.length * 4 + 5
    }

    // Neue Seite wenn nötig
    if (y > 240) {
      doc.addPage()
      y = margin
    }

    // Unterschriften
    y = Math.max(y + 20, 240)
    doc.setDrawColor(100)
    doc.line(margin, y, margin + 70, y)
    doc.line(pageWidth - margin - 70, y, pageWidth - margin, y)
    y += 5
    doc.setFontSize(8)
    doc.text("Ort, Datum / Unterschrift Verkäufer", margin, y)
    doc.text("Ort, Datum / Unterschrift Käufer", pageWidth - margin - 70, y)

    // Footer
    doc.setFontSize(7)
    doc.setTextColor(150)
    doc.text(
      `Erstellt am ${formatDate(new Date())} von ${contract.createdBy.name}`,
      pageWidth / 2,
      285,
      { align: "center" }
    )

    // PDF als Buffer ausgeben
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"))

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="vertrag-${contract.contractNumber}.pdf"`,
      },
    })
  } catch (error) {
    console.error("PDF Generation Error:", error)
    return NextResponse.json(
      { error: "Fehler bei der PDF-Generierung" },
      { status: 500 }
    )
  }
}

