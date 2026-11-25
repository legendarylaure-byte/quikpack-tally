"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import type { FeatureKey } from "@/lib/permissions";
import { useAuth } from "./auth-provider";

export function FeatureGuard({
  feature,
  children,
}: {
  feature: FeatureKey;
  children: ReactNode;
}) {
  const { can, loading } = useAuth();
  const router = useRouter();
  const allowed = can(feature);

  useEffect(() => {
    if (!loading && !allowed) {
      router.replace("/dashboard");
    }
  }, [loading, allowed, router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface">
        <p className="text-sm font-semibold text-navy/70">Loading workspace…</p>
      </main>
    );
  }
  if (!allowed) {
    return null;
  }
  return <>{children}</>;
}
