import { NextResponse } from "next/server";
import { readBody } from "@/lib/api-body";
import { requireMember } from "@/lib/api-member";
import { COLLECTION_ACCESS, isGenericCollection } from "@/lib/collections";
import { createDoc, listDocs, queryDocs } from "@/lib/data";
import { getErrorMessage } from "@/lib/errors";

type Context = { params: Promise<{ collection: string }> };

export async function GET(request: Request, context: Context) {
  const { collection } = await context.params;
  if (!isGenericCollection(collection)) {
    return NextResponse.json({ error: "Unknown collection." }, { status: 404 });
  }

  const member = await requireMember(request, COLLECTION_ACCESS[collection].feature);
  if (member instanceof NextResponse) {
    return member;
  }

  try {
    const url = new URL(request.url);
    const [field, value] = Array.from(url.searchParams.entries())[0] ?? [];
    const items = field && value ? await queryDocs(collection, field, value) : await listDocs(collection);
    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request, context: Context) {
  const { collection } = await context.params;
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

  try {
    const id = await createDoc(collection, body, member.uid);
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
