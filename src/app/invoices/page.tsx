"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { AppShell } from "@/components/app-shell";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/components/auth-provider";
import { FeatureGuard } from "@/components/feature-guard";
import { SignOutButton } from "@/components/sign-out-button";
import { apiFetch, daysFromNowIso, todayIso } from "@/lib/api-client";
import { CURRENCIES } from "@/lib/constants";
import type { Currency, TaxCategory, TaxRate } from "@/lib/domain";
import { getErrorMessage } from "@/lib/errors";
import { computeInvoice } from "@/lib/invoice";
import { formatMoney, moneyInput, parseMoney } from "@/lib/money";
import { resolveTaxRates } from "@/lib/tax";

type Row = Record<string, unknown> & { id: string };

interface LineDraft {
  itemId: string;
  description: string;
  quantity: string;
  unitPrice: string;
  taxCategory: TaxCategory;
}

function emptyDraft() {
  return {
    partyId: "",
    date: todayIso(),
    dueDate: daysFromNowIso(14),
    currency: "GHS" as Currency,
    exchangeRate: "1",
    branch: "Main",
    billTo: "",
    shipTo: "",
    notes: "",
    brandName: "",
    brandAddress: "",
    brandTin: "",
    brandEmail: "",
    brandPhone: "",
    lines: [
      {
        itemId: "",
        description: "",
        quantity: "1",
        unitPrice: "0",
        taxCategory: "standard" as TaxCategory,
      },
    ] as LineDraft[],
  };
}

const inputClass =
  "mt-1 w-full rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-sm text-navy outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

