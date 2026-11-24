import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { validateNewUser } from "@/lib/admin-validation";
import { requireAdmin } from "@/lib/api-auth";
import { getErrorMessage } from "@/lib/errors";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import {
  isRole,
  isUserStatus,
  MAIN_COMPANY_ID,
  toPermissions,
  type UserStatus,
} from "@/lib/permissions";
import { sendUserInvite } from "@/lib/resend";

function membershipDb() {
  return getAdminDb()
    .collection("companyUsers")
    .doc(MAIN_COMPANY_ID)
    .collection("users");
}

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  try {
    const snapshot = await membershipDb().orderBy("email").get();
    const authClient = getAdminAuth();

    const users = await Promise.all(
      snapshot.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data();
        const role = isRole(data.role) ? data.role : "viewer";
        const status: UserStatus = isUserStatus(data.status) ? data.status : "pending";

        let email = String(data.email ?? "");
        try {
          const authUser = await authClient.getUser(docSnapshot.id);
          email = authUser.email ?? email;
        } catch {
          // The Auth account may have been removed manually; keep the stored email.
        }

        return {
          uid: docSnapshot.id,
          email,
          fullName: String(data.fullName ?? ""),
          role,
          status,
          permissions: toPermissions(data.permissions, role),
          createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? null,
        };
      }),
    );

    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = validateNewUser(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { email, fullName, role, permissions } = parsed.value;

  try {
    const authClient = getAdminAuth();
    const db = getAdminDb();

    let user;
    try {
      user = await authClient.getUserByEmail(email);
    } catch (lookupError) {
      if ((lookupError as { code?: string }).code !== "auth/user-not-found") {
        throw lookupError;
      }
      user = await authClient.createUser({ email, displayName: fullName });
    }

    const resetUrl = await authClient.generatePasswordResetLink(email);
    const membershipRef = membershipDb().doc(user.uid);
    const existing = await membershipRef.get();

    await membershipRef.set({
      uid: user.uid,
      email,
      fullName,
      companyId: MAIN_COMPANY_ID,
      role,
      status: "approved",
      permissions,
      approvedBy: auth.uid,
      createdAt: existing.exists
        ? existing.data()?.createdAt ?? FieldValue.serverTimestamp()
        : FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    await db.collection("users").doc(user.uid).set(
      {
        email,
        fullName,
        companyIds: [MAIN_COMPANY_ID],
        status: "approved",
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    let inviteSent = true;
    let warning = "";
    try {
      await sendUserInvite({ to: email, fullName, role, resetUrl });
    } catch (emailError) {
      inviteSent = false;
      warning = getErrorMessage(emailError);
    }

    return NextResponse.json({ uid: user.uid, inviteSent, warning });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
