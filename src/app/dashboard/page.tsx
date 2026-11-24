"use client";

import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/components/auth-provider";
import { SignOutButton } from "@/components/sign-out-button";
import { getErrorMessage } from "@/lib/errors";
import { getDb } from "@/lib/firebase";
import { FEATURES, MAIN_COMPANY_ID } from "@/lib/permissions";

function DashboardContent() {
  const { user, membership, isAdmin } = useAuth();
  const [company, setCompany] = useState<{
    name: string;
    legalName: string;
    registrationNumber: string;
    tin: string;
    baseCurrency: string;
    displayCurrency: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      return;
    }

    let active = true;

    async function loadCompany() {
      try {
        const snapshot = await getDoc(doc(getDb(), "companies", MAIN_COMPANY_ID));
        if (!snapshot.exists() || !active) {
          return;
        }
        const data = snapshot.data();
        setCompany({
          name: String(data.name ?? data.legalName ?? "quikpack"),
          legalName: String(data.legalName ?? ""),
          registrationNumber: String(data.registrationNumber ?? ""),
          tin: String(data.tin ?? ""),
          baseCurrency: String(data.baseCurrency ?? "GHS"),
          displayCurrency: String(data.displayCurrency ?? "GHS"),
        });
      } catch (loadError) {
        if (active) {
          setError(getErrorMessage(loadError));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCompany();
    return () => {
      active = false;
    };
  }, [user]);

  return (
    <AppShell
      title="Dashboard"
      subtitle={user?.email ? `Signed in as ${user.email}` : "Your workspace"}
      actions={<SignOutButton />}
    >
      {error ? (
        <p role="alert" className="rounded-xl bg-error/10 p-4 text-sm text-error">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-navy/65">Loading workspace…</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="glass-panel rounded-2xl p-6">
            <h2 className="text-lg font-bold text-navy">Company</h2>
            <p className="mt-3 text-2xl font-black text-navy">
              {company?.name ?? "quikpack"}
            </p>
            <p className="mt-1 text-sm text-navy/65">{company?.legalName}</p>
            <div className="mt-6 grid gap-3 text-sm text-navy/70">
              <p>Reg: {company?.registrationNumber || "—"}</p>
              <p>TIN: {company?.tin || "—"}</p>
              <p>Base currency: {company?.baseCurrency}</p>
              <p>Display currency: {company?.displayCurrency}</p>
            </div>
          </section>

          <section className="glass-panel rounded-2xl p-6">
            <h2 className="text-lg font-bold text-navy">Your access</h2>
            <p className="mt-3 text-sm font-semibold text-brand capitalize">
              {isAdmin ? "Administrator" : (membership?.role ?? "No role assigned")}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {FEATURES.map((feature) => {
                const enabled = isAdmin || membership?.permissions[feature.key] === true;
                return (
                  <span
                    key={feature.key}
                    className={`rounded-lg px-3 py-2 text-xs font-bold ${
                      enabled
                        ? "bg-brand/15 text-brand"
                        : "bg-navy/5 text-navy/40 line-through"
                    }`}
                  >
                    {feature.label}
                  </span>
                );
              })}
            </div>
            <p className="mt-6 text-xs text-navy/55">
              Accounting modules are being added in the next release.
            </p>
          </section>
        </div>
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
