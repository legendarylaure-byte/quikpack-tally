import { NextResponse } from "next/server";
import { requireMember } from "@/lib/api-member";
import { getDoc } from "@/lib/data";
import { getErrorMessage } from "@/lib/errors";

type Context = { params: Promise<{ id: string }> };

const IMMUTABLE =
  "Posted vouchers are immutable. Create a reversal instead.";

export async function GET(request: Request, context: Context) {
  const member = await requireMember(request, "vouchers");
  if (member instanceof NextResponse) {
    return member;
  }
  const { id } = await context.params;
  try {
    const item = await getDoc("vouchers", id);
    if (!item) {
      return NextResponse.json({ error: "Voucher not found." }, { status: 404 });
    }
    return NextResponse.json({ item });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const member = await requireMember(request, "vouchers");
  if (member instanceof NextResponse) {
    return member;
  }
  return NextResponse.json({ error: IMMUTABLE }, { status: 409 });
}

export async function DELETE(request: Request) {
  const member = await requireMember(request, "vouchers");
  if (member instanceof NextResponse) {
    return member;
  }
  return NextResponse.json({ error: IMMUTABLE }, { status: 409 });
}
