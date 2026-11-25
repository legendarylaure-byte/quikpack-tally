import { NextResponse } from "next/server";
import { isIsoDate, readBody } from "@/lib/api-body";
import { requireMember } from "@/lib/api-member";
import { CURRENCIES } from "@/lib/constants";
import { createDoc, listDocs } from "@/lib/data";
import type { TaxCategory } from "@/lib/domain";
import { getErrorMessage } from "@/lib/errors";
import { computeInvoice, type InvoiceLineInput } from "@/lib/invoice";
import { convertToGhs } from "@/lib/money";
import { nextNumber } from "@/lib/numbering";
import { resolveTaxRates, type TaxRate } from "@/lib/tax";

const TAX_CATEGORIES: TaxCategory[] = ["standard", "zeroRated", "exempt"];

export async function GET(request: Request) {
  const member = await requireMember(request, "invoicing");
  if (member instanceof NextResponse) {
    return member;
  }
  try {
    const items = await listDocs("invoices");
    items.sort((a, b) => String(b.date ?? "").localeCompare(String(a.date ?? "")));
    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const member = await requireMember(request, "invoicing");
  if (member instanceof NextResponse) {
    return member;
  }
  if (!member.admin && !["admin", "accountant", "cashier"].includes(member.role)) {
    return NextResponse.json({ error: "You cannot create invoices." }, { status: 403 });
  }

  const body = await readBody(request);
  if (body instanceof NextResponse) {
    return body;
  }

  const partyId = String(body.partyId ?? "");
  if (!partyId) {
    return NextResponse.json({ error: "Choose a customer." }, { status: 400 });
  }
  if (!isIsoDate(body.date) || !isIsoDate(body.dueDate)) {
    return NextResponse.json({ error: "Enter valid invoice and due dates." }, { status: 400 });
  }
  const currency = String(body.currency ?? "GHS");
  if (!(CURRENCIES as readonly string[]).includes(currency)) {
    return NextResponse.json({ error: "Choose a valid currency." }, { status: 400 });
  }
  const exchangeRate = Number(body.exchangeRate ?? 1);
  if (!Number.isFinite(exchangeRate) || exchangeRate <= 0) {
    return NextResponse.json({ error: "Enter a valid exchange rate." }, { status: 400 });
  }
  if (!Array.isArray(body.lines) || body.lines.length === 0) {
    return NextResponse.json({ error: "Add at least one invoice line." }, { status: 400 });
  }

  const lineInputs: InvoiceLineInput[] = [];
  for (const raw of body.lines as Record<string, unknown>[]) {
    if (!raw || typeof raw !== "object") {
      return NextResponse.json({ error: "Invalid invoice line." }, { status: 400 });
    }
    const description = String(raw.description ?? "").trim();
    const taxCategory = String(raw.taxCategory ?? "standard") as TaxCategory;
    if (!description || !TAX_CATEGORIES.includes(taxCategory)) {
      return NextResponse.json(
        { error: "Each line needs a description and valid tax category." },
        { status: 400 },
      );
    }
    lineInputs.push({
      itemId: raw.itemId ? String(raw.itemId) : undefined,
      description,
      quantity: Number(raw.quantity ?? 0),
      unitPriceMinor: Number(raw.unitPriceMinor ?? 0),
      taxCategory,
      priceIncludesTax: raw.priceIncludesTax === true,
    });
  }

  let totals;
  try {
    const taxRates = (await listDocs("taxRates")) as unknown as TaxRate[];
    totals = computeInvoice(lineInputs, resolveTaxRates(taxRates, body.date as string));
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 400 });
  }

  try {
    const settings = await listDocs("settings");
    const company = settings.find((doc) => doc.key === "company");
    const prefix = String(company?.invoicePrefix ?? "INV");
    const number = await nextNumber("invoices", prefix, body.date as string);
    const baseAmountGhsMinor = convertToGhs(totals.totalMinor, exchangeRate);

    const brandingRaw = body.clientBranding;
    let clientBranding: Record<string, unknown> | undefined;
    if (brandingRaw && typeof brandingRaw === "object" && !Array.isArray(brandingRaw)) {
      const brand = brandingRaw as Record<string, unknown>;
      if (!String(brand.name ?? "").trim()) {
        return NextResponse.json(
          { error: "Client branding needs a name." },
          { status: 400 },
        );
      }
      clientBranding = {
        name: String(brand.name),
        address: String(brand.address ?? ""),
        tin: String(brand.tin ?? ""),
        email: String(brand.email ?? ""),
        phone: String(brand.phone ?? ""),
        logoUrl: String(brand.logoUrl ?? ""),
      };
    }

    const id = await createDoc(
      "invoices",
      {
        number,
        date: body.date,
        dueDate: body.dueDate,
        partyId,
        billTo: String(body.billTo ?? ""),
        shipTo: String(body.shipTo ?? ""),
        currency,
        exchangeRate,
        baseAmountGhsMinor,
        lines: totals.lines,
        subtotalMinor: totals.subtotalMinor,
        vatMinor: totals.vatMinor,
        nhilMinor: totals.nhilMinor,
        getfundMinor: totals.getfundMinor,
        totalTaxMinor: totals.totalTaxMinor,
        totalMinor: totals.totalMinor,
        amountPaidMinor: 0,
        status: "draft",
        branch: String(body.branch ?? "Main").slice(0, 100),
        notes: String(body.notes ?? ""),
        ...(clientBranding ? { clientBranding } : {}),
      },
      member.uid,
    );
    return NextResponse.json({ id, number }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
