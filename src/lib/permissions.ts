import { MAIN_COMPANY_ID } from "./constants";

export { MAIN_COMPANY_ID };

export const ROLES = [
  "admin",
  "accountant",
  "cashier",
  "viewer",
  "auditor",
] as const;
export type Role = (typeof ROLES)[number];

export const USER_STATUSES = ["approved", "pending", "suspended"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const FEATURES = [
  { key: "dashboard", label: "Dashboard" },
  { key: "masters", label: "Masters" },
  { key: "vouchers", label: "Vouchers" },
  { key: "inventory", label: "Inventory" },
  { key: "invoicing", label: "Invoicing" },
  { key: "reports", label: "Reports" },
  { key: "settings", label: "Settings" },
] as const;
export type FeatureKey = (typeof FEATURES)[number]["key"];
export type Permissions = Record<FeatureKey, boolean>;

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

export function isUserStatus(value: unknown): value is UserStatus {
  return (
    typeof value === "string" &&
    (USER_STATUSES as readonly string[]).includes(value)
  );
}

export function defaultPermissions(role: Role): Permissions {
  const permissions: Permissions = {
    dashboard: true,
    masters: true,
    vouchers: true,
    inventory: true,
    invoicing: true,
    reports: true,
    settings: true,
  };

  if (role === "viewer" || role === "auditor") {
    return { ...permissions, vouchers: false, invoicing: false, settings: false };
  }

  if (role === "cashier") {
    return { ...permissions, masters: false, reports: false, settings: false };
  }

  return permissions;
}

export interface Membership {
  role: Role;
  status: UserStatus;
  permissions: Permissions;
  fullName: string;
}

export function toMembership(data: Record<string, unknown>): Membership {
  const role = isRole(data.role) ? data.role : "viewer";
  return {
    role,
    status: isUserStatus(data.status) ? data.status : "pending",
    permissions: toPermissions(data.permissions, role),
    fullName: typeof data.fullName === "string" ? data.fullName : "",
  };
}

export function toPermissions(value: unknown, role: Role): Permissions {
  const permissions = defaultPermissions(role);
  if (!value || typeof value !== "object") {
    return permissions;
  }

  for (const feature of FEATURES) {
    const raw = (value as Record<string, unknown>)[feature.key];
    if (typeof raw === "boolean") {
      permissions[feature.key] = raw;
    }
  }

  return permissions;
}
