"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/components/auth-provider";
import { FeatureGuard } from "@/components/feature-guard";
import { SignOutButton } from "@/components/sign-out-button";
import { apiFetch } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/errors";

type Row = Record<string, unknown> & { id: string };

function AuditContent() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<Row[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      return;
    }
    try {
      const token = await user.getIdToken();
      const data = await apiFetch<{ items: Row[] }>(token, "/api/data/auditLogs");
      setLogs(data.items.sort((a, b) => String(b.at ?? "").localeCompare(String(a.at ?? ""))));
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void Promise.resolve().then(() => load());
  }, [load]);

  return (
    <AppShell
      title="Audit log"
      subtitle="Append-only record of creates, updates, deletes and exports."
      actions={<SignOutButton />}
    >
      {error ? (
        <p role="alert" className="mb-5 rounded-xl bg-error/10 p-4 text-sm text-error">{error}</p>
      ) : null}
      <section className="glass-panel rounded-2xl p-6">
        <h2 className="text-lg font-bold text-navy">Activity</h2>
        <div className="mt-4 overflow-x-auto">
          {loading ? (
            <p className="text-sm text-navy/65">Loading…</p>
          ) : logs.length === 0 ? (
            <p className="rounded-xl border border-dashed border-navy/20 p-6 text-sm text-navy/60">No activity recorded yet.</p>
          ) : (
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-navy/10 text-xs uppercase text-navy/50">
                  <th className="px-3 py-2">When</th>
                  <th className="px-3 py-2">Action</th>
                  <th className="px-3 py-2">Collection</th>
                  <th className="px-3 py-2">Document</th>
                  <th className="px-3 py-2">User</th>
                </tr>
              </thead>
              <tbody>
                {logs.slice(0, 200).map((log) => (
                  <tr key={log.id} className="border-b border-navy/5 last:border-0">
                    <td className="px-3 py-3 text-navy/70">
                      {log.at ? new Date(String(log.at)).toLocaleString() : "—"}
                    </td>
                    <td className="px-3 py-3">
                      <span className="rounded-full bg-navy/5 px-3 py-1 text-xs font-bold text-navy/60">{String(log.action ?? "")}</span>
                    </td>
                    <td className="px-3 py-3 text-navy/70">{String(log.collection ?? "")}</td>
                    <td className="px-3 py-3 text-navy/70">{String(log.documentId ?? "")}</td>
                    <td className="px-3 py-3 text-navy/60">{String(log.uid ?? "").slice(0, 12)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </AppShell>
  );
}

export default function AuditPage() {
  return (
    <AuthGuard>
      <FeatureGuard feature="reports">
        <AuditContent />
      </FeatureGuard>
    </AuthGuard>
  );
}
