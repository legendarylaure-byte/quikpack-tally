"use client";

import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  multiFactor,
  TotpMultiFactorGenerator,
  type TotpSecret,
} from "firebase/auth";
import { QRCodeSVG } from "qrcode.react";
import { AppShell } from "@/components/app-shell";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/components/auth-provider";
import { FeatureGuard } from "@/components/feature-guard";
import { SignOutButton } from "@/components/sign-out-button";
import { apiFetch } from "@/lib/api-client";
import { CURRENCIES } from "@/lib/constants";
import type { Currency } from "@/lib/domain";
import { getErrorMessage } from "@/lib/errors";

type Row = Record<string, unknown> & { id: string };

interface SettingsDraft {
  legalName: string;
  displayName: string;
  registrationNumber: string;
  tin: string;
  country: string;
  address: string;
  phone: string;
  email: string;
  logoUrl: string;
  baseCurrency: Currency;
  displayCurrency: Currency;
  fiscalYearStartMonth: string;
  branches: string;
  taxStatus: "registered" | "unregistered";
  filingDay: string;
  invoicePrefix: string;
  voucherPrefix: string;
  valuationMethod: "weighted" | "fifo";
}

function defaultDraft(): SettingsDraft {
  return {
    legalName: "S M QUIKPACK GLOBAL LIMITED COMPANY",
    displayName: "quikpack",
    registrationNumber: "CS220561026",
    tin: "C0068105959",
    country: "Ghana",
    address: "",
    phone: "",
    email: "",
    logoUrl: "",
    baseCurrency: "GHS",
    displayCurrency: "GHS",
    fiscalYearStartMonth: "1",
    branches: "Main",
    taxStatus: "registered",
    filingDay: "31",
    invoicePrefix: "INV",
    voucherPrefix: "JV",
    valuationMethod: "weighted",
  };
}

const inputClass =
  "mt-1 w-full rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-sm text-navy outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

