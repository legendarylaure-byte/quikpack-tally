import type {
  Account,
  Invoice,
  Party,
  Payment,
  StockDoc,
  StockMovement,
  Voucher,
} from "./domain";
import { valueStock, type ValuationMethod } from "./stock";

function num(value: unknown, fallback = 0): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function isActive<T extends { status?: string; reversedBy?: string }>(record: T): boolean {
  return record.status !== "reversed" && record.status !== "void" && !record.reversedBy;
}

export interface TrialBalanceRow {
  accountId: string;
  debitMinor: number;
  creditMinor: number;
}

export function trialBalance(vouchers: Voucher[]): TrialBalanceRow[] {
  const rows = new Map<string, TrialBalanceRow>();
  for (const voucher of vouchers.filter(isActive)) {
    for (const line of voucher.lines ?? []) {
      if (!line.accountId) {
        continue;
      }
      const row = rows.get(line.accountId) ?? {
        accountId: line.accountId,
        debitMinor: 0,
        creditMinor: 0,
      };
      row.debitMinor += num(line.debitMinor);
      row.creditMinor += num(line.creditMinor);
      rows.set(line.accountId, row);
    }
  }
  return Array.from(rows.values()).sort((a, b) =>
    a.accountId.localeCompare(b.accountId),
  );
}

export interface AccountBalance {
  account: Account;
  balanceMinor: number;
  debitMinor: number;
  creditMinor: number;
}

export function accountBalances(
  vouchers: Voucher[],
  accounts: Account[],
): AccountBalance[] {
  const totals = new Map<string, { debitMinor: number; creditMinor: number }>();
  for (const row of trialBalance(vouchers)) {
    totals.set(row.accountId, {
      debitMinor: row.debitMinor,
      creditMinor: row.creditMinor,
    });
  }

  return accounts.map((account) => {
    const totalsForAccount = totals.get(account.id ?? "") ?? {
      debitMinor: 0,
      creditMinor: 0,
    };
    const increaseOnDebit =
      account.type === "asset" || account.type === "expense";
    const movement = increaseOnDebit
      ? totalsForAccount.debitMinor - totalsForAccount.creditMinor
      : totalsForAccount.creditMinor - totalsForAccount.debitMinor;
    return {
      account,
      debitMinor: totalsForAccount.debitMinor,
      creditMinor: totalsForAccount.creditMinor,
      balanceMinor: num(account.openingBalanceMinor) + movement,
    };
  });
}

export interface ReportGroup {
  name: string;
  rows: AccountBalance[];
  totalMinor: number;
}

export interface ProfitAndLoss {
  income: ReportGroup[];
  expenses: ReportGroup[];
  totalIncomeMinor: number;
  totalExpenseMinor: number;
  netProfitMinor: number;
}

