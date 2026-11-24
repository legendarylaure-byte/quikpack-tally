"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "./auth-provider";

function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface">
      <p className="text-sm font-semibold text-navy/70">Loading workspace…</p>
    </main>
  );
}

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading, membership, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return;
    }
    if (!user) {
      router.replace("/login");
      return;
    }
    if (isAdmin || membership?.status === "approved") {
      return;
    }
    router.replace("/access-status");
  }, [loading, user, isAdmin, membership, router]);

  if (loading) {
    return <Loading />;
  }
  if (!user || (!isAdmin && membership?.status !== "approved")) {
    return null;
  }

  return <>{children}</>;
}

export function AdminGuard({ children }: { children: ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return;
    }
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!isAdmin) {
      router.replace("/dashboard");
    }
  }, [loading, user, isAdmin, router]);

  if (loading) {
    return <Loading />;
  }
  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}
