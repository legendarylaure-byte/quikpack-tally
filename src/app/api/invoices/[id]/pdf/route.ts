import { jsPDF } from "jspdf";
import { NextResponse } from "next/server";
import { requireMember } from "@/lib/api-member";
import { COMPANY, SUPPORT } from "@/lib/constants";
import { getDoc, listDocs } from "@/lib/data";
import type { Invoice } from "@/lib/domain";
import { getErrorMessage } from "@/lib/errors";
import { fromMinor } from "@/lib/money";
import { resolveTaxRates, type TaxRate } from "@/lib/tax";

type Context = { params: Promise<{ id: string }> };

function money(minor: number): string {
  return fromMinor(minor).toFixed(2);
}

export async function GET(request: Request, context: Context) {
  const member = await requireMember(request, "invoicing");
  if (member instanceof NextResponse) {
    return member;
  }

  const { id } = await context.params;
  try {
    const item = await getDoc("invoices", id);
    if (!item) {
      return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
    }
    const invoice = item as unknown as Invoice;
    const taxRateDocs = await listDocs("taxRates");
    const rates = resolveTaxRates(taxRateDocs as unknown as TaxRate[], invoice.date);
    const pct = (rate: number) => `${Math.round(rate * 1000) / 10}%`;
    const brand = invoice.clientBranding;

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const width = doc.internal.pageSize.getWidth();
    const margin = 16;
    let y = 18;

    doc.setFillColor(125, 189, 23);
    doc.rect(margin, y - 8, 10, 10, "F");
    doc.setTextColor(47, 29, 88);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(brand?.name ? String(brand.name) : COMPANY.legalName, margin + 14, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    if (brand?.address) {
      doc.text(String(brand.address), margin + 14, y + 4);
    }
    const brandTin = brand?.tin ? String(brand.tin) : "";
    if (brandTin) {
      doc.text(`TIN: ${brandTin}`, margin + 14, y + 8);
    }

    doc.setTextColor(47, 29, 88);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("INVOICE", width - margin, y + 2, { align: "right" });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`No: ${invoice.number}`, width - margin, y + 8, { align: "right" });
    doc.text(`Date: ${invoice.date}`, width - margin, y + 13, { align: "right" });
    doc.text(`Due: ${invoice.dueDate}`, width - margin, y + 18, { align: "right" });

    y += 26;
    doc.setDrawColor(125, 189, 23);
    doc.line(margin, y, width - margin, y);
    y += 8;

    doc.setFontSize(8);
    doc.setTextColor(90, 90, 100);
    doc.text("BILL TO", margin, y);
    doc.text("SHIP TO", width / 2, y);
    doc.setTextColor(47, 29, 88);
    doc.setFontSize(10);
    doc.text(invoice.billTo || String(brand?.name ?? "-"), margin, y + 6);
    doc.text(invoice.shipTo || "-", width / 2, y + 6);
    y += 14;

    const columns = [
      { label: "Description", x: margin, width: 88 },
      { label: "Qty", x: margin + 90, width: 14 },
      { label: `Unit (${invoice.currency})`, x: margin + 106, width: 24 },
      { label: "Tax", x: margin + 132, width: 20 },
      { label: `Amount (${invoice.currency})`, x: width - margin, width: 30 },
    ];

    doc.setFillColor(245, 245, 245);
    doc.rect(margin, y, width - margin * 2, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    for (const column of columns) {
      const align = column.label.startsWith("Amount") ? "right" : "left";
      doc.text(column.label, column.x + (align === "right" ? column.width : 0), y + 5, {
        align: align as "left" | "right",
        maxWidth: column.width,
      });
    }
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    for (const line of invoice.lines ?? []) {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      doc.text(line.description, margin, y + 5, { maxWidth: 86 });
      const qty = String(line.quantity);
      doc.text(qty, margin + 90, y + 5);
      doc.text(money(line.unitPriceMinor), margin + 106, y + 5);
      const taxLabel =
        line.taxCategory === "standard"
          ? "STD"
          : line.taxCategory === "zeroRated"
            ? "0%"
            : "EXEMPT";
      doc.text(taxLabel, margin + 132, y + 5);
      doc.text(money(line.lineTotalMinor), width - margin, y + 5, {
        align: "right",
      });
      doc.setDrawColor(230, 230, 230);
      doc.line(margin, y + 8, width - margin, y + 8);
      y += 10;
    }

    y += 4;
    const totals: Array<[string, number, boolean]> = [
      ["Subtotal", invoice.subtotalMinor, false],
      [`VAT (${pct(rates.vatRate)})`, invoice.vatMinor, false],
      [`NHIL (${pct(rates.nhilRate)})`, invoice.nhilMinor, false],
      [`GETFund (${pct(rates.getfundRate)})`, invoice.getfundMinor, false],
      ["Total tax", invoice.totalTaxMinor, false],
      ["TOTAL", invoice.totalMinor, true],
    ];
    for (const [label, value, bold] of totals) {
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setFontSize(bold ? 12 : 9);
      doc.text(label, width - margin - 40, y + 5, { align: "right" });
      doc.text(money(value), width - margin, y + 5, { align: "right" });
      y += bold ? 9 : 6;
    }

    if (invoice.notes) {
      y += 4;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(`Notes: ${invoice.notes}`, margin, y, { maxWidth: width - margin * 2 });
    }

    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setDrawColor(125, 189, 23);
    doc.line(margin, pageHeight - 18, width - margin, pageHeight - 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(90, 90, 100);
    doc.text("Powered by quikpack", margin, pageHeight - 12);
    doc.text(
      `${COMPANY.legalName} | Reg ${COMPANY.registrationNumber} | TIN ${COMPANY.tin}`,
      margin,
      pageHeight - 7,
    );
    doc.text(`Support: ${SUPPORT.whatsappNumber}`, width - margin, pageHeight - 7, {
      align: "right",
    });

    const arrayBuffer = doc.output("arraybuffer");
    return new NextResponse(new Uint8Array(arrayBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoice.number}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
