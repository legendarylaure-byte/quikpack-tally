import { NextResponse } from "next/server";
import { readBody } from "@/lib/api-body";
import { requireMember } from "@/lib/api-member";
import { parseCsvObjects } from "@/lib/csv";
import { createDoc } from "@/lib/data";
import { getErrorMessage } from "@/lib/errors";
import { parseMoney } from "@/lib/money";

export async function POST(request: Request) {
  const member = await requireMember(request, "masters");
  if (member instanceof NextResponse) {
    return member;
  }
  if (!member.admin && member.role !== "accountant") {
    return NextResponse.json({ error: "You cannot import catalogue items." }, { status: 403 });
  }

  const body = await readBody(request);
  if (body instanceof NextResponse) {
    return body;
  }

  let rows: Record<string, unknown>[] = [];
  if (Array.isArray(body.items)) {
    rows = body.items as Record<string, unknown>[];
  } else if (typeof body.csv === "string") {
    try {
      rows = parseCsvObjects(body.csv);
    } catch (error) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 400 });
    }
  } else {
    return NextResponse.json(
      { error: "Provide items or CSV data to import." },
      { status: 400 },
    );
  }

  if (rows.length === 0 || rows.length > 1000) {
    return NextResponse.json(
      { error: "Import between 1 and 1000 rows." },
      { status: 400 },
    );
  }

  const prepared: Array<Record<string, unknown>> = [];
  for (const [index, row] of rows.entries()) {
    const sku = String(row.sku ?? row.code ?? "").trim();
    const description = String(row.description ?? row.name ?? "").trim();
    const priceRaw = row.sellingprice ?? row.sellingpriceghs ?? row.price ?? 0;
    if (!sku || !description) {
      return NextResponse.json(
        { error: `Row ${index + 2} needs a SKU and description.` },
        { status: 400 },
      );
    }
    let sellingPriceMinor: number;
    try {
      sellingPriceMinor = parseMoney(priceRaw as string | number);
    } catch {
      return NextResponse.json(
        { error: `Row ${index + 2} has an invalid selling price.` },
        { status: 400 },
      );
    }
    prepared.push({
      sku,
      barcode: String(row.barcode ?? ""),
      description,
      pack: String(row.pack ?? ""),
      distributorPriceMinor: safeMoney(row.distributorprice ?? row.distributorpcprice),
      boxPriceMinor: safeMoney(row.boxprice),
      sellingPriceMinor,
      source: String(row.source ?? "Everpack"),
      resellable: String(row.resellable ?? "true").toLowerCase() !== "false",
    });
  }

  try {
    let imported = 0;
    for (const item of prepared) {
      await createDoc("catalogue", item, member.uid);
      imported += 1;
    }
    return NextResponse.json({ imported }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

function safeMoney(value: unknown): number {
  try {
    return parseMoney((value ?? 0) as string | number);
  } catch {
    return 0;
  }
}
