import { NextResponse } from "next/server";
import { readBody } from "@/lib/api-body";
import { requireMember } from "@/lib/api-member";
import { createDoc } from "@/lib/data";
import { getErrorMessage } from "@/lib/errors";
import { parseMoney } from "@/lib/money";

const CYCLES = ["monthly", "yearly"];
const METHODS = ["bankTransfer", "mobileMoney", "card", "other"];

export async function POST(request: Request) {
  const member = await requireMember(request);
  if (member instanceof NextResponse) {
    return member;
  }

  const body = await readBody(request);
  if (body instanceof NextResponse) {
    return body;
  }

  const plan = String(body.plan ?? "").trim();
  const cycle = String(body.cycle ?? "");
  const method = String(body.method ?? "");
  const reference = String(body.reference ?? "").trim();
  if (!plan || !reference || reference.length > 200) {
    return NextResponse.json(
      { error: "Enter a plan and a payment reference." },
      { status: 400 },
    );
  }
  if (!CYCLES.includes(cycle) || !METHODS.includes(method)) {
    return NextResponse.json(
      { error: "Choose a valid billing cycle and payment method." },
      { status: 400 },
    );
  }

  let amountMinor: number;
  try {
    amountMinor = parseMoney(body.amount as string | number);
  } catch {
    return NextResponse.json({ error: "Enter a valid amount." }, { status: 400 });
  }
  if (amountMinor <= 0) {
    return NextResponse.json({ error: "Amount must be above zero." }, { status: 400 });
  }

  try {
    const id = await createDoc(
      "paymentRequests",
      {
        plan,
        cycle,
        amountMinor,
        method,
        reference,
        note: String(body.note ?? "").slice(0, 1000),
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
