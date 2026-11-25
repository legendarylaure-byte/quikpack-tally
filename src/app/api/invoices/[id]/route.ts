import { NextResponse } from "next/server";
import { readBody } from "@/lib/api-body";
import { requireMember } from "@/lib/api-member";
import { getDoc, updateDoc } from "@/lib/data";
import { getErrorMessage } from "@/lib/errors";

type Context = { params: Promise<{ id: string }> };

const EDITABLE = new Set(["status", "amountPaidMinor", "notes"]);

export async function GET(request: Request, context: Context) {
  const member = await requireMember(request, "invoicing");
  if (member instanceof NextResponse) {
    return member;
  }
  const { id } = await context.params;
  try {
    const item = await getDoc("invoices", id);
    if (!item) {
      return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
    }
    return NextResponse.json({ item });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: Context) {
  const member = await requireMember(request, "invoicing");
  if (member instanceof NextResponse) {
    return member;
  }
  if (!member.admin && !["admin", "accountant", "cashier"].includes(member.role)) {
    return NextResponse.json({ error: "You cannot change invoices." }, { status: 403 });
  }

  const body = await readBody(request);
  if (body instanceof NextResponse) {
    return body;
  }
  const patch: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
    if (EDITABLE.has(key)) {
      patch[key] = value;
    }
  }
  if (patch.status !== undefined && !["draft", "sent", "paid", "void"].includes(String(patch.status))) {
    return NextResponse.json({ error: "Invalid invoice status." }, { status: 400 });
  }
  if (patch.amountPaidMinor !== undefined) {
    const amount = Number(patch.amountPaidMinor);
    if (!Number.isInteger(amount) || amount < 0) {
      return NextResponse.json({ error: "Invalid paid amount." }, { status: 400 });
    }
    patch.amountPaidMinor = amount;
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const { id } = await context.params;
  try {
    const updated = await updateDoc("invoices", id, patch, member.uid);
    if (!updated) {
      return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: Context) {
  const member = await requireMember(request, "invoicing");
  if (member instanceof NextResponse) {
    return member;
  }
  if (!member.admin && member.role !== "accountant") {
    return NextResponse.json({ error: "You cannot delete invoices." }, { status: 403 });
  }
  const { id } = await context.params;
  try {
    const item = await getDoc("invoices", id);
    if (!item) {
      return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
    }
    if (item.status !== "draft") {
      return NextResponse.json(
        { error: "Only draft invoices can be deleted. Void sent invoices instead." },
        { status: 409 },
      );
    }
    const updated = await updateDoc("invoices", id, { status: "void" }, member.uid);
    if (!updated) {
      return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
