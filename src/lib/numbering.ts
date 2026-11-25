import { listDocs, type DataCollection } from "./data";

export async function nextNumber(
  collection: DataCollection,
  prefix: string,
  date: string,
): Promise<string> {
  const period = date.slice(0, 7).replace("-", "");
  const safePrefix = prefix.replace(/[^A-Za-z0-9]/g, "").toUpperCase() || "DOC";
  const pattern = new RegExp(`^${safePrefix}-${period}-(\\d+)$`);
  const docs = await listDocs(collection);
  let max = 0;
  for (const doc of docs) {
    const match = pattern.exec(String(doc.number ?? ""));
    if (match) {
      max = Math.max(max, Number(match[1]));
    }
  }
  return `${safePrefix}-${period}-${String(max + 1).padStart(4, "0")}`;
}
