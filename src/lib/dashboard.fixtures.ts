import type { DashboardData } from "./dashboard";

function day(offset: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

export function getDashboardFixtures(): DashboardData {
  return {
    settings: {
      key: "company",
      displayName: "QUIKPACK",
      baseCurrency: "GHS",
      displayCurrency: "GHS",
      branches: ["Main"],
      valuationMethod: "weighted",
    },
    accounts: [
      { id: "a1", code: "4000", name: "Sales", type: "income", group: "Revenue", openingBalanceMinor: 0 },
      { id: "a2", code: "5000", name: "Purchases", type: "expense", group: "Cost of sales", openingBalanceMinor: 0 },
      { id: "a3", code: "6000", name: "Expenses", type: "expense", group: "Operating", openingBalanceMinor: 0 },
      { id: "a4", code: "1000", name: "Cash", type: "asset", group: "Current assets", openingBalanceMinor: 800000 },
      { id: "a5", code: "1100", name: "Bank", type: "asset", group: "Current assets", openingBalanceMinor: 1200000 },
      { id: "a6", code: "2000", name: "Accounts payable", type: "liability", group: "Current liabilities", openingBalanceMinor: 0 },
      { id: "a7", code: "1200", name: "Accounts receivable", type: "asset", group: "Current assets", openingBalanceMinor: 0 },
      { id: "a8", code: "3000", name: "Capital", type: "equity", group: "Equity", openingBalanceMinor: 2000000 },
    ],
    parties: [
      { id: "p1", name: "Accra Retail Hub", type: "customer" },
      { id: "p2", name: "Kumasi Hotel Supply", type: "customer" },
      { id: "p3", name: "Tema Foods Ltd", type: "customer" },
      { id: "s1", name: "Everpack Suppliers", type: "supplier" },
      { id: "s2", name: "Cleanline Imports", type: "supplier" },
    ],
    items: [
      { id: "i1", name: "Disposable plates", sku: "PLT-01", reorderLevel: 20 },
      { id: "i2", name: "Takeaway cups", sku: "CUP-01", reorderLevel: 15 },
      { id: "i3", name: "Napkins", sku: "NAP-01", reorderLevel: 30 },
      { id: "i4", name: "Cleaning liquid", sku: "CLN-01", reorderLevel: 12 },
      { id: "i5", name: "Food boxes", sku: "BOX-01", reorderLevel: 25 },
      { id: "i6", name: "Gloves", sku: "GLV-01", reorderLevel: 18 },
    ],
    stock: [
      { id: "st1", itemId: "i1", location: "Main", quantity: 18, unitCostMinor: 320, reorderLevel: 20 },
      { id: "st2", itemId: "i2", location: "Main", quantity: 8, unitCostMinor: 180, reorderLevel: 15 },
      { id: "st3", itemId: "i3", location: "Main", quantity: 64, unitCostMinor: 90, reorderLevel: 30 },
      { id: "st4", itemId: "i4", location: "Main", quantity: 24, unitCostMinor: 1250, reorderLevel: 12 },
      { id: "st5", itemId: "i5", location: "Main", quantity: 48, unitCostMinor: 540, reorderLevel: 25 },
      { id: "st6", itemId: "i6", location: "Main", quantity: 0, unitCostMinor: 260, reorderLevel: 18 },
    ],
    movements: [
      { id: "m1", itemId: "i1", location: "Main", direction: "in", quantity: 40, unitCostMinor: 320, date: day(-9), reference: "GRN-1001" },
      { id: "m2", itemId: "i2", location: "Main", direction: "in", quantity: 30, unitCostMinor: 180, date: day(-8), reference: "GRN-1002" },
      { id: "m3", itemId: "i3", location: "Main", direction: "in", quantity: 100, unitCostMinor: 90, date: day(-7), reference: "GRN-1003" },
      { id: "m4", itemId: "i4", location: "Main", direction: "in", quantity: 36, unitCostMinor: 1250, date: day(-6), reference: "GRN-1004" },
      { id: "m5", itemId: "i5", location: "Main", direction: "in", quantity: 60, unitCostMinor: 540, date: day(-5), reference: "GRN-1005" },
      { id: "m6", itemId: "i6", location: "Main", direction: "in", quantity: 50, unitCostMinor: 260, date: day(-4), reference: "GRN-1006" },
    ],
    invoices: [
      {
        id: "inv1", number: "INV-1004", date: day(0), dueDate: day(14), partyId: "p1",
        currency: "GHS", exchangeRate: 1, baseAmountGhsMinor: 186000, totalMinor: 186000,
        amountPaidMinor: 0, status: "sent",
        lines: [
          { itemId: "i1", description: "Disposable plates", quantity: 20, unitPriceMinor: 6200, taxCategory: "standard", lineTotalMinor: 124000, taxableMinor: 124000, vatMinor: 18600, nhilMinor: 3100, getfundMinor: 3100 },
          { itemId: "i2", description: "Takeaway cups", quantity: 30, unitPriceMinor: 1400, taxCategory: "standard", lineTotalMinor: 42000, taxableMinor: 42000, vatMinor: 6300, nhilMinor: 1050, getfundMinor: 1050 },
        ],
        vatMinor: 24900, nhilMinor: 4150, getfundMinor: 4150, totalTaxMinor: 33200, subtotalMinor: 166000,
      },
      {
        id: "inv2", number: "INV-1003", date: day(-5), dueDate: day(-1), partyId: "p2",
        currency: "GHS", exchangeRate: 1, baseAmountGhsMinor: 94000, totalMinor: 94000,
        amountPaidMinor: 0, status: "sent",
        lines: [{ itemId: "i4", description: "Cleaning liquid", quantity: 4, unitPriceMinor: 18500, taxCategory: "standard", lineTotalMinor: 74000, taxableMinor: 74000, vatMinor: 11100, nhilMinor: 1850, getfundMinor: 1850 }],
        vatMinor: 11100, nhilMinor: 1850, getfundMinor: 1850, totalTaxMinor: 14800, subtotalMinor: 79000,
      },
      {
        id: "inv3", number: "INV-1002", date: day(-12), dueDate: day(-5), partyId: "p3",
        currency: "GHS", exchangeRate: 1, baseAmountGhsMinor: 232000, totalMinor: 232000,
        amountPaidMinor: 232000, status: "paid",
        lines: [{ itemId: "i5", description: "Food boxes", quantity: 40, unitPriceMinor: 4600, taxCategory: "standard", lineTotalMinor: 184000, taxableMinor: 184000, vatMinor: 27600, nhilMinor: 4600, getfundMinor: 4600 }],
        vatMinor: 27600, nhilMinor: 4600, getfundMinor: 4600, totalTaxMinor: 36800, subtotalMinor: 195000,
      },
      {
        id: "inv4", number: "INV-1001", date: day(-40), dueDate: day(-30), partyId: "p1",
        currency: "GHS", exchangeRate: 1, baseAmountGhsMinor: 118000, totalMinor: 118000,
        amountPaidMinor: 0, status: "sent",
        lines: [{ itemId: "i3", description: "Napkins", quantity: 50, unitPriceMinor: 1800, taxCategory: "standard", lineTotalMinor: 90000, taxableMinor: 90000, vatMinor: 13500, nhilMinor: 2250, getfundMinor: 2250 }],
        vatMinor: 13500, nhilMinor: 2250, getfundMinor: 2250, totalTaxMinor: 18000, subtotalMinor: 95000,
      },
    ],
    payments: [
      { id: "pay1", invoiceId: "inv3", partyId: "p3", date: day(-5), amountMinor: 232000, currency: "GHS", method: "bank" },
    ],
    vouchers: [
      {
        id: "v1", number: "RV-1001", type: "receipt", date: day(-5), narration: "Customer payment received",
        currency: "GHS", exchangeRate: 1, baseAmountGhsMinor: 232000, totalDebitMinor: 232000, totalCreditMinor: 232000,
        status: "posted", vatMinor: 0, nhilMinor: 0, getfundMinor: 0,
        lines: [{ accountId: "a4", debitMinor: 232000, creditMinor: 0 }, { accountId: "a7", debitMinor: 0, creditMinor: 232000 }],
      },
      {
        id: "v2", number: "PV-1002", type: "payment", date: day(-4), narration: "Supplier payment",
        currency: "GHS", exchangeRate: 1, baseAmountGhsMinor: 145000, totalDebitMinor: 145000, totalCreditMinor: 145000,
        status: "posted", vatMinor: 0, nhilMinor: 0, getfundMinor: 0,
        lines: [{ accountId: "a6", debitMinor: 145000, creditMinor: 0 }, { accountId: "a5", debitMinor: 0, creditMinor: 145000 }],
      },
      {
        id: "v3", number: "JVR-1003", type: "purchase", date: day(-8), narration: "Stock purchase",
        currency: "GHS", exchangeRate: 1, baseAmountGhsMinor: 320000, totalDebitMinor: 320000, totalCreditMinor: 320000,
        status: "posted", vatMinor: 48000, nhilMinor: 8000, getfundMinor: 8000,
        lines: [{ accountId: "a2", debitMinor: 320000, creditMinor: 0 }, { accountId: "a6", debitMinor: 0, creditMinor: 320000 }],
      },
      {
        id: "v4", number: "EV-1004", type: "expense", date: day(-3), narration: "Transport and fuel",
        currency: "GHS", exchangeRate: 1, baseAmountGhsMinor: 42000, totalDebitMinor: 42000, totalCreditMinor: 42000,
        status: "posted", vatMinor: 0, nhilMinor: 0, getfundMinor: 0,
        lines: [{ accountId: "a3", debitMinor: 42000, creditMinor: 0 }, { accountId: "a4", debitMinor: 0, creditMinor: 42000 }],
      },
      {
        id: "v5", number: "JVR-1002", type: "journal", date: day(-11), narration: "Incorrect entry",
        currency: "GHS", exchangeRate: 1, baseAmountGhsMinor: 15000, totalDebitMinor: 15000, totalCreditMinor: 15000,
        status: "reversed", vatMinor: 0, nhilMinor: 0, getfundMinor: 0,
        lines: [{ accountId: "a3", debitMinor: 15000, creditMinor: 0 }, { accountId: "a4", debitMinor: 0, creditMinor: 15000 }],
      },
    ],
    auditLogs: [
      { id: "log1", at: new Date().toISOString(), action: "create", collection: "invoices", documentId: "inv1", uid: "qa-cashier" },
      { id: "log2", at: new Date().toISOString(), action: "export", collection: "reports", documentId: "vat", uid: "qa-accountant" },
      { id: "log3", at: new Date(Date.now() - 3_600_000).toISOString(), action: "delete", collection: "items", documentId: "i9", uid: "qa-admin" },
      { id: "log4", at: new Date(Date.now() - 7_200_000).toISOString(), action: "update", collection: "settings", documentId: "company", uid: "qa-admin" },
    ],
    users: [
      { uid: "u1", email: "qa.admin@quikpack.local", role: "admin", status: "approved" },
      { uid: "u2", email: "qa.accountant@quikpack.local", role: "accountant", status: "approved" },
      { uid: "u3", email: "qa.cashier@quikpack.local", role: "cashier", status: "approved" },
      { uid: "u4", email: "qa.viewer@quikpack.local", role: "viewer", status: "approved" },
      { uid: "u5", email: "qa.auditor@quikpack.local", role: "auditor", status: "pending" },
    ],
  } as DashboardData;
}
