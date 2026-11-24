import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { validateMembershipUpdate } from "@/lib/admin-validation";
import { requireAdmin } from "@/lib/api-auth";
import { getErrorMessage } from "@/lib/errors";
import { getAdminDb } from "@/lib/firebase-admin";
import { MAIN_COMPANY_ID } from "@/lib/permissions";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ uid: string }> },
) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { uid } = await context.params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const membershipRef = getAdminDb()
      .collection("companyUsers")
      .doc(MAIN_COMPANY_ID)
      .collection("users")
      .doc(uid);

    const existing = await membershipRef.get();
    if (!existing.exists) {
      return NextResponse.json({ error: "User membership not found." }, { status: 404 });
    }

    const parsed = validateMembershipUpdate({
      ...body,
      currentRole: body.currentRole ?? existing.data()?.role,
    });
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    await membershipRef.update({
      ...parsed.value,
      updatedAt: FieldValue.serverTimestamp(),
    });

    if (parsed.value.status) {
      await getAdminDb()
        .collection("users")
        .doc(uid)
        .set(
          {
            status: parsed.value.status,
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
