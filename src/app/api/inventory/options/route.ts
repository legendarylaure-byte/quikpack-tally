import { NextResponse } from "next/server";
import { requireMember } from "@/lib/api-member";
import { listDocs } from "@/lib/data";
import { getErrorMessage } from "@/lib/errors";
import { inventoryOptions } from "@/lib/inventory-options";

export async function GET(request: Request) {
  const member = await requireMember(request, "inventory");
  if (member instanceof NextResponse) {
    return member;
  }

  try {
    const items = await listDocs("items");
    return NextResponse.json(inventoryOptions(items));
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
