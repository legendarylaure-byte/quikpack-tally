import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { getErrorMessage } from "@/lib/errors";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { MAIN_COMPANY_ID, isRole } from "@/lib/permissions";
import { sendUserInvite } from "@/lib/resend";

export async function POST(
  request: Request,
  context: { params: Promise<{ uid: string }> },
) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { uid } = await context.params;

  try {
    const membership = await getAdminDb()
      .collection("companyUsers")
      .doc(MAIN_COMPANY_ID)
      .collection("users")
      .doc(uid)
      .get();

    if (!membership.exists) {
      return NextResponse.json({ error: "User membership not found." }, { status: 404 });
    }

    const data = membership.data() ?? {};
    const email = String(data.email ?? "");
    if (!email) {
      return NextResponse.json({ error: "This user has no email address." }, { status: 400 });
    }

    const resetUrl = await getAdminAuth().generatePasswordResetLink(email);
    await sendUserInvite({
      to: email,
      fullName: String(data.fullName ?? email),
      role: isRole(data.role) ? data.role : "viewer",
      resetUrl,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
