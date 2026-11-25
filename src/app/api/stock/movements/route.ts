import { NextResponse } from "next/server";
import { isIsoDate, readBody } from "@/lib/api-body";
import { requireMember } from "@/lib/api-member";
import { createDoc, listDocs, queryDocs, updateDoc } from "@/lib/data";
import { getErrorMessage } from "@/lib/errors";

export async function GET(request: Request) {
  const member = await requireMember(request, "inventory");
  if (member instanceof NextResponse) {
    return member;
  }
  try {
    const items = await listDocs("stockMovements");
    items.sort((a, b) => String(b.date ?? "").localeCompare(String(a.date ?? "")));
    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const member = await requireMember(request, "inventory");
  if (member instanceof NextResponse) {
    return member;
  }
  if (!member.admin && !["admin", "accountant", "cashier"].includes(member.role)) {
    return NextResponse.json({ error: "You cannot adjust stock." }, { status: 403 });
  }

  const body = await readBody(request);
  if (body instanceof NextResponse) {
    return body;
  }

  const itemId = String(body.itemId ?? "");
  const location = String(body.location ?? "Main");
  const direction = String(body.direction ?? "");
  const quantity = Number(body.quantity ?? 0);
  const unitCostMinor = Number(body.unitCostMinor ?? 0);
  if (!itemId || !location) {
    return NextResponse.json({ error: "Choose an item and location." }, { status: 400 });
  }
  if (direction !== "in" && direction !== "out") {
    return NextResponse.json({ error: "Choose a stock direction." }, { status: 400 });
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return NextResponse.json({ error: "Quantity must be a whole number above zero." }, { status: 400 });
  }
  if (!Number.isInteger(unitCostMinor) || unitCostMinor < 0) {
    return NextResponse.json({ error: "Enter a valid unit cost." }, { status: 400 });
  }
  if (!isIsoDate(body.date)) {
    return NextResponse.json({ error: "Enter a valid date." }, { status: 400 });
  }

  try {
    const existingStock = (await queryDocs("stock", "itemId", itemId)).filter(
      (doc) => String(doc.location ?? "Main") === location,
    );
    const current = existingStock[0];
    const currentQuantity = Number(current?.quantity ?? 0);
    if (direction === "out" && quantity > currentQuantity) {
      return NextResponse.json(
        { error: `Only ${currentQuantity} units are available at ${location}.` },
        { status: 400 },
      );
    }

    const newQuantity =
      direction === "in" ? currentQuantity + quantity : currentQuantity - quantity;
    const currentCost = Number(current?.unitCostMinor ?? 0);
    const newCost =
      direction === "in" && newQuantity > 0
        ? Math.round((currentQuantity * currentCost + quantity * unitCostMinor) / newQuantity)
        : currentCost;

    const movementId = await createDoc(
      "stockMovements",
      {
        itemId,
        location,
        direction,
        quantity,
        unitCostMinor,
        date: body.date,
        reference: String(body.reference ?? "Manual adjustment"),
        reason: String(body.reason ?? ""),
        branch: String(body.branch ?? "Main").slice(0, 100),
        batch: String(body.batch ?? "").slice(0, 100),
        ...(isIsoDate(body.expiryDate) ? { expiryDate: body.expiryDate } : {}),
      },
      member.uid,
    );

    if (current) {
      await updateDoc(
        "stock",
        current.id,
        {
          quantity: newQuantity,
          unitCostMinor: newCost,
          reorderLevel: Number(current.reorderLevel ?? 0),
        },
        member.uid,
      );
    } else {
      await createDoc(
        "stock",
        {
          itemId,
          location,
          quantity: newQuantity,
          unitCostMinor: direction === "in" ? unitCostMinor : 0,
          reorderLevel: 0,
          branch: String(body.branch ?? "Main").slice(0, 100),
          batch: String(body.batch ?? "").slice(0, 100),
          ...(isIsoDate(body.expiryDate) ? { expiryDate: body.expiryDate } : {}),
        },
        member.uid,
      );
    }

    return NextResponse.json({ id: movementId, quantity: newQuantity }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