function InvoicesContent() {
  const { user, can } = useAuth();
  const canWrite = can("invoicing");
  const [invoices, setInvoices] = useState<Row[]>([]);
  const [parties, setParties] = useState<Row[]>([]);
  const [items, setItems] = useState<Row[]>([]);
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
  const [draft, setDraft] = useState<ReturnType<typeof emptyDraft> | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    if (!user) {
      return;
    }
    try {
      const token = await user.getIdToken();
      const [invoiceData, options] = await Promise.all([
        apiFetch<{ items: Row[] }>(token, "/api/invoices"),
        apiFetch<{ parties: Row[]; items: Row[]; taxRates: TaxRate[] }>(
          token,
          "/api/invoices/options",
        ),
      ]);
      setInvoices(invoiceData.items);
      setParties(options.parties);
      setItems(options.items);
      setTaxRates(options.taxRates);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    }
  }, [user]);

  useEffect(() => {
    void Promise.resolve().then(() => load());
  }, [load]);

  const preview = useMemo(() => {
    if (!draft || draft.lines.length === 0) {
      return null;
    }
    try {
      return computeInvoice(
        draft.lines.map((line) => ({
          itemId: line.itemId || undefined,
          description: line.description || "Item",
          quantity: Number(line.quantity),
          unitPriceMinor: parseMoney(line.unitPrice),
          taxCategory: line.taxCategory,
        })),
        resolveTaxRates(taxRates, draft.date),
      );
    } catch {
      return null;
    }
  }, [draft, taxRates]);

  function setLine(index: number, patch: Partial<LineDraft>) {
    setDraft((current) => {
      if (!current) {
        return current;
      }
      const lines = [...current.lines];
      lines[index] = { ...lines[index], ...patch };
      return { ...current, lines };
    });
  }

  function chooseItem(index: number, id: string) {
    const item = items.find((entry) => entry.id === id);
    setLine(index, {
      itemId: id,
      description: item ? String(item.name ?? "") : "",
      unitPrice: item ? moneyInput(Number(item.salePriceMinor ?? 0)) : "0",
      taxCategory: item
        ? ((item.taxCategory as TaxCategory) ?? "standard")
        : "standard",
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft || !user) {
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const token = await user.getIdToken();
      const result = await apiFetch<{ number: string }>(token, "/api/invoices", {
        method: "POST",
        body: JSON.stringify({
          partyId: draft.partyId,
          date: draft.date,
          dueDate: draft.dueDate,
          currency: draft.currency,
          exchangeRate: Number(draft.exchangeRate),
          branch: draft.branch,
          billTo: draft.billTo,
          shipTo: draft.shipTo,
          notes: draft.notes,
          clientBranding: draft.brandName
            ? {
                name: draft.brandName,
                address: draft.brandAddress,
                tin: draft.brandTin,
                email: draft.brandEmail,
                phone: draft.brandPhone,
              }
            : undefined,
          lines: draft.lines.map((line) => ({
            itemId: line.itemId || undefined,
            description: line.description,
            quantity: Number(line.quantity),
            unitPriceMinor: parseMoney(line.unitPrice),
            taxCategory: line.taxCategory,
          })),
        }),
      });
      setNotice(`Invoice ${result.number} created.`);
      setDraft(null);
      await load();
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setBusy(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    if (!user) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      const token = await user.getIdToken();
      await apiFetch(token, `/api/invoices/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setNotice(`Invoice marked ${status}.`);
      await load();
    } catch (updateError) {
      setError(getErrorMessage(updateError));
    } finally {
      setBusy(false);
    }
  }

  async function downloadPdf(id: string, number: string) {
    if (!user) {
      return;
    }
    setError("");
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/invoices/${id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? `PDF failed (${response.status}).`);
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${number}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (pdfError) {
      setError(getErrorMessage(pdfError));
    }
  }

  return (
    <AppShell
      title="Invoices"
      subtitle="Client-branded invoices with separate VAT, NHIL and GETFund lines."
      actions={<SignOutButton />}
    >
      {error ? (
        <p role="alert" className="mb-5 rounded-xl bg-error/10 p-4 text-sm text-error">{error}</p>
      ) : null}
      {notice ? (
        <p role="status" className="mb-5 rounded-xl bg-brand/15 p-4 text-sm font-semibold text-brand">{notice}</p>
      ) : null}

      {canWrite ? (
        <section className="glass-panel rounded-2xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-navy">New invoice</h2>
            {!draft ? (
              <button type="button" onClick={() => { setDraft(emptyDraft()); setError(""); setNotice(""); }} className="brand-gradient rounded-xl px-5 py-2.5 text-sm font-bold text-white">
                Start invoice
              </button>
            ) : null}
          </div>

          {draft ? (
            <form onSubmit={submit} className="mt-6 space-y-5">
              <div className="grid gap-4 sm:grid-cols-4">
                <label className="text-sm font-semibold text-navy">
                  Customer
                  <select value={draft.partyId} onChange={(event) => setDraft({ ...draft, partyId: event.target.value })} className={inputClass} required>
                    <option value="">Select…</option>
                    {parties.map((party) => (
                      <option key={party.id} value={party.id}>{String(party.name ?? "")}</option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-semibold text-navy">
                  Invoice date
                  <input type="date" value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} className={inputClass} required />
                </label>
                <label className="text-sm font-semibold text-navy">
                  Due date
                  <input type="date" value={draft.dueDate} onChange={(event) => setDraft({ ...draft, dueDate: event.target.value })} className={inputClass} required />
                </label>
                <label className="text-sm font-semibold text-navy">
                  Currency
                  <select value={draft.currency} onChange={(event) => setDraft({ ...draft, currency: event.target.value as Currency })} className={inputClass}>
                    {CURRENCIES.map((currency) => <option key={currency} value={currency}>{currency}</option>)}
                  </select>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-4">
                <label className="text-sm font-semibold text-navy">
                  Branch
                  <input value={draft.branch} onChange={(event) => setDraft({ ...draft, branch: event.target.value })} className={inputClass} />
                </label>
                <label className="text-sm font-semibold text-navy">
                  Exchange rate
                  <input type="number" step="0.0001" value={draft.exchangeRate} onChange={(event) => setDraft({ ...draft, exchangeRate: event.target.value })} className={inputClass} />
                </label>
                <label className="text-sm font-semibold text-navy">
                  Bill to
                  <input value={draft.billTo} onChange={(event) => setDraft({ ...draft, billTo: event.target.value })} className={inputClass} />
                </label>
                <label className="text-sm font-semibold text-navy">
                  Ship to
                  <input value={draft.shipTo} onChange={(event) => setDraft({ ...draft, shipTo: event.target.value })} className={inputClass} />
                </label>
              </div>

              <details className="rounded-xl border border-navy/10 p-4">
                <summary className="cursor-pointer text-sm font-bold text-navy">Client branding (optional)</summary>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  {([
                    ["brandName", "Client name"],
                    ["brandAddress", "Client address"],
                    ["brandTin", "Client TIN"],
                    ["brandEmail", "Client email"],
                    ["brandPhone", "Client phone"],
                  ] as const).map(([key, label]) => (
                    <label key={key} className="text-sm font-semibold text-navy">
                      {label}
                      <input value={draft[key]} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} className={inputClass} />
                    </label>
                  ))}
                </div>
                <p className="mt-3 text-xs text-navy/55">Leave blank to use the client party record. QUIKPACK is only shown as “Powered by quikpack”.</p>
              </details>

              <div>
                <div className="grid gap-3 sm:grid-cols-[1fr_90px_120px_130px_40px] text-xs font-bold uppercase text-navy/50">
                  <span>Description</span><span>Qty</span><span>Unit price</span><span>Tax</span><span />
                </div>
                {draft.lines.map((line, index) => (
                  <div key={index} className="mt-2 grid gap-3 sm:grid-cols-[1fr_90px_120px_130px_40px]">
                    <div>
                      <select value={line.itemId} onChange={(event) => chooseItem(index, event.target.value)} className={inputClass} aria-label={`Item line ${index + 1}`}>
                        <option value="">Custom item…</option>
                        {items.map((item) => <option key={item.id} value={item.id}>{String(item.name ?? "")}</option>)}
                      </select>
                      <input value={line.description} onChange={(event) => setLine(index, { description: event.target.value, itemId: "" })} className={inputClass} placeholder="Description" aria-label={`Description line ${index + 1}`} />
                    </div>
                    <input type="number" min="0.01" step="0.01" value={line.quantity} onChange={(event) => setLine(index, { quantity: event.target.value })} className={inputClass} aria-label={`Quantity line ${index + 1}`} />
                    <input type="number" min="0" step="0.01" value={line.unitPrice} onChange={(event) => setLine(index, { unitPrice: event.target.value })} className={inputClass} aria-label={`Unit price line ${index + 1}`} />
                    <select value={line.taxCategory} onChange={(event) => setLine(index, { taxCategory: event.target.value as TaxCategory })} className={inputClass} aria-label={`Tax line ${index + 1}`}>
                      <option value="standard">Standard</option>
                      <option value="zeroRated">Zero-rated</option>
                      <option value="exempt">Exempt</option>
                    </select>
                    <button type="button" onClick={() => setDraft({ ...draft, lines: draft.lines.filter((_, i) => i !== index) })} className="rounded-xl text-error" aria-label={`Remove line ${index + 1}`}>×</button>
                  </div>
                ))}
                <button type="button" onClick={() => setDraft({ ...draft, lines: [...draft.lines, { itemId: "", description: "", quantity: "1", unitPrice: "0", taxCategory: "standard" }] })} className="mt-3 text-sm font-bold text-brand hover:underline">
                  + Add line
                </button>
              </div>

              {preview ? (
                <div className="rounded-xl bg-navy/5 p-4 text-sm">
                  <p>Subtotal: {formatMoney(preview.subtotalMinor, draft.currency)}</p>
                  <p>VAT: {formatMoney(preview.vatMinor, draft.currency)} · NHIL: {formatMoney(preview.nhilMinor, draft.currency)} · GETFund: {formatMoney(preview.getfundMinor, draft.currency)}</p>
                  <p className="mt-1 font-black text-navy">Total: {formatMoney(preview.totalMinor, draft.currency)}</p>
                </div>
              ) : null}

              <label className="block text-sm font-semibold text-navy">
                Notes
                <textarea value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} rows={2} className={inputClass} />
              </label>

              <div className="flex flex-wrap justify-end gap-2">
                <button type="button" onClick={() => setDraft(null)} className="rounded-xl border border-navy/15 px-5 py-2.5 text-sm font-bold text-navy">Cancel</button>
                <button type="submit" disabled={busy || !draft.partyId || !preview} className="brand-gradient rounded-xl px-6 py-2.5 text-sm font-bold text-white disabled:opacity-60">
                  {busy ? "Creating…" : "Create invoice"}
                </button>
              </div>
            </form>
          ) : null}
        </section>
      ) : null}

      <section className="glass-panel mt-6 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-navy">Invoices</h2>
        <div className="mt-4 overflow-x-auto">
          {invoices.length === 0 ? (
            <p className="rounded-xl border border-dashed border-navy/20 p-6 text-sm text-navy/60">No invoices yet.</p>
          ) : (
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-navy/10 text-xs uppercase text-navy/50">
                  <th className="px-3 py-2">Number</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Customer</th>
                  <th className="px-3 py-2">Currency</th>
                  <th className="px-3 py-2">Total</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-navy/5 last:border-0">
                    <td className="px-3 py-3 font-bold text-navy">
                      <Link href={`/invoices/${invoice.id}`} className="hover:underline">{String(invoice.number ?? "")}</Link>
                    </td>
                    <td className="px-3 py-3 text-navy/70">{String(invoice.date ?? "")}</td>
                    <td className="px-3 py-3 text-navy/70">
                      {String(parties.find((party) => party.id === invoice.partyId)?.name ?? invoice.partyId ?? "")}
                    </td>
                    <td className="px-3 py-3 text-navy/70">{String(invoice.currency ?? "")}</td>
                    <td className="px-3 py-3 text-navy/70">{formatMoney(Number(invoice.totalMinor ?? 0), invoice.currency as Currency)}</td>
                    <td className="px-3 py-3">
                      <span className="rounded-full bg-navy/5 px-3 py-1 text-xs font-bold text-navy/60">{String(invoice.status ?? "")}</span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => downloadPdf(invoice.id, String(invoice.number))} className="text-xs font-bold text-brand hover:underline">PDF</button>
                        {canWrite && invoice.status !== "paid" && invoice.status !== "void" ? (
                          <>
                            <button type="button" onClick={() => updateStatus(invoice.id, "sent")} disabled={busy} className="text-xs font-bold text-info hover:underline">Mark sent</button>
                            <button type="button" onClick={() => updateStatus(invoice.id, "paid")} disabled={busy} className="text-xs font-bold text-brand hover:underline">Mark paid</button>
                            <button type="button" onClick={() => updateStatus(invoice.id, "void")} disabled={busy} className="text-xs font-bold text-error hover:underline">Void</button>
                          </>
                        ) : null}
                      </div>
                    </td>
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

export default function InvoicesPage() {
  return (
    <AuthGuard>
      <FeatureGuard feature="invoicing">
        <InvoicesContent />
      </FeatureGuard>
    </AuthGuard>
  );
}
