"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/components/auth-provider";
import { FeatureGuard } from "@/components/feature-guard";
import { SignOutButton } from "@/components/sign-out-button";
import { apiFetch } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/errors";
import { formatMoney } from "@/lib/money";

const REPORTS = [
  { key: "pnl", label: "Profit & Loss" },
  { key: "trial-balance", label: "Trial Balance" },
  { key: "balance-sheet", label: "Balance Sheet" },
  { key: "vat", label: "VAT / NHIL / GETFund" },
  { key: "ar-ap", label: "AR / AP Aging" },
  { key: "stock", label: "Stock Movement" },
  { key: "cashflow", label: "Cashflow (lite)" },
  { key: "ledger", label: "Ledger" },
  { key: "day-book", label: "Day book" },
] as const;

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

function renderCell(value: Json): string {
  if (value === null || value === undefined) {
    return "—";
  }
  if (Array.isArray(value) || typeof value === "object") {
    return "";
  }
  if (typeof value === "number") {
    return String(value);
  }
  return String(value);
}

function isMoneyKey(key: string, value: Json): boolean {
  return key.endsWith("Minor") && typeof value === "number";
}

function DataView({ value }: { value: Json }) {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <p className="text-sm text-navy/55">No data.</p>;
    }
    if (value.every((entry) => typeof entry !== "object" || entry === null)) {
      return (
        <ul className="list-disc space-y-1 pl-5 text-sm text-navy/75">
          {value.map((entry, index) => (
            <li key={index}>{renderCell(entry)}</li>
          ))}
        </ul>
      );
    }
    const rows = value as Array<Record<string, Json>>;
    const keys = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr className="border-b border-navy/10 text-xs uppercase text-navy/50">
              {keys.map((key) => (
                <th key={key} className="px-3 py-2 font-bold">
                  {key.replace(/Minor$/, "").replace(/([A-Z])/g, " $1")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-b border-navy/5 last:border-0">
                {keys.map((key) => {
                  const cell = row[key] ?? null;
                  return (
                    <td key={key} className="px-3 py-2.5 text-navy/75">
                      {isMoneyKey(key, cell) ? formatMoney(Number(cell)) : renderCell(cell)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value).filter(([, child]) => child !== null);
    if (entries.every(([, child]) => typeof child !== "object" || child === null)) {
      return (
        <dl className="grid gap-2 sm:grid-cols-2">
          {entries.map(([key, child]) => (
            <div key={key} className="flex justify-between gap-4 rounded-lg bg-navy/5 px-4 py-2">
              <dt className="text-sm text-navy/60">
                {key.replace(/Minor$/, "").replace(/([A-Z])/g, " $1")}
              </dt>
              <dd className="text-sm font-bold text-navy">
                {isMoneyKey(key, child) ? formatMoney(Number(child)) : renderCell(child)}
              </dd>
            </div>
          ))}
        </dl>
      );
    }
    return (
      <div className="space-y-5">
        {entries.map(([key, child]) => (
          <div key={key}>
            <h3 className="mb-2 text-sm font-bold capitalize text-navy/70">
              {key.replace(/([A-Z])/g, " $1")}
            </h3>
            <DataView value={child} />
          </div>
        ))}
      </div>
    );
  }

  return <p className="text-sm font-bold text-navy">{renderCell(value)}</p>;
}

function ReportsContent() {
  const { user } = useAuth();
  const [type, setType] = useState<string>("pnl");
  const [report, setReport] = useState<Json | null>(null);
  const [generatedAt, setGeneratedAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!user) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      const token = await user.getIdToken();
      const data = await apiFetch<{ data: Json; generatedAt: string }>(
        token,
        `/api/reports/${type}`,
      );
      setReport(data.data);
      setGeneratedAt(data.generatedAt);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [user, type]);

  useEffect(() => {
    void Promise.resolve().then(() => load());
  }, [load]);

  return (
    <AppShell
      title="Reports"
      subtitle="Financial, tax, inventory and aging reports from posted records."
      actions={<SignOutButton />}
    >
      <div className="mb-6 flex flex-wrap gap-2">
        {REPORTS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setType(item.key)}
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
              type === item.key
                ? "brand-gradient text-white"
                : "border border-navy/15 text-navy hover:border-brand"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error ? (
        <p role="alert" className="mb-5 rounded-xl bg-error/10 p-4 text-sm text-error">{error}</p>
      ) : null}

      <section className="glass-panel rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-navy">
            {REPORTS.find((item) => item.key === type)?.label}
          </h2>
          {generatedAt ? (
            <p className="text-xs text-navy/50">Generated {new Date(generatedAt).toLocaleString()}</p>
          ) : null}
        </div>
        <div className="mt-5">
          {loading ? (
            <p className="text-sm text-navy/65">Building report…</p>
          ) : report === null ? (
            <p className="text-sm text-navy/60">No report data.</p>
          ) : (
            <DataView value={report} />
          )}
        </div>
      </section>
    </AppShell>
  );
}

export default function ReportsPage() {
  return (
    <AuthGuard>
      <FeatureGuard feature="reports">
        <ReportsContent />
      </FeatureGuard>
    </AuthGuard>
  );
}
