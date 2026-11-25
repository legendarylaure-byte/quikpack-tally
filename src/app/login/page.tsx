"use client";

import {
  getMultiFactorResolver,
  signInWithEmailAndPassword,
  TotpMultiFactorGenerator,
  type MultiFactorError,
  type MultiFactorResolver,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { AuthCard } from "@/components/auth-card";
import { useAuth } from "@/components/auth-provider";
import { getErrorMessage } from "@/lib/errors";
import { getAuthClient, isFirebaseConfigured } from "@/lib/firebase";
import { totpHint } from "@/lib/mfa";
import { SUPPORT } from "@/lib/constants";

const inputClass =
  "mt-1 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-sm text-navy outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [resolver, setResolver] = useState<MultiFactorResolver | null>(null);
  const [challengeCode, setChallengeCode] = useState("");

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
      router.replace("/dashboard");
    } catch (submitError) {
      const code = (submitError as { code?: string }).code;
      if (code === "auth/multi-factor-auth-required") {
        const mfaResolver = getMultiFactorResolver(
          getAuthClient(),
          submitError as MultiFactorError,
        );
        if (!totpHint(mfaResolver.hints)) {
          setError("No authenticator app is enrolled for this account.");
          return;
        }
        setResolver(mfaResolver);
        setError("");
        return;
      }
      setError(getErrorMessage(submitError));
    } finally {
      setBusy(false);
    }
  }

  async function handleChallenge(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!resolver || !challengeCode.trim()) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      const hint = totpHint(resolver.hints);
      if (!hint) {
        throw new Error("No authenticator app is enrolled for this account.");
      }
      const assertion = TotpMultiFactorGenerator.assertionForSignIn(
        hint.uid,
        challengeCode.trim(),
      );
      await resolver.resolveSignIn(assertion);
      setResolver(null);
      setChallengeCode("");
      router.replace("/dashboard");
    } catch (challengeError) {
      setError(getErrorMessage(challengeError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your quikpack Tally workspace."
      footer={
        <a
          href={SUPPORT.whatsappUrl}
          className="font-bold text-brand hover:underline"
        >
          Need help? Contact support on WhatsApp
        </a>
      }
    >
      {resolver ? (
        <form onSubmit={handleChallenge} className="space-y-5">
          <p className="text-sm text-navy/70">
            Enter the 6-digit code from your authenticator app.
          </p>
          <label className="block text-sm font-semibold text-navy">
            Verification code
            <input
              type="text"
              required
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              autoComplete="one-time-code"
              value={challengeCode}
              onChange={(event) => setChallengeCode(event.target.value)}
              className={inputClass}
              placeholder="000000"
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
            {busy ? "Verifying…" : "Verify code"}
          </button>
          <button
            type="button"
            onClick={() => {
              setResolver(null);
              setChallengeCode("");
              setPassword("");
              setError("");
            }}
            className="w-full text-sm font-bold text-navy/70 hover:underline"
          >
            Use another account
          </button>
        </form>
      ) : (
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
              placeholder="Enter your password"
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
      )}
    </AuthCard>
  );
}
