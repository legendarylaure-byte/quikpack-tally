import { NextResponse } from "next/server";
import { requireMember } from "@/lib/api-member";
import { listDocs } from "@/lib/data";
import { getErrorMessage } from "@/lib/errors";
import { voucherOptions } from "@/lib/voucher-options";

export async function GET(request: Request) {
  const member = await requireMember(request, "vouchers");
  if (member instanceof NextResponse) {
    return member;
  }

  try {
    const [accounts, parties] = await Promise.all([
      listDocs("accounts"),
      listDocs("parties"),
    ]);
    return NextResponse.json(voucherOptions(accounts, parties));
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
