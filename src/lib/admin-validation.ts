import {
  isRole,
  isUserStatus,
  toPermissions,
  type Permissions,
  type Role,
  type UserStatus,
} from "./permissions";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function isValidEmail(value: string) {
  return value.length <= 254 && EMAIL_PATTERN.test(value);
}

export function validateNewUser(body: Record<string, unknown>) {
  const email = normalizeEmail(body.email);
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";

  if (!isValidEmail(email)) {
    return { error: "A valid email address is required." } as const;
  }
  if (!fullName || fullName.length > 120) {
    return { error: "Full name is required and must be under 120 characters." } as const;
  }
  if (!isRole(body.role)) {
    return { error: "A valid role is required." } as const;
  }

  const role: Role = body.role;
  return {
    value: {
      email,
      fullName,
      role,
      permissions: toPermissions(body.permissions, role),
    },
  } as const;
}

export function validateMembershipUpdate(body: Record<string, unknown>) {
  const update: {
    role?: Role;
    status?: UserStatus;
    permissions?: Permissions;
  } = {};

  if (body.role !== undefined) {
    if (!isRole(body.role)) {
      return { error: "A valid role is required." } as const;
    }
    update.role = body.role;
  }

  if (body.status !== undefined) {
    if (!isUserStatus(body.status)) {
      return { error: "A valid status is required." } as const;
    }
    update.status = body.status;
  }

  if (body.permissions !== undefined) {
    const role = update.role ?? (isRole(body.currentRole) ? body.currentRole : null);
    if (!role) {
      return { error: "A valid role is required to save permissions." } as const;
    }
    update.permissions = toPermissions(body.permissions, role);
  }

  return { value: update } as const;
}
