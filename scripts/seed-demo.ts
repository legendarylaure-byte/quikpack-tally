import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import * as admin from "firebase-admin";
import { defaultPermissions, type Role } from "../src/lib/permissions";

interface DemoItem {
  sku: string;
  name: string;
  barcode: string;
  unit: string;
  taxCategory: string;
  salePriceMinor: number;
  purchasePriceMinor: number;
  reorderLevel: number;
  trackStock: boolean;
  resellable: boolean;
  location: string;
  customFields: string;
}

const COMPANY_ID = "quikpack-main";
const DEMO_USERS: Array<{ email: string; role: Role; fullName: string }> = [
  { email: "qa.admin@quikpack.local", role: "admin", fullName: "Demo Admin" },
  { email: "qa.accountant@quikpack.local", role: "accountant", fullName: "Demo Accountant" },
  { email: "qa.cashier@quikpack.local", role: "cashier", fullName: "Demo Cashier" },
  { email: "qa.viewer@quikpack.local", role: "viewer", fullName: "Demo Viewer" },
  { email: "qa.auditor@quikpack.local", role: "auditor", fullName: "Demo Auditor" },
];

const password = process.env.DEMO_PASSWORD;
if (!password || password.length < 8) {
  throw new Error("Set DEMO_PASSWORD to at least 8 characters before seeding the dev demo.");
}

const serviceAccountPath = resolve(process.cwd(), ".secrets/firebase-dev-service-account.json");
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8")) as {
  project_id: string;
};
if (serviceAccount.project_id.includes("prod")) {
  throw new Error("Refusing to seed a production Firebase project.");
}

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(readFileSync(serviceAccountPath, "utf8")) as admin.ServiceAccount,
    ),
    projectId: serviceAccount.project_id,
  });
}

const auth = admin.auth();
const db = admin.firestore();
const now = admin.firestore.FieldValue.serverTimestamp();
const today = new Date().toISOString().slice(0, 10);

async function ensureUser(email: string, fullName: string): Promise<admin.auth.UserRecord> {
  try {
    return await auth.getUserByEmail(email);
  } catch (error) {
    if ((error as { code?: string }).code !== "auth/user-not-found") {
      throw error;
    }
    return auth.createUser({ email, password, displayName: fullName, emailVerified: true });
  }
}

async function seedUsers(): Promise<string> {
  const adminUser = await ensureUser(DEMO_USERS[0].email, DEMO_USERS[0].fullName);
  const membershipCol = db
    .collection("companyUsers")
    .doc(COMPANY_ID)
    .collection("users");

  for (const demoUser of DEMO_USERS) {
    const user = await ensureUser(demoUser.email, demoUser.fullName);
    await auth.updateUser(user.uid, { password, displayName: demoUser.fullName, emailVerified: true });

    await membershipCol.doc(user.uid).set(
      {
        uid: user.uid,
        email: demoUser.email,
        fullName: demoUser.fullName,
        companyId: COMPANY_ID,
        role: demoUser.role,
        status: "approved",
        permissions: defaultPermissions(demoUser.role),
        approvedBy: adminUser.uid,
        createdAt: now,
        updatedAt: now,
      },
      { merge: true },
    );

    await db.collection("users").doc(user.uid).set(
      {
        uid: user.uid,
        email: demoUser.email,
        fullName: demoUser.fullName,
        companyIds: [COMPANY_ID],
        status: "approved",
        updatedAt: now,
      },
      { merge: true },
    );
  }

  return adminUser.uid;
}

async function seedItems(
  adminUid: string,
): Promise<Array<{ id: string; purchasePriceMinor: number }>> {
  const items = JSON.parse(
    readFileSync(resolve(process.cwd(), "scripts/demo-items.json"), "utf8"),
  ) as DemoItem[];
  const itemsCol = db.collection("items").doc(COMPANY_ID).collection("items");
  const seeded: Array<{ id: string; purchasePriceMinor: number }> = [];

  let batch = db.batch();
  let pending = 0;
  const flush = async () => {
    if (pending > 0) {
      await batch.commit();
      batch = db.batch();
      pending = 0;
    }
  };

  for (const item of items) {
    const existing = await itemsCol.where("sku", "==", item.sku).limit(1).get();
    const ref = existing.empty ? itemsCol.doc() : existing.docs[0].ref;
    seeded.push({ id: ref.id, purchasePriceMinor: item.purchasePriceMinor });
    batch.set(
      ref,
      {
        ...item,
        companyId: COMPANY_ID,
        createdBy: adminUid,
        updatedBy: adminUid,
        createdAt: now,
        updatedAt: now,
      },
      { merge: true },
    );
    pending += 1;
    if (pending === 400) {
      await flush();
    }
  }
  await flush();
  return seeded;
}

async function seedStock(
  adminUid: string,
  seeded: Array<{ id: string; purchasePriceMinor: number }>,
): Promise<number> {
  const stockCol = db.collection("stock").doc(COMPANY_ID).collection("stock");
  const movementCol = db
    .collection("stockMovements")
    .doc(COMPANY_ID)
    .collection("stockMovements");
  const batch = db.batch();

  for (const [index, item] of seeded.slice(0, 24).entries()) {
    const quantity = index < 3 ? 2 + index : 40 + index;
    const key = `${item.id}-main`;
    batch.set(
      stockCol.doc(key),
      {
        itemId: item.id,
        location: "Main",
        branch: "Main",
        quantity,
        unitCostMinor: item.purchasePriceMinor,
        reorderLevel: 10,
        companyId: COMPANY_ID,
        createdBy: adminUid,
        updatedBy: adminUid,
        createdAt: now,
        updatedAt: now,
      },
      { merge: true },
    );
    batch.set(
      movementCol.doc(`${key}-in`),
      {
        itemId: item.id,
        location: "Main",
        branch: "Main",
        direction: "in",
        quantity,
        unitCostMinor: item.purchasePriceMinor,
        date: today,
        reference: `DEMO-GRN-${index + 1}`,
        reason: "Demo opening stock",
        companyId: COMPANY_ID,
        createdBy: adminUid,
        updatedBy: adminUid,
        createdAt: now,
        updatedAt: now,
      },
      { merge: true },
    );
  }
  await batch.commit();
  return 24;
}

async function main() {
  const adminUid = await seedUsers();
  const seeded = await seedItems(adminUid);
  const stockRows = await seedStock(adminUid, seeded);
  console.log(
    JSON.stringify(
      {
        project: serviceAccount.project_id,
        companyId: COMPANY_ID,
        itemsUpserted: seeded.length,
        stockRowsUpserted: stockRows,
        users: DEMO_USERS.map(({ email, role }) => ({ email, role })),
        password: "set from DEMO_PASSWORD",
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error("Demo seed failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