function groupBalances(rows: AccountBalance[]): ReportGroup[] {
  const groups = new Map<string, AccountBalance[]>();
  for (const row of rows) {
    const name = row.account.group || "Unclassified";
    const list = groups.get(name) ?? [];
    list.push(row);
    groups.set(name, list);
  }
  return Array.from(groups.entries())
    .map(([name, list]) => ({
      name,
      rows: list,
      totalMinor: list.reduce((sum, row) => sum + row.balanceMinor, 0),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function profitAndLoss(
  vouchers: Voucher[],
  accounts: Account[],
): ProfitAndLoss {
  const balances = accountBalances(vouchers, accounts);
  const income = groupBalances(
    balances.filter((row) => row.account.type === "income"),
  );
  const expenses = groupBalances(
    balances.filter((row) => row.account.type === "expense"),
  );
  const totalIncomeMinor = income.reduce((sum, group) => sum + group.totalMinor, 0);
  const totalExpenseMinor = expenses.reduce((sum, group) => sum + group.totalMinor, 0);
  return {
    income,
    expenses,
    totalIncomeMinor,
    totalExpenseMinor,
    netProfitMinor: totalIncomeMinor - totalExpenseMinor,
  };
}

export interface BalanceSheet {
  assets: ReportGroup[];
  liabilities: ReportGroup[];
  equity: ReportGroup[];
  retainedEarningsMinor: number;
  totalAssetsMinor: number;
  totalLiabilitiesAndEquityMinor: number;
}

export function balanceSheet(
  vouchers: Voucher[],
  accounts: Account[],
): BalanceSheet {
  const balances = accountBalances(vouchers, accounts);
  const assets = groupBalances(balances.filter((row) => row.account.type === "asset"));
  const liabilities = groupBalances(
    balances.filter((row) => row.account.type === "liability"),
  );
  const equity = groupBalances(balances.filter((row) => row.account.type === "equity"));
  const retainedEarningsMinor = profitAndLoss(vouchers, accounts).netProfitMinor;
  const totalAssetsMinor = assets.reduce((sum, group) => sum + group.totalMinor, 0);
  const totalLiabilitiesAndEquityMinor =
    liabilities.reduce((sum, group) => sum + group.totalMinor, 0) +
    equity.reduce((sum, group) => sum + group.totalMinor, 0) +
    retainedEarningsMinor;
  return {
    assets,
    liabilities,
    equity,
    retainedEarningsMinor,
    totalAssetsMinor,
    totalLiabilitiesAndEquityMinor,
  };
}

export interface VatSummary {
  outputVatMinor: number;
  outputNhilMinor: number;
  outputGetfundMinor: number;
  inputVatMinor: number;
  inputNhilMinor: number;
  inputGetfundMinor: number;
  netVatMinor: number;
  netNhilMinor: number;
  netGetfundMinor: number;
  taxableSalesMinor: number;
  exemptSalesMinor: number;
}

export function vatSummary(invoices: Invoice[], vouchers: Voucher[]): VatSummary {
  const activeInvoices = invoices.filter(isActive);
  const activeVouchers = vouchers.filter(isActive);

  const outputVatMinor = activeInvoices.reduce((sum, inv) => sum + num(inv.vatMinor), 0);
  const outputNhilMinor = activeInvoices.reduce((sum, inv) => sum + num(inv.nhilMinor), 0);
  const outputGetfundMinor = activeInvoices.reduce(
    (sum, inv) => sum + num(inv.getfundMinor),
    0,
  );
  const inputVatMinor = activeVouchers.reduce((sum, v) => sum + num(v.vatMinor), 0);
  const inputNhilMinor = activeVouchers.reduce((sum, v) => sum + num(v.nhilMinor), 0);
  const inputGetfundMinor = activeVouchers.reduce(
    (sum, v) => sum + num(v.getfundMinor),
    0,
  );

  return {
    outputVatMinor,
    outputNhilMinor,
    outputGetfundMinor,
    inputVatMinor,
    inputNhilMinor,
    inputGetfundMinor,
    netVatMinor: outputVatMinor - inputVatMinor,
    netNhilMinor: outputNhilMinor - inputNhilMinor,
    netGetfundMinor: outputGetfundMinor - inputGetfundMinor,
    taxableSalesMinor: activeInvoices.reduce(
      (sum, inv) =>
        sum +
        (inv.lines ?? [])
          .filter((line) => line.taxCategory === "standard")
          .reduce((inner, line) => inner + num(line.taxableMinor), 0),
      0,
    ),
    exemptSalesMinor: activeInvoices.reduce(
      (sum, inv) =>
        sum +
        (inv.lines ?? [])
          .filter((line) => line.taxCategory !== "standard")
          .reduce((inner, line) => inner + num(line.lineTotalMinor), 0),
      0,
    ),
  };
}

export interface AgingBucket {
  currentMinor: number;
  days31To60Minor: number;
  days61To90Minor: number;
  over90Minor: number;
  totalMinor: number;
}

export interface AgingRow {
  partyId: string;
  partyName: string;
  type: "customer" | "supplier";
  buckets: AgingBucket;
}

function emptyBuckets(): AgingBucket {
  return {
    currentMinor: 0,
    days31To60Minor: 0,
    days61To90Minor: 0,
    over90Minor: 0,
    totalMinor: 0,
  };
}

export function arApAging(
  parties: Party[],
  invoices: Invoice[],
  payments: Payment[],
  vouchers: Voucher[],
  asOf: string,
): { customers: AgingRow[]; suppliers: AgingRow[] } {
  const asOfTime = new Date(asOf).getTime();
  const paidByInvoice = new Map<string, number>();
  const paidByParty = new Map<string, number>();
  for (const payment of payments) {
    if (payment.invoiceId) {
      paidByInvoice.set(
        payment.invoiceId,
        (paidByInvoice.get(payment.invoiceId) ?? 0) + num(payment.amountMinor),
      );
    }
    if (payment.partyId) {
      paidByParty.set(
        payment.partyId,
        (paidByParty.get(payment.partyId) ?? 0) + num(payment.amountMinor),
      );
    }
  }

  const rows = new Map<string, AgingRow>();
  for (const invoice of invoices.filter(isActive)) {
    const outstanding =
      num(invoice.totalMinor) -
      num(invoice.amountPaidMinor) -
      (paidByInvoice.get(invoice.id ?? "") ?? 0);
    if (outstanding <= 0) {
      continue;
    }
    const row = rows.get(invoice.partyId) ?? {
      partyId: invoice.partyId,
      partyName:
        parties.find((party) => party.id === invoice.partyId)?.name ?? invoice.partyId,
      type: "customer" as const,
      buckets: emptyBuckets(),
    };
    const days = Math.max(
      0,
      Math.floor((asOfTime - new Date(invoice.dueDate).getTime()) / 86_400_000),
    );
    if (days <= 30) {
      row.buckets.currentMinor += outstanding;
    } else if (days <= 60) {
      row.buckets.days31To60Minor += outstanding;
    } else if (days <= 90) {
      row.buckets.days61To90Minor += outstanding;
    } else {
      row.buckets.over90Minor += outstanding;
    }
    row.buckets.totalMinor += outstanding;
    rows.set(invoice.partyId, row);
  }

  const customers = Array.from(rows.values()).sort(
    (a, b) => b.buckets.totalMinor - a.buckets.totalMinor,
  );

  const suppliers: AgingRow[] = [];
  for (const party of parties.filter((p) => p.type === "supplier" || p.type === "both")) {
    // Supplier balances come from purchase/credit-note vouchers; payments reduce them.
    const owing = num(paymentTotalsForParty(vouchers, party.id ?? "")) -
      (paidByParty.get(party.id ?? "") ?? 0);
    if (owing <= 0) {
      continue;
    }
    const buckets = emptyBuckets();
    buckets.currentMinor = owing;
    buckets.totalMinor = owing;
    suppliers.push({
      partyId: party.id ?? "",
      partyName: party.name,
      type: "supplier",
      buckets,
    });
  }

  return { customers, suppliers };
}

function paymentTotalsForParty(vouchers: Voucher[], partyId: string): number {
  return vouchers
    .filter(isActive)
    .filter((voucher) => voucher.partyId === partyId)
    .filter((voucher) => voucher.type === "purchase" || voucher.type === "debitNote")
    .reduce((sum, voucher) => sum + num(voucher.baseAmountGhsMinor), 0);
}

export interface StockMovementRow {
  itemId: string;
  location: string;
  name: string;
  quantityIn: number;
  quantityOut: number;
  onHand: number;
  valueMinor: number;
  reorderLevel: number;
}

export function stockMovementReport(
  stock: StockDoc[],
  movements: StockMovement[],
  items: Array<{ id?: string; name: string }>,
  method: ValuationMethod = "weighted",
): StockMovementRow[] {
  return stock.map((doc) => {
    const relevant = movements.filter(
      (movement) =>
        movement.itemId === doc.itemId && movement.location === doc.location,
    );
    const valuation = valueStock(relevant, method);
    return {
      itemId: doc.itemId,
      location: doc.location,
      name: items.find((item) => item.id === doc.itemId)?.name ?? doc.itemId,
      quantityIn: relevant
        .filter((movement) => movement.direction === "in")
        .reduce((sum, movement) => sum + num(movement.quantity), 0),
      quantityOut: relevant
        .filter((movement) => movement.direction === "out")
        .reduce((sum, movement) => sum + num(movement.quantity), 0),
      onHand: valuation.quantity || num(doc.quantity),
      valueMinor: valuation.valueMinor || num(doc.quantity) * num(doc.unitCostMinor),
      reorderLevel: num(doc.reorderLevel),
    };
  });
}

export interface CashflowRow {
  date: string;
  type: string;
  narration: string;
  amountMinor: number;
}

export function cashflowLite(vouchers: Voucher[]): {
  rows: CashflowRow[];
  netMinor: number;
} {
  const rows = vouchers
    .filter(isActive)
    .filter((voucher) =>
      ["payment", "receipt", "contra", "expense"].includes(voucher.type),
    )
    .map((voucher) => ({
      date: voucher.date,
      type: voucher.type,
      narration: voucher.narration,
      amountMinor:
        voucher.type === "receipt"
          ? num(voucher.baseAmountGhsMinor)
          : -num(voucher.baseAmountGhsMinor),
    }))
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));
  return {
    rows,
    netMinor: rows.reduce((sum, row) => sum + row.amountMinor, 0),
  };
}

export interface LedgerRow {
  date: string;
  voucherNumber: string;
  narration: string;
  accountName: string;
  debitMinor: number;
  creditMinor: number;
  balanceMinor: number;
}

export function accountLedger(
  vouchers: Voucher[],
  accounts: Account[],
  accountId?: string,
): LedgerRow[] {
  const rows: LedgerRow[] = [];
  let balanceMinor = 0;
  const sorted = vouchers
    .filter(isActive)
    .slice()
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));
  for (const voucher of sorted) {
    for (const line of voucher.lines ?? []) {
      if (accountId && line.accountId !== accountId) {
        continue;
      }
      const debitMinor = num(line.debitMinor);
      const creditMinor = num(line.creditMinor);
      const account = accounts.find((item) => item.id === line.accountId);
      const increasesOnDebit =
        account?.type === "asset" || account?.type === "expense";
      balanceMinor += increasesOnDebit
        ? debitMinor - creditMinor
        : creditMinor - debitMinor;
      rows.push({
        date: voucher.date,
        voucherNumber: voucher.number,
        narration: voucher.narration,
        accountName: account?.name ?? line.accountId,
        debitMinor,
        creditMinor,
        balanceMinor,
      });
    }
  }
  return rows;
}

export interface DayBookRow {
  date: string;
  number: string;
  source: string;
  description: string;
  debitMinor: number;
  creditMinor: number;
}

export function dayBook(vouchers: Voucher[], invoices: Invoice[]): DayBookRow[] {
  const rows: DayBookRow[] = [];
  for (const voucher of vouchers.filter(isActive)) {
    for (const line of voucher.lines ?? []) {
      rows.push({
        date: voucher.date,
        number: voucher.number,
        source: voucher.type,
        description: line.description || voucher.narration,
        debitMinor: num(line.debitMinor),
        creditMinor: num(line.creditMinor),
      });
    }
  }
  for (const invoice of invoices.filter(isActive)) {
    rows.push({
      date: invoice.date,
      number: invoice.number,
      source: "invoice",
      description: invoice.billTo || invoice.partyId,
      debitMinor: num(invoice.totalMinor),
      creditMinor: 0,
    });
  }
  return rows.sort((a, b) =>
    String(a.date).localeCompare(String(b.date)) || a.number.localeCompare(b.number),
  );
}
