import { NextResponse } from "next/server";
import { readBody } from "@/lib/api-body";
import { requireMember } from "@/lib/api-member";
import { COLLECTION_ACCESS, isGenericCollection } from "@/lib/collections";
import { deleteDoc, getDoc, updateDoc } from "@/lib/data";
import { getErrorMessage } from "@/lib/errors";
import { canChangePaymentProofStatus } from "@/lib/payment-proofs";

type Context = { params: Promise<{ collection: string; id: string }> };

export async function GET(request: Request, context: Context) {
  const { collection, id } = await context.params;
  if (!isGenericCollection(collection)) {
    return NextResponse.json({ error: "Unknown collection." }, { status: 404 });
  }

  const member = await requireMember(request, COLLECTION_ACCESS[collection].feature);
  if (member instanceof NextResponse) {
    return member;
  }

  try {
    const item = await getDoc(collection, id);
    if (!item) {
      return NextResponse.json({ error: "Record not found." }, { status: 404 });
    }
    return NextResponse.json({ item });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: Context) {
  const { collection, id } = await context.params;
  if (!isGenericCollection(collection)) {
    return NextResponse.json({ error: "Unknown collection." }, { status: 404 });
  }

  const member = await requireMember(request, COLLECTION_ACCESS[collection].feature);
  if (member instanceof NextResponse) {
    return member;
  }
  if (!member.admin && !COLLECTION_ACCESS[collection].writeRoles.includes(member.role)) {
    return NextResponse.json({ error: "You cannot change this record." }, { status: 403 });
  }

  const body = await readBody(request);
  if (body instanceof NextResponse) {
    return body;
  }

  if (collection === "paymentRequests" && "status" in body) {
    const existing = await getDoc(collection, id);
    if (!existing) {
      return NextResponse.json({ error: "Record not found." }, { status: 404 });
    }
    if (!canChangePaymentProofStatus(member.admin, existing.submittedBy, member.uid)) {
      return NextResponse.json(
        { error: "Only another administrator can change payment proof status." },
        { status: 403 },
      );
    }
  }

  try {
    const updated = await updateDoc(collection, id, body, member.uid);
    if (!updated) {
      return NextResponse.json({ error: "Record not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: Context) {
  const { collection, id } = await context.params;
  if (!isGenericCollection(collection)) {
    return NextResponse.json({ error: "Unknown collection." }, { status: 404 });
  }

  const member = await requireMember(request, COLLECTION_ACCESS[collection].feature);
  if (member instanceof NextResponse) {
    return member;
  }
  if (!member.admin && !COLLECTION_ACCESS[collection].writeRoles.includes(member.role)) {
    return NextResponse.json({ error: "You cannot delete this record." }, { status: 403 });
  }

  try {
    const removed = await deleteDoc(collection, id, member.uid);
    if (!removed) {
      return NextResponse.json({ error: "Record not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
