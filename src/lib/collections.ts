import type { FeatureKey, Role } from "./permissions";

export const COMPANY_COLLECTIONS = [
  "accounts",
  "parties",
  "items",
  "vouchers",
  "invoices",
  "stock",
  "stockMovements",
  "payments",
  "settings",
  "auditLogs",
  "subscriptions",
  "paymentRequests",
  "dataDeletionRequests",
] as const;

export const GLOBAL_COLLECTIONS = ["catalogue", "exchangeRates", "taxRates"] as const;

export type DataCollection =
  | (typeof COMPANY_COLLECTIONS)[number]
  | (typeof GLOBAL_COLLECTIONS)[number];

export const GENERIC_COLLECTIONS = [
  "accounts",
  "parties",
  "items",
  "catalogue",
  "exchangeRates",
  "taxRates",
  "stock",
  "stockMovements",
  "payments",
  "settings",
  "auditLogs",
  "subscriptions",
  "paymentRequests",
  "dataDeletionRequests",
] as const;
export type GenericCollection = (typeof GENERIC_COLLECTIONS)[number];

export interface CollectionAccess {
  feature: FeatureKey;
  label: string;
  writeRoles: readonly Role[];
}

export const COLLECTION_ACCESS: Record<GenericCollection, CollectionAccess> = {
  accounts: { feature: "masters", label: "Chart of accounts", writeRoles: ["admin", "accountant"] },
  parties: { feature: "masters", label: "Parties", writeRoles: ["admin", "accountant"] },
  items: { feature: "masters", label: "Items & services", writeRoles: ["admin", "accountant"] },
  catalogue: { feature: "masters", label: "Everpack catalogue", writeRoles: ["admin", "accountant"] },
  exchangeRates: { feature: "settings", label: "Exchange rates", writeRoles: ["admin", "accountant"] },
  taxRates: { feature: "settings", label: "Tax rates", writeRoles: ["admin", "accountant"] },
  stock: { feature: "inventory", label: "Stock", writeRoles: ["admin", "accountant", "cashier"] },
  stockMovements: { feature: "inventory", label: "Stock movements", writeRoles: ["admin", "accountant", "cashier"] },
  payments: { feature: "invoicing", label: "Invoice payments", writeRoles: ["admin", "accountant", "cashier"] },
  settings: { feature: "settings", label: "Company settings", writeRoles: ["admin"] },
  auditLogs: { feature: "reports", label: "Audit log", writeRoles: [] },
  subscriptions: { feature: "settings", label: "Subscription", writeRoles: ["admin"] },
  paymentRequests: {
    feature: "settings",
    label: "Payment proofs",
    writeRoles: ["admin", "accountant"],
  },
  dataDeletionRequests: {
    feature: "settings",
    label: "Data deletion requests",
    writeRoles: ["admin"],
  },
};

export function isGenericCollection(value: string): value is GenericCollection {
  return (GENERIC_COLLECTIONS as readonly string[]).includes(value);
}
