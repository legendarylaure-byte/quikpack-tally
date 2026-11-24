"use client";

import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { AppShell } from "@/components/app-shell";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/components/auth-provider";
import { SignOutButton } from "@/components/sign-out-button";
import { CURRENCIES } from "@/lib/constants";
import { getErrorMessage } from "@/lib/errors";
import { getDb } from "@/lib/firebase";
import { readSmallLogo } from "@/lib/logo";

const inputClass =
  "mt-1 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-sm text-navy outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";

interface CompanyForm {
  legalName: string;
  registrationNumber: string;
  tin: string;
  phone: string;
  address: string;
  baseCurrency: string;
  displayCurrency: string;
}

function OnboardingForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [companyId, setCompanyId] = useState("");
  const [loadingCompany, setLoadingCompany] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [logoDataUrl, setLogoDataUrl] = useState("");
  const [logoName, setLogoName] = useState("");
  const [form, setForm] = useState<CompanyForm>({
    legalName: "",
    registrationNumber: "",
    tin: "",
    phone: "",
    address: "",
    baseCurrency: "GHS",
    displayCurrency: "GHS",
  });

  function updateField(key: keyof CompanyForm, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  useEffect(() => {
    if (!user) {
      return;
    }

    let active = true;

    async function loadCompany() {
      try {
        const db = getDb();
        const userSnap = await getDoc(doc(db, "users", user!.uid));
        const companyIds = (userSnap.data()?.companyIds as string[] | undefined) ?? [];

        if (!companyIds.length) {
          throw new Error("No company workspace is linked to this account.");
        }

        const companySnap = await getDoc(doc(db, "companies", companyIds[0]));
        if (!companySnap.exists()) {
          throw new Error("The linked company workspace was not found.");
        }

        const data = companySnap.data();
        if (!active) {
          return;
        }

        setCompanyId(companySnap.id);
        setLogoDataUrl(String(data.logoDataUrl ?? ""));
        setForm({
          legalName: String(data.legalName ?? data.name ?? ""),
          registrationNumber: String(data.registrationNumber ?? ""),
          tin: String(data.tin ?? ""),
          phone: String(data.phone ?? ""),
          address: String(data.address ?? ""),
          baseCurrency: String(data.baseCurrency ?? "GHS"),
          displayCurrency: String(data.displayCurrency ?? "GHS"),
        });
      } catch (loadError) {
        if (active) {
          setError(getErrorMessage(loadError));
        }
      } finally {
        if (active) {
          setLoadingCompany(false);
        }
      }
    }

    loadCompany();
    return () => {
      active = false;
    };
  }, [user]);

  async function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const dataUrl = await readSmallLogo(file);
      setLogoDataUrl(dataUrl);
      setLogoName(file.name);
      setError("");
    } catch (logoError) {
      setError(getErrorMessage(logoError));
      event.target.value = "";
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!companyId) {
      setError("Company workspace is not ready yet.");
      return;
    }

    setBusy(true);

    try {
      const legalName = form.legalName.trim();
      await updateDoc(doc(getDb(), "companies", companyId), {
        ...form,
        legalName,
        name: legalName,
        logoDataUrl,
        // shortcut: stores only tiny logos in Firestore; move to Cloud Storage when Blaze is enabled
        onboardingComplete: true,
        updatedAt: serverTimestamp(),
      });
      router.push("/dashboard");
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell
      title="Company setup"
      subtitle="These details appear on your invoices and reports."
      actions={<SignOutButton />}
    >
      {loadingCompany ? (
        <p className="text-sm text-navy/65">Loading company details…</p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="glass-panel grid gap-5 rounded-2xl p-6 sm:grid-cols-2"
        >
          <label className="block text-sm font-semibold text-navy sm:col-span-2">
            Legal company name
            <input
              required
              value={form.legalName}
              onChange={(event) => updateField("legalName", event.target.value)}
              className={inputClass}
            />
          </label>

          <label className="block text-sm font-semibold text-navy">
            Registration number
            <input
              value={form.registrationNumber}
              onChange={(event) =>
                updateField("registrationNumber", event.target.value)
              }
              className={inputClass}
            />
          </label>

          <label className="block text-sm font-semibold text-navy">
            TIN
            <input
              value={form.tin}
              onChange={(event) => updateField("tin", event.target.value)}
              className={inputClass}
            />
          </label>

          <label className="block text-sm font-semibold text-navy">
            Phone
            <input
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              className={inputClass}
            />
          </label>

          <label className="block text-sm font-semibold text-navy">
            Country
            <input value="Ghana" readOnly className={inputClass} />
          </label>

          <label className="block text-sm font-semibold text-navy">
            Base currency
            <select
              value={form.baseCurrency}
              onChange={(event) => updateField("baseCurrency", event.target.value)}
              className={inputClass}
            >
              {CURRENCIES.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-semibold text-navy">
            Display currency
            <select
              value={form.displayCurrency}
              onChange={(event) =>
                updateField("displayCurrency", event.target.value)
              }
              className={inputClass}
            >
              {CURRENCIES.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-semibold text-navy sm:col-span-2">
            Address
            <textarea
              rows={3}
              value={form.address}
              onChange={(event) => updateField("address", event.target.value)}
              className={inputClass}
            />
          </label>

          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-navy">
              Company logo — optional, PNG/JPEG/WebP up to 150KB
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleLogoChange}
                className="mt-2 w-full text-sm text-navy/70 file:mr-3 file:rounded-full file:border-0 file:bg-brand/15 file:px-4 file:py-2 file:font-bold file:text-brand"
              />
            </label>
            {logoName || logoDataUrl ? (
              <p className="mt-2 text-xs font-semibold text-brand">
                {logoName || "Saved logo"} is ready.
              </p>
            ) : null}
          </div>

          {error ? (
            <p
              role="alert"
              className="rounded-lg bg-error/10 p-3 text-sm text-error sm:col-span-2"
            >
              {error}
            </p>
          ) : null}

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={busy}
              className="brand-gradient w-full rounded-xl px-5 py-3 text-sm font-bold text-white transition disabled:opacity-60 sm:w-auto"
            >
              {busy ? "Saving…" : "Save and continue"}
            </button>
          </div>
        </form>
      )}
    </AppShell>
  );
}

export default function OnboardingPage() {
  return (
    <AuthGuard>
      <OnboardingForm />
    </AuthGuard>
  );
}
