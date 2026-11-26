import { formatMoney } from "./money";
import { valueStock } from "./stock";
import {
  arApAging,
  profitAndLoss,
  vatSummary,
  type AgingBucket,
} from "./reports";
import { FEATURES, type FeatureKey, type Role } from "./permissions";
import {
  PLAYBOOKS,
  ROLE_SUMMARY,
  ROLE_TITLE,
  TIPS,
  type DashboardTip,
} from "./dashboard-copy";
import type {
  Account,
  CompanySettings,
  Invoice,
  Party,
  Payment,
  StockDoc,
  StockMovement,
  Voucher,
} from "./domain";

export type DashboardSeverity = "critical" | "attention" | "info";
export type DashboardTone = "healthy" | "attention" | "critical" | "info";

export interface DashboardKpi {
  key: string;
  label: string;
  value: string;
  note: string;
  tipKey: string;
  tone?: DashboardTone;
  glyph?: string;
  visual?: "spark" | "progress" | "plain";
  series?: number[];
  progress?: number;
}

export interface DashboardFocusCheck {
  key: string;
  label: string;
  icon: string;
  active: boolean;
  tipKey: string;
}

export interface DashboardAttention {
  key: string;
  severity: DashboardSeverity;
  title: string;
  detail: string;
  value?: string;
  href?: string;
  tipKey: string;
  ctaLabel?: string;
}

export interface DashboardRow {
  label: string;
  value: string;
  note?: string;
}

export interface DashboardBlock {
  key: string;
  title: string;
  subtitle?: string;
  rows: DashboardRow[];
}

export interface DashboardAction {
  label: string;
  href: string;
  primary?: boolean;
  feature?: FeatureKey;
}

export interface DashboardHero {
  eyebrow: string;
  headline: string;
  detail: string;
  metric: string;
  metricLabel: string;
  focusCount: number;
  focusNote: string;
  actionLabel: string;
  actionHref: string;
  tipKey: string;
}

export interface DashboardSnapshot {
  role: Role;
  title: string;
  value: string;
  note: string;
  tone: DashboardTone;
  href: string;
  tipKey: string;
}

export interface DashboardChartItem {
  label: string;
  value: string;
  ratio?: number;
  tone?: DashboardTone;
  note?: string;
  time?: string;
}

export interface DashboardChart {
  key: string;
  title: string;
  subtitle?: string;
  type: "bars" | "stack" | "timeline" | "heat" | "donut";
  items: DashboardChartItem[];
  tipKey: string;
  emptyText?: string;
}

export interface DashboardBrief {
  role: Role;
  accent: Role;
  title: string;
  summary: string;
  accessNote: string;
  can: string[];
  cannot: string[];
  currencyNote: string;
  trendNote: string;
  branch: string;
  hero: DashboardHero;
  focusChecks: DashboardFocusCheck[];
  kpis: DashboardKpi[];
  attention: DashboardAttention[];
  blocks: DashboardBlock[];
  charts: DashboardChart[];
  snapshots: DashboardSnapshot[];
  isEmpty: boolean;
  actions: DashboardAction[];
  playbook: Array<{ title: string; detail: string; href?: string }>;
  tips: Record<string, DashboardTip>;
}

export interface DashboardData {
  accounts?: Account[];
  parties?: Array<{ id?: string; name?: string; type?: string }>;
  items?: Array<{ id?: string; name?: string; sku?: string; reorderLevel?: number }>;
  vouchers?: Voucher[];
  invoices?: Invoice[];
  payments?: Payment[];
  stock?: StockDoc[];
  movements?: StockMovement[];
  settings?: CompanySettings | Record<string, unknown>;
  auditLogs?: Array<Record<string, unknown> & { id?: string }>;
  users?: Array<{ uid?: string; email?: string; role?: string; status?: string }>;
}

interface BuildInput {
  role: Role;
  can: (feature: FeatureKey) => boolean;
  data: DashboardData;
  now?: Date;
}

function num(value: unknown, fallback = 0): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function daysLate(dueDate: string, today: string): number {
  const diff = new Date(today).getTime() - new Date(dueDate).getTime();
  return Math.max(0, Math.floor(diff / 86_400_000));
}

function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

function ratio(value: number, total: number): number {
  return total > 0 ? Math.max(0, Math.min(1, value / total)) : 0;
}

function toneForAmount(value: number): DashboardTone {
  return value < 0 ? "critical" : "healthy";
}

function attention(
  key: string,
  severity: DashboardSeverity,
  title: string,
  detail: string,
  tipKey: string,
  value?: string,
  href?: string,
  ctaLabel?: string,
): DashboardAttention {
  return { key, severity, title, detail, tipKey, value, href, ctaLabel };
}

function agingRows(bucket: AgingBucket): DashboardRow[] {
  return [
    { label: "Current", value: formatMoney(bucket.currentMinor) },
    { label: "31–60 days", value: formatMoney(bucket.days31To60Minor) },
    { label: "61–90 days", value: formatMoney(bucket.days61To90Minor) },
    { label: "Over 90 days", value: formatMoney(bucket.over90Minor) },
    { label: "Total", value: formatMoney(bucket.totalMinor) },
  ];
}

function dailySales(
  invoices: Invoice[],
  today: string,
  days = 7,
): Array<{ label: string; value: number }> {
  const base = new Date(`${today}T00:00:00.000Z`);
  return Array.from({ length: days }, (_, index) => {
    const day = new Date(base);
    day.setUTCDate(day.getUTCDate() - (days - 1 - index));
    const key = day.toISOString().slice(0, 10);
    const value = invoices
      .filter((invoice) => invoice.status !== "void" && invoice.date === key)
      .reduce((sum, invoice) => sum + num(invoice.totalMinor), 0);
    return { label: key.slice(5), value };
  });
}

