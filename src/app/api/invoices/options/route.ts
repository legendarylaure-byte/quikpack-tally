import { NextResponse } from "next/server";
import { requireMember } from "@/lib/api-member";
import { listDocs } from "@/lib/data";
import { getErrorMessage } from "@/lib/errors";
import { invoiceOptions } from "@/lib/invoice-options";

export async function GET(request: Request) {
  const member = await requireMember(request, "invoicing");
  if (member instanceof NextResponse) {
    return member;
  }

  try {
    const [parties, items, taxRates] = await Promise.all([
      listDocs("parties"),
      listDocs("items"),
      listDocs("taxRates"),
    ]);
    return NextResponse.json(invoiceOptions(parties, items, taxRates));
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