function MfaPanel() {
  const { user } = useAuth();
  const [qrUrl, setQrUrl] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [pendingSecret, setPendingSecret] = useState<TotpSecret | null>(null);
  const [code, setCode] = useState("");
  const [enrolled, setEnrolled] = useState<string[]>(() =>
    user ? multiFactor(user).enrolledFactors.map((item) => item.factorId ?? "factor") : [],
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function begin() {
    if (!user) {
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const factor = multiFactor(user);
      const session = await factor.getSession();
      const secret = await TotpMultiFactorGenerator.generateSecret(session);
      setPendingSecret(secret);
      setSecretKey(secret.secretKey);
      setQrUrl(secret.generateQrCodeUrl(user.email ?? "user", "QUIKPACK Tally"));
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function confirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !pendingSecret) {
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const factor = multiFactor(user);
      const assertion = TotpMultiFactorGenerator.assertionForEnrollment(
        pendingSecret,
        code,
      );
      await factor.enroll(assertion, "Authenticator app");
      await user.reload();
      setEnrolled(multiFactor(user).enrolledFactors.map((item) => item.factorId ?? "factor"));
      setPendingSecret(null);
      setQrUrl("");
      setSecretKey("");
      setCode("");
      setMessage("Authenticator app enrolled.");
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="glass-panel rounded-2xl p-6">
      <h2 className="text-lg font-bold text-navy">Two-factor authentication</h2>
      <p className="mt-1 text-sm text-navy/65">
        Optional TOTP authenticator app. Email and password remain the minimum sign-in method.
      </p>
      {message ? <p className="mt-4 text-sm text-navy/70">{message}</p> : null}
      {enrolled.length > 0 ? (
        <p className="mt-4 rounded-xl bg-brand/15 p-3 text-sm font-semibold text-brand">
          Enrolled factors: {enrolled.join(", ")}
        </p>
      ) : null}
      {!pendingSecret ? (
        <button type="button" onClick={begin} disabled={busy} className="mt-4 rounded-xl bg-navy px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">
          {busy ? "Preparing…" : "Enroll authenticator app"}
        </button>
      ) : (
        <form onSubmit={confirm} className="mt-4 space-y-3">
          <div className="mx-auto w-fit rounded-2xl bg-white p-4 ring-1 ring-navy/10">
            <QRCodeSVG
              value={qrUrl}
              size={192}
              level="M"
              includeMargin
              role="img"
              aria-label="Authenticator app QR code"
            />
          </div>
          <p className="text-center text-sm text-navy/70">Scan this QR code with your authenticator app.</p>
          <div>
            <p className="text-xs text-navy/60">Can’t scan it? Enter this key manually:</p>
            <p className="font-mono text-sm font-bold text-navy">{secretKey}</p>
          </div>
          <label className="block text-sm font-semibold text-navy">
            Verification code
            <input value={code} onChange={(event) => setCode(event.target.value)} inputMode="numeric" className={inputClass} required />
          </label>
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className="brand-gradient rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">Confirm</button>
            <button type="button" onClick={() => { setPendingSecret(null); setQrUrl(""); }} className="rounded-xl border border-navy/15 px-5 py-2.5 text-sm font-bold text-navy">Cancel</button>
          </div>
        </form>
      )}
    </section>
  );
}

function SettingsContent() {
  const { user, can } = useAuth();
  const canEdit = can("settings");
  const [draft, setDraft] = useState<SettingsDraft>(defaultDraft());
  const [recordId, setRecordId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [valuation, setValuation] = useState("weighted");
  const [deletionReason, setDeletionReason] = useState("");
  const [deletionMessage, setDeletionMessage] = useState("");

  const load = useCallback(async () => {
    if (!user) {
      return;
    }
    try {
      const token = await user.getIdToken();
      const data = await apiFetch<{ items: Row[] }>(token, "/api/data/settings");
      const company = data.items.find((item) => item.key === "company");
      if (company) {
        setRecordId(company.id);
        setDraft({
          ...defaultDraft(),
          ...(company as unknown as Partial<SettingsDraft>),
          branches: Array.isArray(company.branches)
            ? (company.branches as string[]).join(", ")
            : String(company.branches ?? "Main"),
        });
        setValuation(String(company.valuationMethod ?? "weighted"));
      }
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    }
  }, [user]);

  useEffect(() => {
    void Promise.resolve().then(() => load());
  }, [load]);

  function set<K extends keyof SettingsDraft>(key: K, value: SettingsDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) {
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const token = await user.getIdToken();
      const payload = {
        ...draft,
        key: "company",
        fiscalYearStartMonth: Number(draft.fiscalYearStartMonth),
        filingDay: Number(draft.filingDay),
        branches: draft.branches
          .split(",")
          .map((branch) => branch.trim())
          .filter(Boolean),
        valuationMethod: valuation,
      };
      if (recordId) {
        await apiFetch(token, `/api/data/settings/${recordId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        const result = await apiFetch<{ id: string }>(token, "/api/data/settings", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setRecordId(result.id);
      }
      setNotice("Company settings saved.");
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setBusy(false);
    }
  }

  async function exportData(format: "json" | "csv") {
    if (!user) {
      return;
    }
    setError("");
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/export?format=${format}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? `Export failed (${response.status}).`);
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `quikpack-tally-${new Date().toISOString().slice(0, 10)}.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (exportError) {
      setError(getErrorMessage(exportError));
    }
  }

  async function requestDeletion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) {
      return;
    }
    setDeletionMessage("");
    try {
      const token = await user.getIdToken();
      await apiFetch(token, "/api/data-deletion", {
        method: "POST",
        body: JSON.stringify({ reason: deletionReason, email: user.email ?? "" }),
      });
      setDeletionReason("");
      setDeletionMessage("Deletion request submitted for admin review.");
    } catch (deletionError) {
      setDeletionMessage(getErrorMessage(deletionError));
    }
  }

  return (
    <AppShell
      title="Company settings"
      subtitle="Legal identity, currency, fiscal calendar, branches and data export."
      actions={<SignOutButton />}
    >
      {error ? (
        <p role="alert" className="mb-5 rounded-xl bg-error/10 p-4 text-sm text-error">{error}</p>
      ) : null}
      {notice ? (
        <p role="status" className="mb-5 rounded-xl bg-brand/15 p-4 text-sm font-semibold text-brand">{notice}</p>
      ) : null}

      <SectionGuard allowed={canEdit}>
        <form onSubmit={save} className="glass-panel rounded-2xl p-6">
          <h2 className="text-lg font-bold text-navy">Company profile</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {([
              ["legalName", "Legal name"],
              ["displayName", "Display name"],
              ["registrationNumber", "Registration number"],
              ["tin", "TIN"],
              ["address", "Address"],
              ["phone", "Phone"],
              ["email", "Email"],
              ["logoUrl", "Logo URL"],
            ] as const).map(([key, label]) => (
              <label key={key} className="text-sm font-semibold text-navy">
                {label}
                <input value={draft[key]} onChange={(event) => set(key, event.target.value)} className={inputClass} />
              </label>
            ))}
            <label className="text-sm font-semibold text-navy">
              Base currency
              <select value={draft.baseCurrency} onChange={(event) => set("baseCurrency", event.target.value as Currency)} className={inputClass}>
                {CURRENCIES.map((currency) => <option key={currency}>{currency}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold text-navy">
              Display currency
              <select value={draft.displayCurrency} onChange={(event) => set("displayCurrency", event.target.value as Currency)} className={inputClass}>
                {CURRENCIES.map((currency) => <option key={currency}>{currency}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold text-navy">
              Fiscal year starts (month)
              <input type="number" min="1" max="12" value={draft.fiscalYearStartMonth} onChange={(event) => set("fiscalYearStartMonth", event.target.value)} className={inputClass} />
            </label>
            <label className="text-sm font-semibold text-navy">
              VAT filing day
              <input type="number" min="1" max="31" value={draft.filingDay} onChange={(event) => set("filingDay", event.target.value)} className={inputClass} />
            </label>
            <label className="text-sm font-semibold text-navy">
              Branches (comma separated)
              <input value={draft.branches} onChange={(event) => set("branches", event.target.value)} className={inputClass} />
            </label>
            <label className="text-sm font-semibold text-navy">
              Tax status
              <select value={draft.taxStatus} onChange={(event) => set("taxStatus", event.target.value as "registered" | "unregistered")} className={inputClass}>
                <option value="registered">Registered</option>
                <option value="unregistered">Unregistered</option>
              </select>
            </label>
            <label className="text-sm font-semibold text-navy">
              Invoice prefix
              <input value={draft.invoicePrefix} onChange={(event) => set("invoicePrefix", event.target.value)} className={inputClass} />
            </label>
            <label className="text-sm font-semibold text-navy">
              Voucher prefix
              <input value={draft.voucherPrefix} onChange={(event) => set("voucherPrefix", event.target.value)} className={inputClass} />
            </label>
            <label className="text-sm font-semibold text-navy">
              Stock valuation
              <select value={valuation} onChange={(event) => setValuation(event.target.value)} className={inputClass}>
                <option value="weighted">Weighted average</option>
                <option value="fifo">FIFO</option>
              </select>
            </label>
          </div>
          <button type="submit" disabled={busy} className="brand-gradient mt-6 rounded-xl px-6 py-2.5 text-sm font-bold text-white disabled:opacity-60">
            {busy ? "Saving…" : "Save settings"}
          </button>
        </form>
      </SectionGuard>

      <div className="mt-6 space-y-6">
        <section className="glass-panel rounded-2xl p-6">
          <h2 className="text-lg font-bold text-navy">Backup & export</h2>
          <p className="mt-1 text-sm text-navy/65">Download all company records as JSON. Manual restore is handled by support.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={() => exportData("json")} className="rounded-xl bg-navy px-5 py-2.5 text-sm font-bold text-white">Export JSON</button>
            <button type="button" onClick={() => exportData("csv")} className="rounded-xl border border-navy/15 px-5 py-2.5 text-sm font-bold text-navy">Export CSV</button>
          </div>
        </section>
        <section className="glass-panel rounded-2xl p-6">
          <h2 className="text-lg font-bold text-navy">Data deletion request</h2>
          <p className="mt-1 text-sm text-navy/65">Send a request to support; deletion is reviewed by an admin.</p>
          <form onSubmit={requestDeletion} className="mt-4">
            <label className="block text-sm font-semibold text-navy">
              Reason
              <textarea value={deletionReason} onChange={(event) => setDeletionReason(event.target.value)} rows={3} required className={inputClass} />
            </label>
            <button type="submit" className="mt-3 rounded-xl border border-error/30 px-5 py-2.5 text-sm font-bold text-error">Submit request</button>
            {deletionMessage ? <p className="mt-3 text-sm text-navy/70">{deletionMessage}</p> : null}
          </form>
        </section>
        <MfaPanel />
      </div>
    </AppShell>
  );
}

function SectionGuard({ allowed, children }: { allowed: boolean; children: ReactNode }) {
  if (!allowed) {
    return (
      <p className="glass-panel rounded-2xl p-6 text-sm text-navy/65">
        Your role does not include settings access.
      </p>
    );
  }
  return <>{children}</>;
}

export default function SettingsPage() {
  return (
    <AuthGuard>
      <FeatureGuard feature="settings">
        <SettingsContent />
      </FeatureGuard>
    </AuthGuard>
  );
}