export function buildDashboardBrief({ role, can, data, now = new Date() }: BuildInput): DashboardBrief {
  const today = dateKey(now);
  const month = today.slice(0, 7);
  const stock = data.stock ?? [];
  const items = data.items ?? [];
  const invoices = data.invoices ?? [];
  const vouchers = data.vouchers ?? [];
  const payments = data.payments ?? [];
  const parties = data.parties ?? [];
  const accounts = data.accounts ?? [];
  const movements = data.movements ?? [];
  const auditLogs = data.auditLogs ?? [];
  const users = data.users ?? [];

  const itemName = (id: string) =>
    items.find((item) => item.id === id)?.name ??
    invoices
      .flatMap((invoice) => invoice.lines ?? [])
      .find((line) => line.itemId === id)?.description ??
    id;

  const lowStock = stock
    .filter((row) => num(row.quantity) <= num(row.reorderLevel))
    .map((row) => {
      const quantity = num(row.quantity);
      const reorder = num(row.reorderLevel);
      return {
        itemId: row.itemId,
        name: itemName(row.itemId),
        location: row.location || "Main",
        quantity,
        reorderLevel: reorder,
        severity: quantity <= 0 ? ("critical" as const) : ("attention" as const),
      };
    })
    .sort((a, b) => a.quantity - b.quantity);

  const activeInvoices = invoices.filter(
    (invoice) => invoice.status !== "void" && !String(invoice.status).includes("reversed"),
  );
  const overdue = activeInvoices.filter(
    (invoice) =>
      invoice.status === "sent" &&
      !!invoice.dueDate &&
      invoice.dueDate < today,
  );
  const awaitingPayment = activeInvoices.filter(
    (invoice) =>
      invoice.status === "sent" &&
      num(invoice.totalMinor) - num(invoice.amountPaidMinor) > 0,
  );
  const paidInvoicesCount = activeInvoices.filter((invoice) => invoice.status === "paid").length;
  const draftInvoicesCount = invoices.filter((invoice) => invoice.status === "draft").length;
  const voidInvoicesCount = invoices.filter((invoice) => invoice.status === "void").length;

  const todayInvoices = activeInvoices.filter((invoice) => invoice.date === today);
  const monthInvoices = activeInvoices.filter((invoice) => invoice.date.startsWith(month));
  const salesTodayMinor = todayInvoices.reduce(
    (sum, invoice) => sum + num(invoice.totalMinor),
    0,
  );
  const salesMonthMinor = monthInvoices.reduce(
    (sum, invoice) => sum + num(invoice.totalMinor),
    0,
  );
  const salesHistoryDays = new Set(
    activeInvoices
      .filter((invoice) => num(invoice.totalMinor) > 0)
      .map((invoice) => invoice.date),
  ).size;
  const salesSeries = salesHistoryDays >= 2 ? dailySales(invoices, today) : undefined;

  const activeVouchers = vouchers.filter(
    (voucher) => voucher.status !== "reversed" && !voucher.reversedBy,
  );
  const cashInMinor = activeVouchers
    .filter((voucher) => voucher.type === "receipt")
    .reduce((sum, voucher) => sum + num(voucher.baseAmountGhsMinor), 0);
  const cashOutMinor = activeVouchers
    .filter((voucher) => ["payment", "expense", "contra"].includes(voucher.type))
    .reduce((sum, voucher) => sum + num(voucher.baseAmountGhsMinor), 0);
  const netCashMinor = cashInMinor - cashOutMinor;

  const pnl = profitAndLoss(activeVouchers as Voucher[], accounts as Account[]);
  const vat = vatSummary(activeInvoices as Invoice[], activeVouchers as Voucher[]);
  const taxDueMinor = vat.netVatMinor + vat.netNhilMinor + vat.netGetfundMinor;
  const aging = arApAging(
    parties as unknown as Party[],
    invoices as Invoice[],
    payments as Payment[],
    vouchers as Voucher[],
    today,
  );
  const receivableMinor = aging.customers.reduce(
    (sum, row) => sum + row.buckets.totalMinor,
    0,
  );
  const payableMinor = aging.suppliers.reduce(
    (sum, row) => sum + row.buckets.totalMinor,
    0,
  );

  const settings = (data.settings ?? {}) as Partial<CompanySettings>;
  const valuationMethod = settings.valuationMethod === "fifo" ? "fifo" : "weighted";
  const movementsByKey = new Map<string, StockMovement[]>();
  for (const movement of movements) {
    const key = `${movement.itemId}|${movement.location || "Main"}`;
    const rows = movementsByKey.get(key) ?? [];
    rows.push(movement);
    movementsByKey.set(key, rows);
  }
  const stockValueMinor = stock.reduce((sum, row) => {
    const valued = valueStock(
      movementsByKey.get(`${row.itemId}|${row.location || "Main"}`) ?? [],
      valuationMethod,
    );
    return sum + (valued.quantity > 0 ? valued.valueMinor : num(row.quantity) * num(row.unitCostMinor));
  }, 0);
  const stockByLocation = new Map<string, { rows: number; quantity: number; valueMinor: number }>();
  for (const row of stock) {
    const location = row.location || "Main";
    const current = stockByLocation.get(location) ?? { rows: 0, quantity: 0, valueMinor: 0 };
    current.rows += 1;
    current.quantity += num(row.quantity);
    current.valueMinor += num(row.quantity) * num(row.unitCostMinor);
    stockByLocation.set(location, current);
  }

  const soldByDescription = new Map<string, number>();
  for (const invoice of todayInvoices) {
    for (const line of invoice.lines ?? []) {
      const label = line.description || itemName(line.itemId ?? "");
      soldByDescription.set(label, (soldByDescription.get(label) ?? 0) + num(line.quantity));
    }
  }
  const topSold = Array.from(soldByDescription.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const reversals = vouchers.filter(
    (voucher) => voucher.status === "reversed" || voucher.reversalOf,
  );
  const missingEvidence = activeVouchers.filter((voucher) => !voucher.attachmentUrl).length;
  const auditToday = auditLogs.filter((log) => String(log.at ?? "").slice(0, 10) === today);
  const riskyAudit = auditLogs.filter((log) =>
    ["delete", "export", "reversal"].includes(String(log.action ?? "").toLowerCase()),
  );
  const pendingUsers = users.filter((user) => user.status && user.status !== "approved");
  const branch = settings.branches?.[0] || "Main";

  const commonAttention: DashboardAttention[] = [];
  if (lowStock.length > 0) {
    commonAttention.push(
      attention(
        "low-stock",
        lowStock.some((row) => row.quantity <= 0) ? "critical" : "attention",
        `Stock needs attention · ${lowStock.length} item${lowStock.length === 1 ? "" : "s"}`,
        "These products have reached the minimum stock level you set. Check them before selling, or order more from your supplier.",
        "reorder",
        plural(lowStock.length, "item"),
        "/inventory",
        "Check stock",
      ),
    );
  }
  if (overdue.length > 0) {
    const worst = Math.max(...overdue.map((invoice) => daysLate(invoice.dueDate, today)));
    commonAttention.push(
      attention(
        "overdue-invoices",
        worst > 30 ? "critical" : "attention",
        `${plural(overdue.length, "sent invoice")} overdue`,
        "An overdue invoice is unpaid after its due date. Drafts and void invoices are not included.",
        "overdue",
        `${worst} day${worst === 1 ? "" : "s"} longest`,
        "/invoices",
        "Follow up",
      ),
    );
  }

  const access = FEATURES.filter((feature) => can(feature.key)).map((feature) => feature.label);
  const noAccess = FEATURES.filter((feature) => !can(feature.key)).map((feature) => feature.label);

  const kpis: DashboardKpi[] = [];
  const attentionList: DashboardAttention[] = [...commonAttention];
  const blocks: DashboardBlock[] = [];
  const charts: DashboardChart[] = [];
  const snapshots: DashboardSnapshot[] = [];
  const actions: DashboardAction[] = [];

  if (role === "admin") {
    kpis.push(
      { key: "sales", label: "Sales today", value: formatMoney(salesTodayMinor), note: "Invoices created today", tipKey: "salesToday", tone: "healthy", glyph: "₵", visual: salesSeries ? "spark" : "plain", series: salesSeries?.map((day) => day.value) },
      { key: "profit", label: "Net profit estimate", value: formatMoney(pnl.netProfitMinor), note: "Based on posted vouchers", tipKey: "netProfit", tone: toneForAmount(pnl.netProfitMinor), glyph: "↗" },
      { key: "cash", label: "Cash movement", value: formatMoney(netCashMinor), note: "Money in minus money out", tipKey: "cashMovement", tone: netCashMinor < 0 ? "attention" : "healthy", glyph: "⇄" },
      { key: "receivables", label: "Customer balance", value: formatMoney(receivableMinor), note: "Still owed by customers", tipKey: "receivables", tone: "info", glyph: "◎" },
      { key: "stock", label: "Stock value", value: formatMoney(stockValueMinor), note: "Current stock estimate", tipKey: "stockValue", tone: "info", glyph: "▦" },
      { key: "team", label: "Team status", value: String(pendingUsers.length), note: "Pending or suspended users", tipKey: "pendingUsers", tone: pendingUsers.length > 0 ? "attention" : "healthy", glyph: "◉", visual: "progress", progress: Math.min(1, pendingUsers.length / 5) },
    );

    if (pendingUsers.length > 0) {
      attentionList.push(
        attention("pending-users", "attention", `${plural(pendingUsers.length, "user")} need access review`, "Pending or suspended users cannot use the workspace until access is corrected.", "pendingUsers", plural(pendingUsers.length, "user"), "/admin/users", "Review users"),
      );
    }
    if (riskyAudit.length > 0) {
      attentionList.push(
        attention("audit-risk", "attention", `${plural(riskyAudit.length, "audit event")} to review`, "Delete, export and reversal actions change or reveal important information.", "exceptions", plural(riskyAudit.length, "event"), "/audit", "Open audit"),
      );
    }

    blocks.push(
      {
        key: "role-summaries",
        title: "Role summaries",
        subtitle: "Read-only snapshots from each area",
        rows: [
          { label: "Accountant", value: `Net profit ${formatMoney(pnl.netProfitMinor)}`, note: `${plural(awaitingPayment.length, "invoice")} waiting for payment` },
          { label: "Cashier", value: `${plural(todayInvoices.length, "invoice")} today`, note: `${formatMoney(salesTodayMinor)} billed` },
          { label: "Viewer", value: `${plural(stock.length, "stock row")}`, note: `${plural(lowStock.length, "low-stock item")}` },
          { label: "Auditor", value: `${plural(auditToday.length, "audit event")} today`, note: `${plural(riskyAudit.length, "exception")} to review` },
        ],
      },
      {
        key: "business-pulse",
        title: "Business pulse",
        rows: [
          { label: "Sales this month", value: formatMoney(salesMonthMinor) },
          { label: "Customer balance", value: formatMoney(receivableMinor) },
          { label: "Supplier balance", value: formatMoney(payableMinor) },
          { label: "VAT net", value: formatMoney(vat.netVatMinor + vat.netNhilMinor + vat.netGetfundMinor) },
        ],
      },
    );

    snapshots.push(
      { role: "accountant", title: "Accountant", value: formatMoney(pnl.netProfitMinor), note: `${plural(awaitingPayment.length, "invoice")} waiting`, tone: toneForAmount(pnl.netProfitMinor), href: "/reports", tipKey: "netProfit" },
      { role: "cashier", title: "Cashier", value: `${todayInvoices.length} invoices`, note: `${formatMoney(salesTodayMinor)} billed`, tone: "info", href: "/invoices", tipKey: "salesToday" },
      { role: "viewer", title: "Viewer", value: `${lowStock.length} stock alerts`, note: `${plural(stock.length, "stock row")} on file`, tone: lowStock.length > 0 ? "attention" : "healthy", href: "/inventory", tipKey: "reorder" },
      { role: "auditor", title: "Auditor", value: `${riskyAudit.length} exceptions`, note: `${plural(auditToday.length, "event")} today`, tone: riskyAudit.length > 0 ? "attention" : "healthy", href: "/audit", tipKey: "exceptions" },
    );

    const cashPeak = Math.max(cashInMinor, cashOutMinor, Math.abs(netCashMinor), 1);
    charts.push(
      {
        key: "sales-week",
        title: "Sales this week",
        subtitle: salesSeries ? "Recorded invoices by day" : "History is still building",
        type: "bars",
        tipKey: "trend",
        emptyText: "Not enough history yet. Daily sales bars appear after two recorded days.",
        items: (salesSeries ?? []).map((day) => ({
          label: day.label,
          value: formatMoney(day.value),
          ratio: ratio(day.value, Math.max(...(salesSeries ?? [{ value: 1 }]).map((entry) => entry.value), 1)),
          tone: "healthy" as DashboardTone,
        })),
      },
      {
        key: "cash-split",
        title: "Cash movement",
        subtitle: "Money in, money out and the net result",
        type: "bars",
        tipKey: "cashMovement",
        items: [
          { label: "Money in", value: formatMoney(cashInMinor), ratio: ratio(cashInMinor, cashPeak), tone: "healthy" },
          { label: "Money out", value: formatMoney(cashOutMinor), ratio: ratio(cashOutMinor, cashPeak), tone: "attention" },
          { label: "Net", value: formatMoney(netCashMinor), ratio: ratio(Math.abs(netCashMinor), cashPeak), tone: toneForAmount(netCashMinor) },
        ],
      },
    );

    actions.push(
      { label: "Manage users", href: "/admin/users", primary: true, feature: "settings" },
      { label: "Open audit", href: "/audit", feature: "reports" },
      { label: "View reports", href: "/reports", feature: "reports" },
      { label: "Check stock", href: "/inventory", feature: "inventory" },
    );
  }

  if (role === "accountant") {
    kpis.push(
      { key: "revenue", label: "Revenue", value: formatMoney(pnl.totalIncomeMinor), note: "Posted income", tipKey: "revenue", tone: "healthy", glyph: "₵", visual: salesSeries ? "spark" : "plain", series: salesSeries?.map((day) => day.value) },
      { key: "profit", label: "Net profit", value: formatMoney(pnl.netProfitMinor), note: "Income minus expenses", tipKey: "netProfit", tone: toneForAmount(pnl.netProfitMinor), glyph: "↗" },
      { key: "cash", label: "Net cash movement", value: formatMoney(netCashMinor), note: `${formatMoney(cashInMinor)} in · ${formatMoney(cashOutMinor)} out`, tipKey: "cashMovement", tone: toneForAmount(netCashMinor), glyph: "⇄" },
      { key: "receivables", label: "Receivables", value: formatMoney(receivableMinor), note: "Customer balances", tipKey: "receivables", tone: "info", glyph: "◎" },
      { key: "payables", label: "Payables", value: formatMoney(payableMinor), note: "Supplier balances", tipKey: "payables", tone: payableMinor > 0 ? "attention" : "healthy", glyph: "◑" },
      { key: "vat", label: "Net tax", value: formatMoney(vat.netVatMinor + vat.netNhilMinor + vat.netGetfundMinor), note: "VAT + NHIL + GETFund", tipKey: "vat", tone: "info", glyph: "%" },
      { key: "stock", label: "Stock value", value: formatMoney(stockValueMinor), note: "Based on stock movements", tipKey: "stockValue", tone: "info", glyph: "▦" },
    );

    if (payableMinor > 0) {
      attentionList.push(
        attention("supplier-balance", "attention", `${plural(aging.suppliers.length, "supplier")} owe money`, "Supplier balances come from posted purchase and debit-note vouchers.", "payables", formatMoney(payableMinor), "/reports", "Open aging"),
      );
    }
    if (reversals.length > 0) {
      attentionList.push(
        attention("reversals", "info", `${plural(reversals.length, "reversal")} recorded`, "A reversal cancels an earlier voucher. Check that the original error was understood.", "reversals", plural(reversals.length, "voucher"), "/vouchers", "Review vouchers"),
      );
    }

    blocks.push(
      { key: "pnl", title: "Profit & Loss", subtitle: "Posted records only", rows: [
        { label: "Total income", value: formatMoney(pnl.totalIncomeMinor) },
        { label: "Total expenses", value: formatMoney(pnl.totalExpenseMinor) },
        { label: "Net profit", value: formatMoney(pnl.netProfitMinor) },
      ] },
      { key: "cashflow", title: "Cashflow", rows: [
        { label: "Money in", value: formatMoney(cashInMinor) },
        { label: "Money out", value: formatMoney(cashOutMinor) },
        { label: "Net movement", value: formatMoney(netCashMinor) },
      ] },
      { key: "aging", title: "AR / AP aging", rows: [...agingRows({
        currentMinor: aging.customers.reduce((s, r) => s + r.buckets.currentMinor, 0),
        days31To60Minor: aging.customers.reduce((s, r) => s + r.buckets.days31To60Minor, 0),
        days61To90Minor: aging.customers.reduce((s, r) => s + r.buckets.days61To90Minor, 0),
        over90Minor: aging.customers.reduce((s, r) => s + r.buckets.over90Minor, 0),
        totalMinor: receivableMinor,
      }), { label: "Suppliers owed", value: formatMoney(payableMinor) }] },
      { key: "vat", title: "VAT / NHIL / GETFund", rows: [
        { label: "Net VAT", value: formatMoney(vat.netVatMinor) },
        { label: "Net NHIL", value: formatMoney(vat.netNhilMinor) },
        { label: "Net GETFund", value: formatMoney(vat.netGetfundMinor) },
        { label: "Taxable sales", value: formatMoney(vat.taxableSalesMinor) },
      ] },
    );

    const pnlPeak = Math.max(pnl.totalIncomeMinor, pnl.totalExpenseMinor, Math.abs(pnl.netProfitMinor), 1);
    const customerBuckets = aging.customers.reduce(
      (sum, row) => ({
        currentMinor: sum.currentMinor + row.buckets.currentMinor,
        days31To60Minor: sum.days31To60Minor + row.buckets.days31To60Minor,
        days61To90Minor: sum.days61To90Minor + row.buckets.days61To90Minor,
        over90Minor: sum.over90Minor + row.buckets.over90Minor,
      }),
      { currentMinor: 0, days31To60Minor: 0, days61To90Minor: 0, over90Minor: 0 },
    );
    charts.push(
      {
        key: "profit-flow",
        title: "Profit flow",
        subtitle: "Income minus expenses from posted records",
        type: "bars",
        tipKey: "netProfit",
        items: [
          { label: "Income", value: formatMoney(pnl.totalIncomeMinor), ratio: ratio(pnl.totalIncomeMinor, pnlPeak), tone: "healthy" },
          { label: "Expenses", value: formatMoney(pnl.totalExpenseMinor), ratio: ratio(pnl.totalExpenseMinor, pnlPeak), tone: "attention" },
          { label: "Net profit", value: formatMoney(pnl.netProfitMinor), ratio: ratio(Math.abs(pnl.netProfitMinor), pnlPeak), tone: toneForAmount(pnl.netProfitMinor) },
        ],
      },
      {
        key: "customer-aging",
        title: "Customer aging",
        subtitle: receivableMinor > 0 ? "How long customers have owed money" : "No customer balances yet",
        type: "stack",
        tipKey: "receivables",
        items: [
          { label: "Current", value: formatMoney(customerBuckets.currentMinor), ratio: ratio(customerBuckets.currentMinor, receivableMinor), tone: "healthy" },
          { label: "31–60", value: formatMoney(customerBuckets.days31To60Minor), ratio: ratio(customerBuckets.days31To60Minor, receivableMinor), tone: "info" },
          { label: "61–90", value: formatMoney(customerBuckets.days61To90Minor), ratio: ratio(customerBuckets.days61To90Minor, receivableMinor), tone: "attention" },
          { label: "90+", value: formatMoney(customerBuckets.over90Minor), ratio: ratio(customerBuckets.over90Minor, receivableMinor), tone: "critical" },
        ],
      },
      {
        key: "tax-split",
        title: "Tax position",
        subtitle: "Net VAT, NHIL and GETFund",
        type: "donut",
        tipKey: "vat",
        items: [
          { label: "VAT", value: formatMoney(vat.netVatMinor), ratio: ratio(Math.abs(vat.netVatMinor), Math.abs(taxDueMinor)), tone: "info" },
          { label: "NHIL", value: formatMoney(vat.netNhilMinor), ratio: ratio(Math.abs(vat.netNhilMinor), Math.abs(taxDueMinor)), tone: "healthy" },
          { label: "GETFund", value: formatMoney(vat.netGetfundMinor), ratio: ratio(Math.abs(vat.netGetfundMinor), Math.abs(taxDueMinor)), tone: "attention" },
        ],
      },
    );

    actions.push(
      { label: "New voucher", href: "/vouchers", primary: true, feature: "vouchers" },
      { label: "Review invoices", href: "/invoices", feature: "invoicing" },
      { label: "Open reports", href: "/reports", feature: "reports" },
      { label: "Check stock", href: "/inventory", feature: "inventory" },
    );
  }

  if (role === "cashier") {
    kpis.push(
      { key: "sales-today", label: "Sales today", value: formatMoney(salesTodayMinor), note: `${plural(todayInvoices.length, "invoice")} created`, tipKey: "salesToday", tone: "healthy", glyph: "₵", visual: salesSeries ? "spark" : "plain", series: salesSeries?.map((day) => day.value) },
      { key: "awaiting", label: "Waiting for payment", value: String(awaitingPayment.length), note: "Sent but not fully paid", tipKey: "awaitingPayment", tone: awaitingPayment.length > 0 ? "attention" : "healthy", glyph: "◷", visual: "progress", progress: Math.min(1, awaitingPayment.length / 5) },
      { key: "low-stock", label: "Low stock", value: String(lowStock.length), note: "Items at reorder level", tipKey: "reorder", tone: lowStock.length > 0 ? "attention" : "healthy", glyph: "▣", visual: "progress", progress: Math.min(1, lowStock.length / 5) },
      { key: "items-sold", label: "Items sold today", value: String(topSold.reduce((sum, [, qty]) => sum + qty, 0)), note: "From invoice lines", tipKey: "itemsSold", tone: "info", glyph: "◆" },
    );

    if (awaitingPayment.length > 0) {
      attentionList.push(
        attention("awaiting-payment", "attention", `${plural(awaitingPayment.length, "invoice")} waiting for payment`, "These invoices were sent but are not fully paid. Confirm payment status with the customer.", "awaitingPayment", plural(awaitingPayment.length, "invoice"), "/invoices", "Open invoices"),
      );
    }

    blocks.push(
      { key: "invoice-status", title: "Invoice status", rows: [
        { label: "Draft", value: String(draftInvoicesCount) },
        { label: "Sent", value: String(activeInvoices.filter((invoice) => invoice.status === "sent").length) },
        { label: "Paid", value: String(paidInvoicesCount) },
        { label: "Void", value: String(voidInvoicesCount) },
      ] },
      { key: "top-items", title: "Top items today", subtitle: topSold.length ? undefined : "No sales recorded today yet.", rows: topSold.length ? topSold.map(([label, qty]) => ({ label, value: plural(qty, "piece") })) : [{ label: "No sales yet", value: "—" }] },
      { key: "cashier-low-stock", title: "Stock to watch", subtitle: lowStock.length ? undefined : "Nothing needs stock attention today.", rows: lowStock.slice(0, 5).map((row) => ({ label: `${row.name} · ${row.location}`, value: `${row.quantity} left`, note: `Reorder at ${row.reorderLevel}` })) },
    );

    const statusCounts = [
      { label: "Draft", value: draftInvoicesCount, tone: "info" as DashboardTone },
      { label: "Sent", value: activeInvoices.filter((invoice) => invoice.status === "sent").length, tone: "attention" as DashboardTone },
      { label: "Paid", value: paidInvoicesCount, tone: "healthy" as DashboardTone },
      { label: "Void", value: voidInvoicesCount, tone: "critical" as DashboardTone },
    ];
    const statusPeak = Math.max(...statusCounts.map((row) => row.value), 1);
    const topPeak = Math.max(...topSold.map(([, qty]) => qty), 1);
    const paymentMix = [
      { label: "Paid", value: paidInvoicesCount, tone: "healthy" as DashboardTone },
      { label: "Awaiting", value: awaitingPayment.length, tone: "attention" as DashboardTone },
      { label: "Draft", value: draftInvoicesCount, tone: "info" as DashboardTone },
      { label: "Void", value: voidInvoicesCount, tone: "critical" as DashboardTone },
    ];
    const paymentTotal = paymentMix.reduce((sum, row) => sum + row.value, 0);
    charts.push(
      {
        key: "payment-health",
        title: "Payment health",
        subtitle: "Paid, awaiting, draft and void invoices",
        type: "donut",
        tipKey: "awaitingPayment",
        items: paymentMix.map((row) => ({ label: row.label, value: String(row.value), ratio: ratio(row.value, paymentTotal), tone: row.tone })),
      },
      {
        key: "invoice-flow",
        title: "Invoice flow",
        subtitle: "Today’s document status",
        type: "bars",
        tipKey: "awaitingPayment",
        items: statusCounts.map((row) => ({ label: row.label, value: String(row.value), ratio: ratio(row.value, statusPeak), tone: row.tone })),
      },
      {
        key: "top-items",
        title: "Top items today",
        subtitle: topSold.length ? "Quantities from invoice lines" : "No sales recorded today yet.",
        type: "bars",
        tipKey: "itemsSold",
        emptyText: "Sell an invoice and your fastest-moving items will appear here.",
        items: topSold.map(([label, qty]) => ({ label, value: plural(qty, "piece"), ratio: ratio(qty, topPeak), tone: "healthy" as DashboardTone })),
      },
      {
        key: "stock-heat",
        title: "Stock heat",
        subtitle: lowStock.length ? "Items to watch before selling" : "All monitored items look healthy",
        type: "heat",
        tipKey: "reorder",
        items: lowStock.length
          ? lowStock.slice(0, 8).map((row) => ({ label: row.name, value: `${row.quantity} left`, tone: row.severity === "critical" ? "critical" : "attention" }))
          : [{ label: "No stock alerts", value: "Healthy", tone: "healthy" }],
      },
    );

    actions.push(
      { label: "Create invoice", href: "/invoices", primary: true, feature: "invoicing" },
      { label: "Check stock", href: "/inventory", feature: "inventory" },
    );
  }

  if (role === "viewer") {
    kpis.push(
      { key: "items", label: "Items on file", value: String(items.length), note: "Item master records", tipKey: "access", tone: "info", glyph: "▤" },
      { key: "stock-rows", label: "Stock locations", value: String(stockByLocation.size), note: "Where stock is held", tipKey: "access", tone: "info", glyph: "⌖" },
      { key: "low-stock", label: "Low stock", value: String(lowStock.length), note: "Read-only alert", tipKey: "reorder", tone: lowStock.length > 0 ? "attention" : "healthy", glyph: "▣", visual: "progress", progress: Math.min(1, lowStock.length / 5) },
      { key: "audit", label: "Recent activity", value: String(auditToday.length), note: "Events recorded today", tipKey: "auditEvents", tone: "info", glyph: "◷" },
    );

    blocks.push(
      { key: "stock-locations", title: "Stock by location", rows: Array.from(stockByLocation.entries()).map(([label, value]) => ({ label, value: `${plural(value.rows, "stock row")} · ${formatMoney(value.valueMinor)}` })) },
      { key: "reports", title: "Reports you can open", rows: [
        { label: "Profit & Loss", value: "Open report", note: "Reports access" },
        { label: "Stock Movement", value: "Open report" },
        { label: "VAT / NHIL / GETFund", value: "Open report" },
      ] },
      { key: "recent", title: "Recent activity", subtitle: auditToday.length ? undefined : "No activity recorded today.", rows: auditToday.slice(0, 5).map((log) => ({ label: `${String(log.action ?? "change")} · ${String(log.collection ?? "record")}`, value: String(log.at ?? "").slice(11, 16) || "—" })) },
    );

    const locationTotal = Array.from(stockByLocation.values()).reduce((sum, row) => sum + row.valueMinor, 0);
    charts.push(
      {
        key: "stock-locations",
        title: "Stock by location",
        subtitle: "Where stock is held and its estimated value",
        type: "donut",
        tipKey: "stockValue",
        emptyText: "No stock locations have been recorded yet.",
        items: Array.from(stockByLocation.entries()).map(([label, value]) => ({ label, value: formatMoney(value.valueMinor), ratio: ratio(value.valueMinor, locationTotal), tone: "info" as DashboardTone })),
      },
      {
        key: "activity",
        title: "Activity timeline",
        subtitle: auditToday.length ? "Today’s recorded changes" : "No activity recorded today.",
        type: "timeline",
        tipKey: "auditEvents",
        emptyText: "Activity will appear here as records change.",
        items: auditToday.slice(0, 5).map((log) => ({ label: `${String(log.action ?? "change")} · ${String(log.collection ?? "record")}`, value: String(log.documentId ?? "").slice(0, 10) || "—", time: String(log.at ?? "").slice(11, 16) || "—", tone: "info" as DashboardTone })),
      },
      {
        key: "report-shortcuts",
        title: "Reports you can open",
        subtitle: "Read-only information",
        type: "heat",
        tipKey: "readOnly",
        items: ["P&L", "Stock Movement", "VAT / NHIL / GETFund", "AR / AP Aging"].map((label) => ({ label, value: "Open", tone: "info" as DashboardTone })),
      },
    );

    actions.push(
      { label: "Check stock", href: "/inventory", primary: true, feature: "inventory" },
      { label: "Open reports", href: "/reports", feature: "reports" },
    );
  }

  if (role === "auditor") {
    kpis.push(
      { key: "audit-today", label: "Audit events today", value: String(auditToday.length), note: "Creates, updates, deletes and exports", tipKey: "auditEvents", tone: "info", glyph: "◷" },
      { key: "exceptions", label: "Exceptions to review", value: String(riskyAudit.length), note: "Delete, export and reversal actions", tipKey: "exceptions", tone: riskyAudit.length > 0 ? "attention" : "healthy", glyph: "!", visual: "progress", progress: Math.min(1, riskyAudit.length / 5) },
      { key: "reversals", label: "Voucher reversals", value: String(reversals.length), note: "Correcting entries", tipKey: "reversals", tone: reversals.length > 0 ? "info" : "healthy", glyph: "↺" },
      { key: "evidence", label: "Vouchers without evidence", value: String(missingEvidence), note: "Check reference evidence", tipKey: "evidence", tone: missingEvidence > 0 ? "attention" : "healthy", glyph: "◇", visual: "progress", progress: Math.min(1, missingEvidence / 5) },
      { key: "voids", label: "Void invoices", value: String(voidInvoicesCount), note: "Cancelled sales documents", tipKey: "exceptions", tone: voidInvoicesCount > 0 ? "attention" : "healthy", glyph: "⊘" },
    );

    if (riskyAudit.length > 0) {
      attentionList.push(
        attention("audit-exceptions", "attention", `${plural(riskyAudit.length, "exception")} to review`, "Delete, export and reversal actions can change or reveal important information.", "exceptions", plural(riskyAudit.length, "event"), "/audit", "Open audit"),
      );
    }
    if (reversals.length > 0) {
      attentionList.push(
        attention("auditor-reversals", "info", `${plural(reversals.length, "reversal")} recorded`, "Trace each reversal back to the original voucher and reason.", "reversals", plural(reversals.length, "voucher"), "/vouchers", "Trace voucher"),
      );
    }

    blocks.push(
      { key: "timeline", title: "Activity timeline", subtitle: auditToday.length ? undefined : "No audit activity today.", rows: auditToday.slice(0, 8).map((log) => ({ label: `${String(log.action ?? "change")} · ${String(log.collection ?? "record")}`, value: String(log.at ?? "").slice(11, 16) || "—", note: String(log.documentId ?? "").slice(0, 12) })) },
      { key: "exception-list", title: "Exception list", rows: riskyAudit.length ? riskyAudit.slice(0, 8).map((log) => ({ label: `${String(log.action ?? "change")} · ${String(log.collection ?? "record")}`, value: String(log.at ?? "").slice(0, 10) || "—" })) : [{ label: "No exceptions found", value: "—" }] },
      { key: "stock-exceptions", title: "Stock exceptions", rows: lowStock.length ? lowStock.slice(0, 5).map((row) => ({ label: `${row.name} · ${row.location}`, value: `${row.quantity} left`, note: `Reorder at ${row.reorderLevel}` })) : [{ label: "No stock exceptions", value: "—" }] },
    );

    const countsByAction = (action: string) =>
      auditLogs.filter((log) => String(log.action ?? "").toLowerCase() === action).length;
    const exceptionCounts = [
      { label: "Delete", value: countsByAction("delete"), tone: "critical" as DashboardTone },
      { label: "Export", value: countsByAction("export"), tone: "attention" as DashboardTone },
      { label: "Reversal", value: countsByAction("reversal"), tone: "attention" as DashboardTone },
      { label: "Void", value: voidInvoicesCount, tone: "info" as DashboardTone },
    ];
    const exceptionPeak = Math.max(...exceptionCounts.map((row) => row.value), 1);
    charts.push(
      {
        key: "audit-timeline",
        title: "Activity timeline",
        subtitle: auditToday.length ? "Today’s recorded changes" : "No activity recorded today.",
        type: "timeline",
        tipKey: "auditEvents",
        emptyText: "Audit events will appear here as records change.",
        items: auditToday.slice(0, 6).map((log) => ({ label: `${String(log.action ?? "change")} · ${String(log.collection ?? "record")}`, value: String(log.documentId ?? "").slice(0, 10) || "—", time: String(log.at ?? "").slice(11, 16) || "—", tone: "info" as DashboardTone })),
      },
      {
        key: "exception-types",
        title: "Exception types",
        subtitle: "Actions that change or reveal information",
        type: "bars",
        tipKey: "exceptions",
        items: exceptionCounts.map((row) => ({ label: row.label, value: String(row.value), ratio: ratio(row.value, exceptionPeak), tone: row.tone })),
      },
      {
        key: "stock-exceptions",
        title: "Stock exceptions",
        subtitle: lowStock.length ? "Items outside healthy range" : "No stock exceptions found",
        type: "heat",
        tipKey: "reorder",
        items: lowStock.length
          ? lowStock.slice(0, 8).map((row) => ({ label: row.name, value: `${row.quantity} left`, tone: row.severity === "critical" ? "critical" : "attention" }))
          : [{ label: "No stock exceptions", value: "Healthy", tone: "healthy" }],
      },
    );

    actions.push(
      { label: "Open audit log", href: "/audit", primary: true, feature: "reports" },
      { label: "Open reports", href: "/reports", feature: "reports" },
      { label: "Check stock", href: "/inventory", feature: "inventory" },
    );
  }

  const severityOrder: Record<DashboardSeverity, number> = { critical: 0, attention: 1, info: 2 };
  attentionList.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
  const invoiceCount = activeInvoices.length;
  const growthBase = Math.max(invoiceCount * 3, 1);
  const kpiProgress: Record<string, number> = {
    sales: invoiceCount ? clamp01(todayInvoices.length / invoiceCount) : 0,
    "sales-today": invoiceCount ? clamp01(todayInvoices.length / invoiceCount) : 0,
    revenue: pnl.totalIncomeMinor > 0 ? clamp01(Math.abs(pnl.netProfitMinor) / pnl.totalIncomeMinor) : 0,
    profit: pnl.totalIncomeMinor > 0 ? clamp01(Math.abs(pnl.netProfitMinor) / pnl.totalIncomeMinor) : 0,
    cash: cashInMinor + cashOutMinor > 0 ? clamp01(cashInMinor / (cashInMinor + cashOutMinor)) : 0,
    receivables: salesMonthMinor > 0 ? clamp01(receivableMinor / salesMonthMinor) : 0,
    payables: cashOutMinor > 0 ? clamp01(payableMinor / cashOutMinor) : 0,
    vat: salesMonthMinor > 0 ? clamp01(Math.abs(taxDueMinor) / salesMonthMinor) : 0,
    stock: stock.length ? clamp01((stock.length - lowStock.length) / stock.length) : 0,
    "low-stock": stock.length ? clamp01(lowStock.length / stock.length) : 0,
    team: users.length ? clamp01((users.length - pendingUsers.length) / users.length) : 0,
    awaiting: invoiceCount ? clamp01(paidInvoicesCount / invoiceCount) : 0,
    "items-sold": clamp01(topSold.reduce((sum, [, qty]) => sum + qty, 0) / growthBase),
    items: stock.length ? clamp01(items.length / Math.max(stock.length, 1)) : 0,
    "stock-rows": stock.length ? clamp01(stockByLocation.size / stock.length) : 0,
    audit: auditLogs.length ? clamp01(auditToday.length / auditLogs.length) : 0,
    "audit-today": auditLogs.length ? clamp01(auditToday.length / auditLogs.length) : 0,
    exceptions: auditLogs.length ? clamp01(riskyAudit.length / auditLogs.length) : 0,
    reversals: vouchers.length ? clamp01(reversals.length / vouchers.length) : 0,
    evidence: activeVouchers.length ? clamp01((activeVouchers.length - missingEvidence) / activeVouchers.length) : 0,
    voids: invoiceCount ? clamp01(voidInvoicesCount / invoiceCount) : 0,
  };
  for (const item of kpis) {
    const next = kpiProgress[item.key];
    if (next !== undefined) {
      item.progress = next;
    }
  }

  const focusChecks: DashboardFocusCheck[] = [
    { key: "stock", label: "Stock", icon: "stock", active: lowStock.length > 0, tipKey: "reorder" },
    { key: "invoices", label: "Invoices", icon: "invoice", active: overdue.length > 0 || awaitingPayment.length > 0, tipKey: "overdue" },
    { key: "access", label: "Access", icon: "users", active: pendingUsers.length > 0, tipKey: "pendingUsers" },
    { key: "tax", label: "Tax", icon: "invoice", active: taxDueMinor > 0 && (role === "admin" || role === "accountant"), tipKey: "vat" },
    { key: "audit", label: "Audit", icon: "shield", active: riskyAudit.length > 0 || reversals.length > 0 || voidInvoicesCount > 0, tipKey: "exceptions" },
  ];

  const focusCount = attentionList.length;
  const firstAction = attentionList.find((item) => item.href);
  const headline = focusCount === 0
    ? "Nothing urgent needs you right now."
    : `${plural(focusCount, "item")} need${focusCount === 1 ? "s" : ""} your attention.`;
  const fallbackAction: Record<Role, { label: string; href: string }> = {
    admin: { label: "View reports", href: "/reports" },
    accountant: { label: "Open reports", href: "/reports" },
    cashier: { label: "Create invoice", href: "/invoices" },
    viewer: { label: "Check stock", href: "/inventory" },
    auditor: { label: "Open audit", href: "/audit" },
  };
  const roleDetail: Record<Role, string> = {
    admin: "You can see every area. Start with the strongest signal, then review the role snapshots below.",
    accountant: "Your focus is accurate books, tax readiness and money owed to or by the business.",
    cashier: "Your focus is fast selling, correct payment status and stock available at the counter.",
    viewer: "You can read everything here. Corrections must be requested from Admin or Accountant.",
    auditor: "Your focus is evidence, unusual activity and changes that need a second look.",
  };
  const roleMetric: Record<Role, { value: string; label: string }> = {
    admin: { value: String(focusCount), label: "action cards" },
    accountant: { value: formatMoney(pnl.netProfitMinor), label: "net profit estimate" },
    cashier: { value: formatMoney(salesTodayMinor), label: "sales today" },
    viewer: { value: String(lowStock.length), label: "read-only stock alerts" },
    auditor: { value: String(riskyAudit.length), label: "exceptions to review" },
  };
  const hero: DashboardHero = {
    eyebrow: role === "cashier" ? "Counter mode" : role === "auditor" ? "Control room" : role === "accountant" ? "Finance command" : role === "viewer" ? "Read-only overview" : "Business command centre",
    headline,
    detail: roleDetail[role],
    metric: roleMetric[role].value,
    metricLabel: roleMetric[role].label,
    focusCount,
    focusNote: `${plural(focusCount, "live signal")} from ${branch} branch. The focus count is a transparent warning count, not a prediction.`,
    actionLabel: firstAction?.ctaLabel ?? fallbackAction[role].label,
    actionHref: firstAction?.href ?? fallbackAction[role].href,
    tipKey: "focus",
  };

  const isEmpty = [items, invoices, vouchers, stock, auditLogs].every(
    (collection) => collection.length === 0,
  );

  return {
    role,
    accent: role,
    title: ROLE_TITLE[role],
    summary: ROLE_SUMMARY[role],
    accessNote:
      role === "admin"
        ? "Admin access enables all features through your admin claim. Membership role is not used to reduce Admin access."
        : "Your access comes from your membership role and any permission overrides set by Admin.",
    can: access,
    cannot: noAccess,
    currencyNote: "Amounts shown in base currency: GHS.",
    trendNote: "Not enough history yet for trend lines.",
    branch,
    hero,
    focusChecks,
    kpis,
    attention: attentionList,
    blocks,
    charts,
    snapshots,
    isEmpty,
    actions: actions.filter((action) => !action.feature || can(action.feature)),
    playbook: PLAYBOOKS[role],
    tips: TIPS,
  };
}
