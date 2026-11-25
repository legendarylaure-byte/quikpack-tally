import { NextResponse } from "next/server";
import { readBody } from "@/lib/api-body";
import { requireMember } from "@/lib/api-member";
import { parseCsvObjects } from "@/lib/csv";
import { createDoc, queryDocs, updateDoc } from "@/lib/data";
import { getErrorMessage } from "@/lib/errors";
import { prepareMasterImportRows } from "@/lib/master-import";

export async function POST(request: Request) {
  const member = await requireMember(request, "masters");
  if (member instanceof NextResponse) {
    return member;
  }
  if (!member.admin && member.role !== "accountant") {
    return NextResponse.json({ error: "You cannot import masters." }, { status: 403 });
  }

  const body = await readBody(request);
  if (body instanceof NextResponse) {
    return body;
  }

  const collection = body.collection;
  if (collection !== "items" && collection !== "parties") {
    return NextResponse.json({ error: "Choose items or parties to import." }, { status: 400 });
  }
  if (typeof body.csv !== "string") {
    return NextResponse.json({ error: "Provide CSV data to import." }, { status: 400 });
  }

  let csvRows;
  try {
    csvRows = parseCsvObjects(body.csv);
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 400 });
  }
  if (csvRows.length === 0 || csvRows.length > 1000) {
    return NextResponse.json(
      { error: "Import between 1 and 1000 rows." },
      { status: 400 },
    );
  }

  let prepared;
  try {
    prepared = prepareMasterImportRows(collection, csvRows);
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 400 });
  }

  try {
    const key = collection === "items" ? "sku" : "name";
    let created = 0;
    let updated = 0;
    for (const doc of prepared) {
      const existing = await queryDocs(collection, key, String(doc[key]));
      if (existing.length > 0) {
        await updateDoc(collection, existing[0].id, doc, member.uid);
        updated += 1;
      } else {
        await createDoc(collection, doc, member.uid);
        created += 1;
      }
    }
    return NextResponse.json(
      { imported: prepared.length, created, updated },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
