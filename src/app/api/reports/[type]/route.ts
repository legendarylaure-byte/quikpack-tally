import { NextResponse } from "next/server";
import { requireMember } from "@/lib/api-member";
import { listDocs } from "@/lib/data";
import type {
  Account,
  Invoice,
  Party,
  Payment,
  StockDoc,
  StockMovement,
  Voucher,
} from "@/lib/domain";
import { getErrorMessage } from "@/lib/errors";
import {
  accountLedger,
  arApAging,
  balanceSheet,
  cashflowLite,
  dayBook,
  profitAndLoss,
  stockMovementReport,
  trialBalance,
  vatSummary,
} from "@/lib/reports";

type Context = { params: Promise<{ type: string }> };

const REPORTS = [
  "pnl",
  "trial-balance",
  "balance-sheet",
  "vat",
  "ar-ap",
  "stock",
  "cashflow",
  "ledger",
  "day-book",
] as const;

export async function GET(request: Request, context: Context) {
  const member = await requireMember(request, "reports");
  if (member instanceof NextResponse) {
    return member;
  }
  const { type } = await context.params;
  if (!(REPORTS as readonly string[]).includes(type)) {
    return NextResponse.json({ error: "Unknown report." }, { status: 404 });
  }

  try {
    const [accountDocs, voucherDocs, invoiceDocs, partyDocs, paymentDocs, stockDocs, movementDocs, itemDocs, settingDocs] =
      await Promise.all([
        listDocs("accounts"),
        listDocs("vouchers"),
        listDocs("invoices"),
        listDocs("parties"),
        listDocs("payments"),
        listDocs("stock"),
        listDocs("stockMovements"),
        listDocs("items"),
        listDocs("settings"),
      ]);

    const accounts = accountDocs as unknown as Account[];
    const vouchers = voucherDocs as unknown as Voucher[];
    const invoices = invoiceDocs as unknown as Invoice[];
    const parties = partyDocs as unknown as Party[];
    const payments = paymentDocs as unknown as Payment[];
    const stock = stockDocs as unknown as StockDoc[];
    const movements = movementDocs as unknown as StockMovement[];
    const items = itemDocs as Array<{ id: string; name: string }>;
    const settings = settingDocs.find((doc) => doc.key === "company");
    const method = settings?.valuationMethod === "fifo" ? "fifo" : "weighted";
    const asOf = new Date().toISOString().slice(0, 10);

    let data: unknown;
    switch (type) {
      case "pnl":
        data = profitAndLoss(vouchers, accounts);
        break;
      case "trial-balance":
        data = trialBalance(vouchers);
        break;
      case "balance-sheet":
        data = balanceSheet(vouchers, accounts);
        break;
      case "vat":
        data = vatSummary(invoices, vouchers);
        break;
      case "ar-ap":
        data = arApAging(parties, invoices, payments, vouchers, asOf);
        break;
      case "stock":
        data = stockMovementReport(stock, movements, items, method);
        break;
      case "cashflow":
        data = cashflowLite(vouchers);
        break;
      case "ledger":
        data = accountLedger(
          vouchers,
          accounts,
          new URL(request.url).searchParams.get("accountId") ?? undefined,
        );
        break;
      case "day-book":
        data = dayBook(vouchers, invoices);
        break;
    }

    return NextResponse.json({ type, generatedAt: new Date().toISOString(), data });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
