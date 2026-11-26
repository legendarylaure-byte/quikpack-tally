"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { AuthGuard } from "@/components/auth-guard";
import { BriefView } from "@/components/dashboard/brief-view";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { SignOutButton } from "@/components/sign-out-button";
import { useAuth } from "@/components/auth-provider";
import { apiFetch } from "@/lib/api-client";
import { buildDashboardBrief, type DashboardData } from "@/lib/dashboard";
import { getDashboardFixtures } from "@/lib/dashboard.fixtures";
import type {
  Account,
  Invoice,
  Payment,
  StockDoc,
  StockMovement,
  Voucher,
} from "@/lib/domain";
import { getErrorMessage } from "@/lib/errors";

function emptyList(): Promise<{ items: unknown[] }> {
  return Promise.resolve({ items: [] });
}

function DashboardContent() {
  const { user, isAdmin, role, can } = useAuth();
  const [data, setData] = useState<DashboardData>({});
  const [lastChecked, setLastChecked] = useState(() => new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!user) {
      return;
    }
    setRefreshing(true);
    setError("");

    try {
      const useDemo =
        process.env.NODE_ENV === "development" &&
        typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).get("demo") === "1";
      setIsDemo(useDemo);

      if (useDemo) {
        setData(getDashboardFixtures());
        setLastChecked(new Date());
        return;
      }

      const token = await user.getIdToken();
      const list = (path: string) => apiFetch<{ items: unknown[] }>(token, path);

      const [accounts, parties, items, vouchers, invoices, payments, stock, movements, settings, auditLogs, users] =
        await Promise.all([
          can("masters") ? list("/api/data/accounts") : emptyList(),
          can("masters") ? list("/api/data/parties") : emptyList(),
          can("masters") ? list("/api/data/items") : emptyList(),
          can("vouchers") ? list("/api/vouchers") : emptyList(),
          can("invoicing") ? list("/api/invoices") : emptyList(),
          can("invoicing") ? list("/api/data/payments") : emptyList(),
          can("inventory") ? list("/api/data/stock") : emptyList(),
          can("inventory") ? list("/api/data/stockMovements") : emptyList(),
          can("settings") ? list("/api/data/settings") : emptyList(),
          can("reports") ? list("/api/data/auditLogs") : emptyList(),
          isAdmin
            ? apiFetch<{ users: unknown[] }>(token, "/api/admin/users")
            : Promise.resolve({ users: [] as unknown[] }),
        ]);

      const company = settings.items.find(
        (row) => (row as Record<string, unknown>).key === "company",
      ) as Record<string, unknown> | undefined;

      setData({
        accounts: accounts.items as Account[],
        parties: parties.items as Array<{ id?: string; name?: string; type?: string }>,
        items: items.items as Array<{ id?: string; name?: string; sku?: string; reorderLevel?: number }>,
        vouchers: vouchers.items as Voucher[],
        invoices: invoices.items as Invoice[],
        payments: payments.items as Payment[],
        stock: stock.items as StockDoc[],
        movements: movements.items as StockMovement[],
        settings: company,
        auditLogs: auditLogs.items as Array<Record<string, unknown> & { id?: string }>,
        users: users.users as Array<{ uid?: string; email?: string; role?: string; status?: string }>,
      });
      setLastChecked(new Date());
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setRefreshing(false);
      setHasLoaded(true);
    }
  }, [user, can, isAdmin]);

  useEffect(() => {
    void Promise.resolve().then(() => load());
  }, [load]);

  const brief = useMemo(
    () =>
      buildDashboardBrief({
        role: role ?? "viewer",
        can,
        data,
        now: lastChecked,
      }),
    [role, can, data, lastChecked],
  );

  return (
    <AppShell
      title={brief.title}
      subtitle={user?.email ? `Signed in as ${user.email}` : "Your workspace"}
      actions={<SignOutButton />}
    >
      {error ? (
        <p role="alert" className="mb-5 rounded-xl bg-error/10 p-4 text-sm text-error">{error}</p>
      ) : null}
      {!hasLoaded ? (
        <DashboardSkeleton />
      ) : (
        <BriefView
          brief={brief}
          lastChecked={lastChecked}
          refreshing={refreshing}
          isDemo={isDemo}
          onRefresh={() => void load()}
        />
      )}
    </AppShell>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
