import { NextResponse } from "next/server";
import { requireMember } from "@/lib/api-member";
import { isGenericCollection, type GenericCollection } from "@/lib/collections";
import { toCsv } from "@/lib/csv";
import { getAllDataForExport, listDocs } from "@/lib/data";
import { getErrorMessage } from "@/lib/errors";

export async function GET(request: Request) {
  const member = await requireMember(request, "reports");
  if (member instanceof NextResponse) {
    return member;
  }
  try {
    const url = new URL(request.url);
    const format = url.searchParams.get("format") ?? "json";
    const stamp = new Date().toISOString().slice(0, 10);
    if (format === "csv") {
      const selected = url.searchParams.get("collection");
      if (selected && !isGenericCollection(selected)) {
        return NextResponse.json({ error: "Unknown collection." }, { status: 404 });
      }
      const data = selected
        ? { [selected]: await listDocs(selected as GenericCollection) }
        : await getAllDataForExport(member.uid);
      const rows = Object.entries(data).flatMap(([collection, items]) =>
        (items as Array<Record<string, unknown>>).map((item) => ({
          collection,
          ...item,
        })),
      );
      return new NextResponse(toCsv(rows), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="quikpack-tally-${stamp}.csv"`,
          "Cache-Control": "private, no-store",
        },
      });
    }
    const data = await getAllDataForExport(member.uid);
    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="quikpack-tally-export-${stamp}.json"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
