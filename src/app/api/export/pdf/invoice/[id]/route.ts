import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { jsPDF } from "jspdf"
// @ts-expect-error - jspdf-autotable augments jsPDF but types are tricky
import autoTable from "jspdf-autotable"

// Deutsche Formatierung
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

    // Rechnung mit allen Relationen laden
    const invoice = await db.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        positions: true,
        contract: {
          include: {
            vehicle: true,
          },
        },
        createdBy: {
          select: { name: true },
        },
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: "Rechnung nicht gefunden" }, { status: 404 })
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

    // === KOPFBEREICH ===

    // Firmendaten (rechts oben)
    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.text("ST Motors GmbH", pageWidth - margin, y, { align: "right" })
    y += 6

    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(80)
    doc.text("Am Wolfsberg 4", pageWidth - margin, y, { align: "right" })
    y += 4
    doc.text("28865 Lilienthal", pageWidth - margin, y, { align: "right" })
    y += 4
    doc.text("Tel: +49 4298 9099069", pageWidth - margin, y, { align: "right" })
    y += 4
    doc.text("info@st-motors.de", pageWidth - margin, y, { align: "right" })
    y += 12

    // Absenderzeile (klein)
    doc.setFontSize(7)
    doc.setTextColor(120)
    doc.text("ST Motors GmbH · Am Wolfsberg 4 · 28865 Lilienthal", margin, y)
    y += 8

    // Empfänger
    doc.setFontSize(10)
    doc.setTextColor(0)
    doc.setFont("helvetica", "normal")

    const customer = invoice.customer
    if (customer.company) {
      doc.text(customer.company, margin, y)
      y += 5
    }
    const fullName = [customer.salutation, customer.firstName, customer.lastName].filter(Boolean).join(" ")
    doc.text(fullName, margin, y)
    y += 5
    if (customer.street) {
      doc.text(customer.street, margin, y)
      y += 5
    }
    if (customer.zipCode && customer.city) {
      doc.text(`${customer.zipCode} ${customer.city}`, margin, y)
      y += 5
    }
    if (customer.country && customer.country !== "Deutschland") {
      doc.text(customer.country, margin, y)
    }

    y += 15

    // Rechnungsdetails Box (rechts)
    const boxX = pageWidth - margin - 60
    const boxY = y - 30
    doc.setDrawColor(200)
    doc.setFillColor(250, 250, 250)
    doc.roundedRect(boxX, boxY, 60, 25, 2, 2, "FD")

    doc.setFontSize(8)
    doc.setTextColor(80)
    doc.text("Rechnungsnummer", boxX + 5, boxY + 6)
    doc.text("Rechnungsdatum", boxX + 5, boxY + 14)
    doc.text("Kundennummer", boxX + 5, boxY + 22)

    doc.setFont("helvetica", "bold")
    doc.setTextColor(0)
    doc.text(invoice.invoiceNumber, boxX + 55, boxY + 6, { align: "right" })
    doc.text(formatDate(invoice.invoiceDate), boxX + 55, boxY + 14, { align: "right" })
    doc.text(String(customer.customerNumber), boxX + 55, boxY + 22, { align: "right" })

    y += 5

    // === TITEL ===
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text("RECHNUNG", margin, y)
    y += 15

    // Betreff
    if (invoice.contract?.vehicle) {
      const vehicle = invoice.contract.vehicle
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(60)
      doc.text(
        `Betreff: ${vehicle.manufacturer} ${vehicle.model}${vehicle.variant ? ` ${vehicle.variant}` : ""}`,
        margin,
        y
      )
      y += 10
    }

    // === POSITIONEN TABELLE ===
    doc.setTextColor(0)

    const tableData = invoice.positions.map((pos, index) => [
      String(index + 1),
      pos.description,
      String(pos.quantity),
      formatCurrency(pos.unitPrice),
      formatCurrency(pos.total),
    ])

    autoTable(doc, {
      startY: y,
      head: [["Pos.", "Beschreibung", "Menge", "Einzelpreis", "Gesamt"]],
      body: tableData,
      theme: "plain",
      headStyles: {
        fillColor: [245, 245, 245],
        textColor: [60, 60, 60],
        fontStyle: "bold",
        fontSize: 9,
        cellPadding: 4,
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 4,
        textColor: [40, 40, 40],
      },
      columnStyles: {
        0: { cellWidth: 15, halign: "center" },
        1: { cellWidth: "auto" },
        2: { cellWidth: 20, halign: "center" },
        3: { cellWidth: 30, halign: "right" },
        4: { cellWidth: 30, halign: "right" },
      },
      margin: { left: margin, right: margin },
      tableLineColor: [220, 220, 220],
      tableLineWidth: 0.1,
    })

    // @ts-expect-error - autoTable adds lastAutoTable to doc
    y = doc.lastAutoTable.finalY + 10

    // === SUMMEN ===
    const sumX = pageWidth - margin - 80

    // Netto
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.text("Nettobetrag:", sumX, y)
    doc.text(formatCurrency(invoice.netAmount), pageWidth - margin, y, { align: "right" })
    y += 5

    // MwSt
    doc.text("MwSt. (19%):", sumX, y)
    doc.text(formatCurrency(invoice.vatAmount), pageWidth - margin, y, { align: "right" })
    y += 6

    // Linie
    doc.setDrawColor(100)
    doc.line(sumX, y, pageWidth - margin, y)
    y += 6

    // Brutto
    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.text("Gesamtbetrag:", sumX, y)
    doc.text(formatCurrency(invoice.grossAmount), pageWidth - margin, y, { align: "right" })
    y += 15

    // === ZAHLUNGSINFORMATIONEN ===
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(60)

    if (invoice.dueDate) {
      doc.text(`Zahlbar bis: ${formatDate(invoice.dueDate)}`, margin, y)
      y += 5
    }

    // Status
    if (invoice.status === "BEZAHLT") {
      doc.setTextColor(34, 139, 34) // Grün
      doc.setFont("helvetica", "bold")
      doc.text(`✓ Bezahlt am ${formatDate(invoice.paidDate)}`, margin, y)
      y += 5
    }

    y += 10

    // Bankverbindung
    doc.setTextColor(0)
    doc.setFont("helvetica", "bold")
    doc.text("Bankverbindung:", margin, y)
    y += 5
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.text("ST Motors GmbH", margin, y)
    y += 4
    doc.text("IBAN: DE12 3456 7890 1234 5678 90", margin, y)
    y += 4
    doc.text("BIC: DEUTDEFF", margin, y)
    y += 4
    doc.text("Verwendungszweck: " + invoice.invoiceNumber, margin, y)

    // === FOOTER ===
    y = 270

    doc.setDrawColor(200)
    doc.line(margin, y, pageWidth - margin, y)
    y += 5

    doc.setFontSize(7)
    doc.setTextColor(120)
    doc.setFont("helvetica", "normal")

    // Drei Spalten Footer
    const footerCol1 = margin
    const footerCol2 = margin + 55
    const footerCol3 = margin + 110

    doc.text("ST Motors GmbH", footerCol1, y)
    doc.text("Geschäftsführer: Serhat Tekin", footerCol2, y)
    doc.text("Amtsgericht Bremen", footerCol3, y)
    y += 3
    doc.text("Am Wolfsberg 4", footerCol1, y)
    doc.text("USt-IdNr.: DE123456789", footerCol2, y)
    doc.text("HRB 12345", footerCol3, y)
    y += 3
    doc.text("28865 Lilienthal", footerCol1, y)
    doc.text("Steuer-Nr.: 12/345/67890", footerCol2, y)
    y += 3
    doc.text("Tel: +49 4298 9099069", footerCol1, y)

    // Seite
    doc.text(
      `Seite 1 von 1`,
      pageWidth / 2,
      285,
      { align: "center" }
    )

    // PDF als Buffer ausgeben
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"))

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="rechnung-${invoice.invoiceNumber}.pdf"`,
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

