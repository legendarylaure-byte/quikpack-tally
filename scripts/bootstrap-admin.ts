import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { COMPANY } from "../src/lib/constants";
import { defaultPermissions, MAIN_COMPANY_ID } from "../src/lib/permissions";

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!email) {
    throw new Error("Usage: npx tsx scripts/bootstrap-admin.ts <admin-email>");
  }
  if (!serviceAccount) {
    throw new Error("Set FIREBASE_SERVICE_ACCOUNT_JSON to the project's service account JSON.");
  }

  const app = initializeApp({ credential: cert(JSON.parse(serviceAccount)) });
  const auth = getAuth(app);
  const db = getFirestore(app);

  let user;
  try {
    user = await auth.getUserByEmail(email);
  } catch (error) {
    if ((error as { code?: string }).code !== "auth/user-not-found") {
      throw error;
    }
    user = await auth.createUser({ email, displayName: "QUIKPACK Administrator" });
  }

  await auth.setCustomUserClaims(user.uid, { admin: true });

  await db.collection("companies").doc(MAIN_COMPANY_ID).set(
    {
      name: COMPANY.legalName,
      legalName: COMPANY.legalName,
      registrationNumber: COMPANY.registrationNumber,
      tin: COMPANY.tin,
      country: COMPANY.country,
      baseCurrency: "GHS",
      displayCurrency: "GHS",
      ownerUid: user.uid,
      logoDataUrl: "",
      onboardingComplete: true,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  await db.collection("users").doc(user.uid).set(
    {
      email,
      fullName: "QUIKPACK Administrator",
      companyIds: [MAIN_COMPANY_ID],
      status: "approved",
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  await db
    .collection("companyUsers")
    .doc(MAIN_COMPANY_ID)
    .collection("users")
    .doc(user.uid)
    .set(
      {
        uid: user.uid,
        email,
        fullName: "QUIKPACK Administrator",
        companyId: MAIN_COMPANY_ID,
        role: "admin",
        status: "approved",
        permissions: defaultPermissions("admin"),
        approvedBy: user.uid,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

  const resetUrl = await auth.generatePasswordResetLink(email);

  console.log(`Admin ready: ${email}`);
  console.log(`UID: ${user.uid}`);
  console.log(`Password setup link: ${resetUrl}`);
  console.log("Sign out and sign back in after setting a password so the admin claim is refreshed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
