"use client";

import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentReference,
} from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthCard } from "@/components/auth-card";
import { getErrorMessage } from "@/lib/errors";
import { getAuthClient, getDb, isFirebaseConfigured } from "@/lib/firebase";

const inputClass =
  "mt-1 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-sm text-navy outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";

export default function SignupPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!isFirebaseConfigured) {
      setError("Firebase environment variables are not configured yet.");
      return;
    }

    setBusy(true);

    let companyRef: DocumentReference | undefined;
    let membershipRef: DocumentReference | undefined;

    try {
      const auth = getAuthClient();
      const db = getDb();
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = credential.user.uid;

      await setDoc(doc(db, "users", uid), {
        email,
        companyIds: [],
        createdAt: serverTimestamp(),
      });

      companyRef = doc(collection(db, "companies"));
      await setDoc(companyRef, {
        name: companyName.trim(),
        legalName: companyName.trim(),
        ownerUid: uid,
        country: "Ghana",
        baseCurrency: "GHS",
        displayCurrency: "GHS",
        registrationNumber: "",
        tin: "",
        phone: "",
        address: "",
        logoDataUrl: "",
        onboardingComplete: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      membershipRef = doc(db, "companyUsers", companyRef.id, "users", uid);
      await setDoc(membershipRef, {
        companyId: companyRef.id,
        uid,
        email,
        role: "owner",
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "users", uid), {
        companyIds: arrayUnion(companyRef.id),
        updatedAt: serverTimestamp(),
      });

      router.push("/onboarding");
    } catch (submitError) {
      if (membershipRef) {
        await deleteDoc(membershipRef).catch(() => undefined);
      }
      if (companyRef) {
        await deleteDoc(companyRef).catch(() => undefined);
      }
      setError(getErrorMessage(submitError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard
      title="Create your workspace"
      subtitle="Start free. Set up your company details in the next step."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-brand hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block text-sm font-semibold text-navy">
          Company name
          <input
            required
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
            className={inputClass}
            placeholder="e.g. Akua Ventures"
          />
        </label>

        <label className="block text-sm font-semibold text-navy">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClass}
            placeholder="you@company.com"
          />
        </label>

        <label className="block text-sm font-semibold text-navy">
          Password
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClass}
            placeholder="At least 8 characters"
          />
        </label>

        {error ? (
          <p role="alert" className="rounded-lg bg-error/10 p-3 text-sm text-error">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="brand-gradient w-full rounded-xl px-5 py-3 text-sm font-bold text-white transition disabled:opacity-60"
        >
          {busy ? "Creating workspace…" : "Create account"}
        </button>
      </form>
    </AuthCard>
  );
}
