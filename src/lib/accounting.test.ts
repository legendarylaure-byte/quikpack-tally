import assert from "node:assert/strict";
import test from "node:test";
import type {
  Account,
  Invoice,
  Payment,
  StockMovement,
  TaxRate,
  Voucher,
} from "./domain";
import { computeInvoice } from "./invoice";
import { fromMinor, parseMoney } from "./money";
import {
  accountLedger,
  arApAging,
  balanceSheet,
  dayBook,
  profitAndLoss,
  trialBalance,
  vatSummary,
} from "./reports";
import { valueStock } from "./stock";
import { resolveTaxRates } from "./tax";

const rates = { vatRate: 0.15, nhilRate: 0.025, getfundRate: 0.025 };

test("invoice lines carry separate Ghana tax components", () => {
  const result = computeInvoice(
    [
      {
        description: "Cartons",
        quantity: 2,
        unitPriceMinor: 50_000,
        taxCategory: "standard",
      },
      {
        description: "Exempt service",
        quantity: 1,
        unitPriceMinor: 10_000,
        taxCategory: "exempt",
      },
    ],
    rates,
  );
  assert.equal(result.subtotalMinor, 110_000);
  assert.equal(result.vatMinor, 15_000);
  assert.equal(result.nhilMinor, 2_500);
  assert.equal(result.getfundMinor, 2_500);
  assert.equal(result.totalMinor, 130_000);
});

test("effective-dated tax rates resolve by invoice date", () => {
  const stored: TaxRate[] = [
    { name: "vat", rate: 0.125, effectiveFrom: "2026-01-01", effectiveTo: "2026-06-30" },
    { name: "vat", rate: 0.15, effectiveFrom: "2026-07-01" },
  ];
  assert.equal(resolveTaxRates(stored, "2026-03-01").vatRate, 0.125);
  assert.equal(resolveTaxRates(stored, "2026-09-01").vatRate, 0.15);
});

test("FIFO and weighted average value the same stock differently", () => {
  const movements: StockMovement[] = [
    { itemId: "i1", location: "main", direction: "in", quantity: 10, unitCostMinor: 100, date: "2026-01-01", reference: "open" },
    { itemId: "i1", location: "main", direction: "in", quantity: 10, unitCostMinor: 200, date: "2026-01-02", reference: "buy" },
    { itemId: "i1", location: "main", direction: "out", quantity: 5, unitCostMinor: 0, date: "2026-01-03", reference: "sell" },
  ];
  const fifo = valueStock(movements, "fifo");
  const weighted = valueStock(movements, "weighted");
  assert.equal(fifo.quantity, 15);
  assert.equal(fifo.costOfGoodsSoldMinor, 500);
  assert.equal(fifo.valueMinor, 2500);
  assert.equal(weighted.costOfGoodsSoldMinor, 750);
  assert.equal(weighted.valueMinor, 2250);
});

test("trial balance, P&L and balance sheet reconcile", () => {
  const accounts: Account[] = [
    { id: "cash", code: "1000", name: "Cash", type: "asset", group: "Current Assets", openingBalanceMinor: 100_000 },
    { id: "sales", code: "4000", name: "Sales", type: "income", group: "Sales", openingBalanceMinor: 0 },
    { id: "capital", code: "3000", name: "Capital", type: "equity", group: "Equity", openingBalanceMinor: 100_000 },
  ];
  const vouchers: Voucher[] = [
    {
      id: "v1",
      number: "JV-1",
      type: "journal",
      date: "2026-01-05",
      narration: "Sale",
      currency: "GHS",
      exchangeRate: 1,
      baseAmountGhsMinor: 50_000,
      totalDebitMinor: 50_000,
      totalCreditMinor: 50_000,
      status: "posted",
      lines: [
        { accountId: "cash", debitMinor: 50_000, creditMinor: 0 },
        { accountId: "sales", debitMinor: 0, creditMinor: 50_000 },
      ],
    },
  ];

  const tb = trialBalance(vouchers);
  assert.equal(tb.find((row) => row.accountId === "cash")?.debitMinor, 50_000);
  const pnl = profitAndLoss(vouchers, accounts);
  assert.equal(pnl.netProfitMinor, 50_000);
  const bs = balanceSheet(vouchers, accounts);
  assert.equal(bs.totalAssetsMinor, 150_000);
  assert.equal(bs.totalLiabilitiesAndEquityMinor, 150_000);
});

test("VAT summary nets output against input tax", () => {
  const invoice = {
    id: "inv1",
    partyId: "p1",
    vatMinor: 15_000,
    nhilMinor: 2_500,
    getfundMinor: 2_500,
    lines: [{ description: "x", quantity: 1, unitPriceMinor: 100_000, taxCategory: "standard" as const, lineTotalMinor: 100_000, taxableMinor: 100_000, vatMinor: 15_000, nhilMinor: 2_500, getfundMinor: 2_500 }],
  } as Invoice;
  const voucher = {
    id: "v1",
    type: "purchase" as const,
    status: "posted" as const,
    lines: [],
    vatMinor: 5_000,
    nhilMinor: 0,
    getfundMinor: 0,
  } as unknown as Voucher;
  const summary = vatSummary([invoice], [voucher]);
  assert.equal(summary.netVatMinor, 10_000);
  assert.equal(summary.taxableSalesMinor, 100_000);
});

test("AR aging buckets an overdue invoice", () => {
  const payment: Payment = {
    id: "pay1",
    invoiceId: "inv1",
    date: "2026-01-01",
    amountMinor: 0,
    currency: "GHS",
    method: "cash",
  };
  const invoice = {
    id: "inv1",
    partyId: "p1",
    dueDate: "2025-10-01",
    totalMinor: 100_000,
    amountPaidMinor: 0,
    status: "sent",
    lines: [],
  } as unknown as Invoice;
  const result = arApAging(
    [{ id: "p1", name: "Customer", type: "customer", currency: "GHS" }],
    [invoice],
    [payment],
    [],
    "2026-01-01",
  );
  assert.equal(result.customers[0].buckets.over90Minor, 100_000);
});

test("ledger and day book report posted activity", () => {
  const accounts: Account[] = [
    { id: "cash", code: "1000", name: "Cash", type: "asset", group: "Assets", openingBalanceMinor: 0 },
  ];
  const voucher = {
    id: "v1",
    number: "JV-1",
    date: "2026-01-05",
    narration: "Sale",
    status: "posted",
    lines: [
      { accountId: "cash", debitMinor: 50_000, creditMinor: 0 },
      { accountId: "sales", debitMinor: 0, creditMinor: 50_000 },
    ],
  } as Voucher;
  const invoice = {
    id: "inv1",
    number: "INV-1",
    date: "2026-01-06",
    status: "sent",
    partyId: "p1",
    totalMinor: 100_000,
  } as Invoice;
  const ledger = accountLedger([voucher], accounts, "cash");
  assert.equal(ledger[0].balanceMinor, 50_000);
  const book = dayBook([voucher], [invoice]);
  assert.equal(book.length, 3);
  assert.equal(book[2].source, "invoice");
});

test("money helpers round through minor units", () => {
  assert.equal(parseMoney("1,200.50"), 120_050);
  assert.equal(fromMinor(120_050), 1200.5);
});
