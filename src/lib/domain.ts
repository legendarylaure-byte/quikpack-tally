export type AccountType = "asset" | "liability" | "equity" | "income" | "expense";
export type TaxCategory = "standard" | "zeroRated" | "exempt";
export type Currency = "GHS" | "USD" | "NPR";
export type VoucherType =
  | "payment"
  | "receipt"
  | "contra"
  | "journal"
  | "sales"
  | "purchase"
  | "expense"
  | "creditNote"
  | "debitNote";

export interface Account {
  id?: string;
  code: string;
  name: string;
  type: AccountType;
  group: string;
  openingBalanceMinor: number;
  parentCode?: string;
  description?: string;
}

export interface Party {
  id?: string;
  name: string;
  type: "customer" | "supplier" | "both";
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  tin?: string;
  currency: Currency;
  creditLimitMinor?: number;
  paymentTermsDays?: number;
  notes?: string;
  customFields?: Record<string, string>;
}

export interface Item {
  id?: string;
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  unit: string;
  taxCategory: TaxCategory;
  salePriceMinor: number;
  purchasePriceMinor: number;
  reorderLevel: number;
  location?: string;
  trackStock: boolean;
  resellable: boolean;
  customFields?: Record<string, string>;
}

export interface CatalogueItem {
  id?: string;
  sku: string;
  barcode?: string;
  description: string;
  pack?: string;
  distributorPriceMinor?: number;
  boxPriceMinor?: number;
  sellingPriceMinor: number;
  source: string;
  resellable: boolean;
}

export interface VoucherLine {
  accountId: string;
  debitMinor: number;
  creditMinor: number;
  description?: string;
}

export interface Voucher {
  id?: string;
  number: string;
  type: VoucherType;
  date: string;
  partyId?: string;
  narration: string;
  currency: Currency;
  exchangeRate: number;
  baseAmountGhsMinor: number;
  lines: VoucherLine[];
  totalDebitMinor: number;
  totalCreditMinor: number;
  status: "posted" | "reversed";
  reversedBy?: string;
  reversalOf?: string;
  attachmentUrl?: string;
  branch?: string;
  vatMinor?: number;
  nhilMinor?: number;
  getfundMinor?: number;
}

export interface Payment {
  id?: string;
  invoiceId?: string;
  partyId?: string;
  date: string;
  amountMinor: number;
  currency: Currency;
  method: "cash" | "bank" | "mobileMoney" | "card" | "other";
  reference?: string;
  notes?: string;
}

export interface InvoiceLine {
  itemId?: string;
  description: string;
  quantity: number;
  unitPriceMinor: number;
  taxCategory: TaxCategory;
  lineTotalMinor: number;
  taxableMinor: number;
  vatMinor: number;
  nhilMinor: number;
  getfundMinor: number;
}

export interface Invoice {
  id?: string;
  number: string;
  date: string;
  dueDate: string;
  partyId: string;
  billTo?: string;
  shipTo?: string;
  currency: Currency;
  exchangeRate: number;
  baseAmountGhsMinor: number;
  lines: InvoiceLine[];
  subtotalMinor: number;
  vatMinor: number;
  nhilMinor: number;
  getfundMinor: number;
  totalTaxMinor: number;
  totalMinor: number;
  amountPaidMinor: number;
  status: "draft" | "sent" | "paid" | "void";
  branch?: string;
  notes?: string;
  clientBranding?: {
    name: string;
    address?: string;
    tin?: string;
    email?: string;
    phone?: string;
    logoUrl?: string;
  };
}

export interface StockMovement {
  id?: string;
  itemId: string;
  location: string;
  direction: "in" | "out";
  quantity: number;
  unitCostMinor: number;
  date: string;
  reference: string;
  reason?: string;
  branch?: string;
  batch?: string;
  expiryDate?: string;
}

export interface StockDoc {
  id?: string;
  itemId: string;
  location: string;
  quantity: number;
  unitCostMinor: number;
  reorderLevel: number;
  branch?: string;
  batch?: string;
  expiryDate?: string;
}

export interface TaxRate {
  id?: string;
  name: "vat" | "nhil" | "getfund";
  rate: number;
  effectiveFrom: string;
  effectiveTo?: string;
  note?: string;
}

export interface ExchangeRate {
  id?: string;
  currency: Currency;
  rate: number;
  date: string;
  source: string;
}

export interface CompanySettings {
  id?: string;
  key: "company";
  legalName: string;
  displayName: string;
  registrationNumber: string;
  tin: string;
  country: string;
  address?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  baseCurrency: Currency;
  displayCurrency: Currency;
  fiscalYearStartMonth: number;
  branches: string[];
  taxStatus: "registered" | "unregistered";
  filingDay: number;
  invoicePrefix: string;
  voucherPrefix: string;
  valuationMethod?: "fifo" | "weighted";
}
