import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "./firebase-admin";
import {
  MAIN_COMPANY_ID,
  toMembership,
  type FeatureKey,
  type Role,
} from "./permissions";

export type MemberAuth = {
  uid: string;
  role: Role;
  admin: boolean;
  permissions: ReturnType<typeof toMembership>["permissions"];
};

export async function requireMember(
  request: Request,
  feature?: FeatureKey,
): Promise<MemberAuth | NextResponse> {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) {
    return NextResponse.json({ error: "Sign in is required." }, { status: 401 });
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    const snapshot = await getAdminDb()
      .collection("companyUsers")
      .doc(MAIN_COMPANY_ID)
      .collection("users")
      .doc(decoded.uid)
      .get();

    const data = snapshot.data();
    const isAdmin = decoded.admin === true;
    if (!snapshot.exists || (data?.status !== "approved" && !isAdmin)) {
      return NextResponse.json({ error: "Active membership is required." }, { status: 403 });
    }

    const membership = toMembership(data ?? {});
    if (feature && !isAdmin && !membership.permissions[feature]) {
      return NextResponse.json({ error: "Feature access is required." }, { status: 403 });
    }

    return {
      uid: decoded.uid,
      role: membership.role,
      admin: isAdmin,
      permissions: membership.permissions,
    };
  } catch {
    return NextResponse.json({ error: "Invalid or expired session." }, { status: 401 });
  }
}

export function isMemberAuth(value: MemberAuth | NextResponse): value is MemberAuth {
  return !(value instanceof NextResponse);
}
