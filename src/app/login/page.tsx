"use client";

import { signInWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { AuthCard } from "@/components/auth-card";
import { useAuth } from "@/components/auth-provider";
import { getErrorMessage } from "@/lib/errors";
import { getAuthClient, isFirebaseConfigured } from "@/lib/firebase";

const inputClass =
  "mt-1 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-sm text-navy outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, user, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!isFirebaseConfigured) {
      setError("Firebase environment variables are not configured yet.");
      return;
    }

    setBusy(true);

    try {
      await signInWithEmailAndPassword(getAuthClient(), email, password);
      router.push("/dashboard");
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your quikpack Tally workspace."
      footer={
        <>
          New here?{" "}
          <Link href="/signup" className="font-bold text-brand hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
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
            autoComplete="current-password"
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
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthCard>
  );
}
