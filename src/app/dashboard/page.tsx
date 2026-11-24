"use client";

import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/components/auth-provider";
import { SignOutButton } from "@/components/sign-out-button";
import { getErrorMessage } from "@/lib/errors";
import { getDb } from "@/lib/firebase";

interface CompanySummary {
  id: string;
  name: string;
  legalName: string;
  baseCurrency: string;
  displayCurrency: string;
  onboardingComplete: boolean;
}

function DashboardContent() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<CompanySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      return;
    }

    let active = true;

    async function loadCompanies() {
      try {
        const db = getDb();
        const userSnap = await getDoc(doc(db, "users", user!.uid));
        const companyIds = (userSnap.data()?.companyIds as string[] | undefined) ?? [];

        const companySnaps = await Promise.all(
          companyIds.map((companyId) => getDoc(doc(db, "companies", companyId))),
        );

        const nextCompanies: CompanySummary[] = [];
        for (const companySnap of companySnaps) {
          if (!companySnap.exists()) {
            continue;
          }

          const data = companySnap.data();
          nextCompanies.push({
            id: companySnap.id,
            name: String(data.name ?? "Unnamed workspace"),
            legalName: String(data.legalName ?? data.name ?? ""),
            baseCurrency: String(data.baseCurrency ?? "GHS"),
            displayCurrency: String(data.displayCurrency ?? "GHS"),
            onboardingComplete: Boolean(data.onboardingComplete),
          });
        }

        if (active) {
          setCompanies(nextCompanies);
        }
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

    loadCompanies();
    return () => {
      active = false;
    };
  }, [user]);

  return (
    <AppShell
      title="Dashboard"
      subtitle={user?.email ? `Signed in as ${user.email}` : "Your workspaces"}
      actions={<SignOutButton />}
    >
      {error ? (
        <p role="alert" className="rounded-xl bg-error/10 p-4 text-sm text-error">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-navy/65">Loading workspaces…</p>
      ) : companies.length === 0 ? (
        <section className="glass-panel rounded-2xl p-8">
          <h2 className="text-xl font-bold text-navy">No workspace found</h2>
          <p className="mt-2 text-sm text-navy/65">
            This account has no linked company workspace yet.
          </p>
          <Link
            href="/onboarding"
            className="mt-5 inline-block rounded-xl bg-navy px-5 py-3 text-sm font-bold text-white"
          >
            Go to company setup
          </Link>
        </section>
      ) : (
        <section className="grid gap-5 sm:grid-cols-2">
          {companies.map((company) => (
            <article
              key={company.id}
              className="glass-panel rounded-2xl p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-navy">{company.name}</h2>
                  <p className="mt-1 text-xs text-navy/55">{company.legalName}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    company.onboardingComplete
                      ? "bg-brand/15 text-brand"
                      : "bg-warning/20 text-navy/60"
                  }`}
                >
                  {company.onboardingComplete ? "Ready" : "Setup needed"}
                </span>
              </div>

              <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-navy/60">
                <span className="rounded-lg bg-surface px-3 py-2">
                  Base {company.baseCurrency}
                </span>
                <span className="rounded-lg bg-surface px-3 py-2">
                  Display {company.displayCurrency}
                </span>
              </div>

              {company.onboardingComplete ? (
                <p className="mt-6 text-sm font-semibold text-brand">
                  Workspace ready for books.
                </p>
              ) : (
                <Link
                  href="/onboarding"
                  className="mt-6 inline-block rounded-xl bg-navy px-5 py-3 text-sm font-bold text-white transition hover:bg-info"
                >
                  Finish setup
                </Link>
              )}
            </article>
          ))}
        </section>
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
