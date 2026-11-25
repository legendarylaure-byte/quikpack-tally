import { NextResponse } from "next/server";
import { readBody } from "@/lib/api-body";
import { requireMember } from "@/lib/api-member";
import { createDoc } from "@/lib/data";
import { getErrorMessage } from "@/lib/errors";

export async function POST(request: Request) {
  const member = await requireMember(request);
  if (member instanceof NextResponse) {
    return member;
  }
  const body = await readBody(request);
  if (body instanceof NextResponse) {
    return body;
  }
  const reason = String(body.reason ?? "").trim();
  if (reason.length < 5 || reason.length > 1000) {
    return NextResponse.json(
      { error: "Explain the deletion request in at least 5 characters." },
      { status: 400 },
    );
  }
  try {
    const id = await createDoc(
      "dataDeletionRequests",
      {
        reason,
        status: "pending",
        submittedBy: member.uid,
        submittedByEmail: String(body.email ?? "").slice(0, 200),
      },
      member.uid,
    );
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
