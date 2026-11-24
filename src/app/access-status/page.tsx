"use client";

import { AuthCard } from "@/components/auth-card";
import { useAuth } from "@/components/auth-provider";
import { SignOutButton } from "@/components/sign-out-button";
import { SUPPORT } from "@/lib/constants";

export default function AccessStatusPage() {
  const { membership, loading } = useAuth();
  const suspended = membership?.status === "suspended";

  return (
    <AuthCard
      title={suspended ? "Access suspended" : "Waiting for admin approval"}
      subtitle={
        suspended
          ? "Your access has been paused by your administrator."
          : "Your account is active but not yet approved for this workspace."
      }
      footer={<SignOutButton />}
    >
      <p className="text-sm text-navy/70">
        {suspended
          ? "Contact your administrator to restore access."
          : "Once an administrator approves your access, sign in again to continue."}
      </p>
      <a
        href={SUPPORT.whatsappUrl}
        className="mt-5 inline-block rounded-xl border border-navy/15 px-5 py-3 text-sm font-bold text-navy transition hover:border-brand hover:text-brand"
      >
        Contact support
      </a>
      {loading ? (
        <p className="mt-4 text-xs text-navy/50">Checking your access status…</p>
      ) : null}
    </AuthCard>
  );
}
