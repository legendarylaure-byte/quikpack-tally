import { NextResponse } from "next/server";

const RESERVED = new Set([
  "id",
  "companyId",
  "createdAt",
  "createdBy",
  "updatedAt",
  "updatedBy",
  "deleted",
  "deletedAt",
  "deletedBy",
]);

export async function readBody(
  request: Request,
): Promise<Record<string, unknown> | NextResponse> {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }
    return sanitize(body) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}

function sanitizeValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value && typeof value === "object") {
    const clean: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value)) {
      if (key.includes(".") || key.includes("..") || key === "__proto__") {
        continue;
      }
      clean[key] = sanitizeValue(child);
    }
    return clean;
  }
  return value;
}

export function sanitize(value: unknown): unknown {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }
  const clean: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value)) {
    if (RESERVED.has(key) || key.includes(".") || key === "__proto__") {
      continue;
    }
    clean[key] = sanitizeValue(child);
  }
  return clean;
}

export function requireFields(
  body: Record<string, unknown>,
  fields: string[],
): string | null {
  for (const field of fields) {
    const value = body[field];
    if (
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "")
    ) {
      return `${field} is required.`;
    }
  }
  return null;
}

export function isIsoDate(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(new Date(value).getTime())
  );
}
