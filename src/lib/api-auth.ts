import { NextResponse } from "next/server";
import { getAdminAuth } from "./firebase-admin";

export type AdminAuthResult = { uid: string } | NextResponse;

export async function requireAdmin(request: Request): Promise<AdminAuthResult> {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) {
    return NextResponse.json({ error: "Sign in is required." }, { status: 401 });
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    if (decoded.admin !== true) {
      return NextResponse.json({ error: "Admin access is required." }, { status: 403 });
    }
    return { uid: decoded.uid };
  } catch {
    return NextResponse.json({ error: "Invalid or expired session." }, { status: 401 });
  }
}
