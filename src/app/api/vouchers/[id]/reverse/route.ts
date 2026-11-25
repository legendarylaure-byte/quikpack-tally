import { NextResponse } from "next/server";
import { requireMember } from "@/lib/api-member";
import { createDoc, getDoc, updateDoc } from "@/lib/data";
import type { Voucher, VoucherLine } from "@/lib/domain";
import { getErrorMessage } from "@/lib/errors";
import { nextNumber } from "@/lib/numbering";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Context) {
  const member = await requireMember(request, "vouchers");
  if (member instanceof NextResponse) {
    return member;
  }
  if (!member.admin && !["admin", "accountant"].includes(member.role)) {
    return NextResponse.json({ error: "You cannot reverse vouchers." }, { status: 403 });
  }

  const { id } = await context.params;
  try {
    const item = await getDoc("vouchers", id);
    if (!item) {
      return NextResponse.json({ error: "Voucher not found." }, { status: 404 });
    }
    if (item.status === "reversed") {
      return NextResponse.json({ error: "This voucher is already reversed." }, { status: 409 });
    }

    const original = item as unknown as Voucher;
    const lines: VoucherLine[] = (original.lines ?? []).map((line) => ({
      accountId: line.accountId,
      debitMinor: Number(line.creditMinor ?? 0),
      creditMinor: Number(line.debitMinor ?? 0),
      description: `Reversal: ${line.description ?? ""}`.trim(),
    }));
    const number = await nextNumber("vouchers", "RV", String(original.date));
    const reversalId = await createDoc(
      "vouchers",
      {
        number,
        type: "journal",
        date: new Date().toISOString().slice(0, 10),
        partyId: original.partyId ?? "",
        narration: `Reversal of ${original.number}`,
        currency: original.currency,
        exchangeRate: original.exchangeRate,
        baseAmountGhsMinor: original.baseAmountGhsMinor,
        lines,
        totalDebitMinor: original.totalCreditMinor,
        totalCreditMinor: original.totalDebitMinor,
        status: "posted",
        reversalOf: original.id ?? id,
      },
      member.uid,
    );

    await updateDoc(
      "vouchers",
      id,
      { status: "reversed", reversedBy: reversalId },
      member.uid,
    );

    return NextResponse.json({ id: reversalId, number }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
