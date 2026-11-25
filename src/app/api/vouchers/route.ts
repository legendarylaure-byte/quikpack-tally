import { NextResponse } from "next/server";
import { isIsoDate, readBody } from "@/lib/api-body";
import { requireMember } from "@/lib/api-member";
import { createDoc, listDocs } from "@/lib/data";
import type { VoucherLine, VoucherType } from "@/lib/domain";
import { getErrorMessage } from "@/lib/errors";
import { CURRENCIES } from "@/lib/constants";
import { convertToGhs } from "@/lib/money";
import { nextNumber } from "@/lib/numbering";

export const VOUCHER_TYPES: VoucherType[] = [
  "payment",
  "receipt",
  "contra",
  "journal",
  "sales",
  "purchase",
  "expense",
  "creditNote",
  "debitNote",
];

const PREFIX: Record<VoucherType, string> = {
  payment: "PMT",
  receipt: "RCT",
  contra: "CTR",
  journal: "JV",
  sales: "SV",
  purchase: "PV",
  expense: "EXP",
  creditNote: "CN",
  debitNote: "DN",
};

export async function GET(request: Request) {
  const member = await requireMember(request, "vouchers");
  if (member instanceof NextResponse) {
    return member;
  }
  try {
    const items = await listDocs("vouchers");
    items.sort((a, b) => String(b.date ?? "").localeCompare(String(a.date ?? "")));
    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const member = await requireMember(request, "vouchers");
  if (member instanceof NextResponse) {
    return member;
  }
  if (!member.admin && !["admin", "accountant", "cashier"].includes(member.role)) {
    return NextResponse.json({ error: "You cannot record vouchers." }, { status: 403 });
  }

  const body = await readBody(request);
  if (body instanceof NextResponse) {
    return body;
  }

  const type = body.type as VoucherType;
  if (!VOUCHER_TYPES.includes(type)) {
    return NextResponse.json({ error: "Choose a valid voucher type." }, { status: 400 });
  }
  if (!isIsoDate(body.date)) {
    return NextResponse.json({ error: "Enter a valid date." }, { status: 400 });
  }
  if (!Array.isArray(body.lines) || body.lines.length < 2) {
    return NextResponse.json(
      { error: "Add at least a debit and a credit line." },
      { status: 400 },
    );
  }
  const currency = String(body.currency ?? "GHS");
  if (!(CURRENCIES as readonly string[]).includes(currency)) {
    return NextResponse.json({ error: "Choose a valid currency." }, { status: 400 });
  }
  const exchangeRate = Number(body.exchangeRate ?? 1);
  if (!Number.isFinite(exchangeRate) || exchangeRate <= 0) {
    return NextResponse.json({ error: "Enter a valid exchange rate." }, { status: 400 });
  }

  const lines: VoucherLine[] = [];
  let totalDebitMinor = 0;
  let totalCreditMinor = 0;
  for (const raw of body.lines as Record<string, unknown>[]) {
    if (!raw || typeof raw !== "object") {
      return NextResponse.json({ error: "Invalid voucher line." }, { status: 400 });
    }
    const accountId = String(raw.accountId ?? "");
    const debitMinor = Number(raw.debitMinor ?? 0);
    const creditMinor = Number(raw.creditMinor ?? 0);
    if (!accountId) {
      return NextResponse.json({ error: "Each line needs an account." }, { status: 400 });
    }
    if (
      !Number.isInteger(debitMinor) ||
      !Number.isInteger(creditMinor) ||
      debitMinor < 0 ||
      creditMinor < 0 ||
      (debitMinor > 0 && creditMinor > 0) ||
      (debitMinor === 0 && creditMinor === 0)
    ) {
      return NextResponse.json(
        { error: "Each line needs exactly one positive whole-number amount." },
        { status: 400 },
      );
    }
    lines.push({
      accountId,
      debitMinor,
      creditMinor,
      description: String(raw.description ?? ""),
    });
    totalDebitMinor += debitMinor;
    totalCreditMinor += creditMinor;
  }

  if (totalDebitMinor === 0 || totalDebitMinor !== totalCreditMinor) {
    return NextResponse.json(
      { error: "Debits must equal credits and be greater than zero." },
      { status: 400 },
    );
  }

  try {
    const number = await nextNumber("vouchers", PREFIX[type], body.date as string);
    let baseAmountGhsMinor: number;
    try {
      baseAmountGhsMinor = convertToGhs(totalDebitMinor, exchangeRate);
    } catch (error) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 400 });
    }

    const id = await createDoc(
      "vouchers",
      {
        number,
        type,
        date: body.date,
        partyId: String(body.partyId ?? ""),
        narration: String(body.narration ?? ""),
        currency,
        exchangeRate,
        baseAmountGhsMinor,
        lines,
        totalDebitMinor,
        totalCreditMinor,
        status: "posted",
        branch: String(body.branch ?? "Main").slice(0, 100),
        attachmentUrl: String(body.attachmentUrl ?? ""),
        vatMinor: Number(body.vatMinor ?? 0),
        nhilMinor: Number(body.nhilMinor ?? 0),
        getfundMinor: Number(body.getfundMinor ?? 0),
      },
      member.uid,
    );
    return NextResponse.json({ id, number }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
