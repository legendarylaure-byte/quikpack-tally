import { FieldValue } from "firebase-admin/firestore";
import { COMPANY_COLLECTIONS, GLOBAL_COLLECTIONS, type DataCollection } from "./collections";
import { getAdminDb } from "./firebase-admin";
import { MAIN_COMPANY_ID } from "./permissions";

export { COMPANY_COLLECTIONS, GLOBAL_COLLECTIONS };
export type { DataCollection };

export function collectionRef(name: DataCollection) {
  const db = getAdminDb();
  return (COMPANY_COLLECTIONS as readonly string[]).includes(name)
    ? db.collection(name).doc(MAIN_COMPANY_ID).collection(name)
    : db.collection(name);
}

export function serialize<T extends Record<string, unknown>>(data: T) {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (
      value &&
      typeof value === "object" &&
      typeof (value as { toDate?: unknown }).toDate === "function"
    ) {
      result[key] = (value as { toDate: () => Date }).toDate().toISOString();
    } else {
      result[key] = value;
    }
  }
  return result;
}

type StoredRecord = Record<string, unknown> & { id: string };

function toRecord(snapshot: {
  id: string;
  data: () => Record<string, unknown> | undefined;
}): StoredRecord {
  return { id: snapshot.id, ...serialize(snapshot.data() ?? {}) };
}

export async function listDocs(
  name: DataCollection,
  options?: { orderBy?: string; direction?: "asc" | "desc"; limit?: number },
): Promise<StoredRecord[]> {
  let query = collectionRef(name) as ReturnType<typeof collectionRef>;
  if (options?.orderBy) {
    query = query.orderBy(options.orderBy, options.direction ?? "asc") as typeof query;
  }
  if (options?.limit) {
    query = query.limit(options.limit) as typeof query;
  }
  const snapshot = await query.get();
  return snapshot.docs
    .filter((doc) => doc.data().deleted !== true)
    .map((doc) => toRecord(doc));
}

export async function queryDocs(
  name: DataCollection,
  field: string,
  value: unknown,
): Promise<StoredRecord[]> {
  const snapshot = await collectionRef(name).where(field, "==", value).get();
  return snapshot.docs
    .filter((doc) => doc.data().deleted !== true)
    .map((doc) => toRecord(doc));
}

export async function getDoc(
  name: DataCollection,
  id: string,
): Promise<StoredRecord | null> {
  const snapshot = await collectionRef(name).doc(id).get();
  if (!snapshot.exists || snapshot.data()?.deleted === true) {
    return null;
  }
  return toRecord(snapshot);
}

async function writeAudit(
  name: DataCollection,
  id: string,
  action: string,
  uid: string,
) {
  await collectionRef("auditLogs").add({
    collection: name,
    documentId: id,
    action,
    uid,
    at: FieldValue.serverTimestamp(),
  });
}

export async function createDoc(
  name: DataCollection,
  data: Record<string, unknown>,
  uid: string,
  id?: string,
) {
  const ref = id ? collectionRef(name).doc(id) : collectionRef(name).doc();
  const companyField = (COMPANY_COLLECTIONS as readonly string[]).includes(name)
    ? { companyId: MAIN_COMPANY_ID }
    : {};
  await ref.set({
    ...data,
    ...companyField,
    createdAt: FieldValue.serverTimestamp(),
    createdBy: uid,
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: uid,
  });
  await writeAudit(name, ref.id, "create", uid);
  return ref.id;
}

export async function updateDoc(
  name: DataCollection,
  id: string,
  patch: Record<string, unknown>,
  uid: string,
) {
  const ref = collectionRef(name).doc(id);
  const existing = await ref.get();
  if (!existing.exists || existing.data()?.deleted === true) {
    return false;
  }
  await ref.set(
    {
      ...patch,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: uid,
    },
    { merge: true },
  );
  await writeAudit(name, id, "update", uid);
  return true;
}

export async function deleteDoc(name: DataCollection, id: string, uid: string) {
  const ref = collectionRef(name).doc(id);
  const existing = await ref.get();
  if (!existing.exists || existing.data()?.deleted === true) {
    return false;
  }
  await ref.set(
    {
      deleted: true,
      deletedAt: FieldValue.serverTimestamp(),
      deletedBy: uid,
    },
    { merge: true },
  );
  await writeAudit(name, id, "delete", uid);
  return true;
}

export async function getAllDataForExport(uid: string) {
  const names: DataCollection[] = [
    ...COMPANY_COLLECTIONS,
    ...GLOBAL_COLLECTIONS,
    "vouchers",
    "invoices",
  ];
  const unique = Array.from(new Set(names));
  const result: Record<string, unknown[]> = {};
  for (const name of unique) {
    result[name] = await listDocs(
      name,
      name === "auditLogs" ? { orderBy: "at" } : { orderBy: "createdAt" },
    );
  }
  await writeAudit("auditLogs", "export", "export", uid);
  return result;
}
