"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { AppShell } from "@/components/app-shell";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/components/auth-provider";
import { FeatureGuard } from "@/components/feature-guard";
import { SignOutButton } from "@/components/sign-out-button";
import { apiFetch, todayIso } from "@/lib/api-client";
import { CURRENCIES } from "@/lib/constants";
import type { Currency, VoucherType } from "@/lib/domain";
import { getErrorMessage } from "@/lib/errors";
import { formatMoney, moneyInput, parseMoney } from "@/lib/money";

const TYPES: VoucherType[] = [
  "payment",
  "receipt",
  "contra",
  "journal",
  "sales",
  "purchase",
  "expense",
  "creditNote",
  "debitNote",
];

interface LineDraft {
  accountId: string;
  debit: string;
  credit: string;
  description: string;
}

interface Draft {
  type: VoucherType;
  date: string;
  partyId: string;
  branch: string;
  narration: string;
  currency: Currency;
  exchangeRate: string;
  lines: LineDraft[];
  vat: string;
  nhil: string;
  getfund: string;
  attachmentUrl: string;
}

function emptyDraft(): Draft {
  return {
    type: "journal",
    date: todayIso(),
    partyId: "",
    branch: "Main",
    narration: "",
    currency: "GHS",
    exchangeRate: "1",
    lines: [
      { accountId: "", debit: "", credit: "", description: "" },
      { accountId: "", debit: "", credit: "", description: "" },
    ],
    vat: "0",
    nhil: "0",
    getfund: "0",
    attachmentUrl: "",
  };
}

const inputClass =
  "mt-1 w-full rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-sm text-navy outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

function VouchersContent() {
  const { user, can } = useAuth();
  const canWrite = can("vouchers");
  const [vouchers, setVouchers] = useState<Array<Record<string, unknown> & { id: string }>>([]);
  const [accounts, setAccounts] = useState<Array<Record<string, unknown> & { id: string }>>([]);
  const [parties, setParties] = useState<Array<Record<string, unknown> & { id: string }>>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    if (!user) {
      return;
    }
    try {
      const token = await user.getIdToken();
      const [voucherData, accountData, partyData] = await Promise.all([
        apiFetch<{ items: Array<Record<string, unknown> & { id: string }> }>(token, "/api/vouchers"),
        apiFetch<{ items: Array<Record<string, unknown> & { id: string }> }>(token, "/api/data/accounts"),
        apiFetch<{ items: Array<Record<string, unknown> & { id: string }> }>(token, "/api/data/parties"),
      ]);
      setVouchers(voucherData.items);
      setAccounts(accountData.items);
      setParties(partyData.items);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    }
  }, [user]);

  useEffect(() => {
    void Promise.resolve().then(() => load());
  }, [load]);

  const totals = useMemo(() => {
    if (!draft) {
      return { debit: 0, credit: 0 };
    }
    let debit = 0;
    let credit = 0;
    for (const line of draft.lines) {
      debit += Number(line.debit ? parseMoney(line.debit) : 0);
      credit += Number(line.credit ? parseMoney(line.credit) : 0);
    }
    return { debit, credit };
  }, [draft]);

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
      const result = await apiFetch<{ number: string }>(token, "/api/vouchers", {
        method: "POST",
        body: JSON.stringify({
          type: draft.type,
          date: draft.date,
          partyId: draft.partyId,
          branch: draft.branch,
          narration: draft.narration,
          currency: draft.currency,
          exchangeRate: Number(draft.exchangeRate),
          attachmentUrl: draft.attachmentUrl,
          vatMinor: parseMoney(draft.vat),
          nhilMinor: parseMoney(draft.nhil),
          getfundMinor: parseMoney(draft.getfund),
          lines: draft.lines.map((line) => ({
            accountId: line.accountId,
            debitMinor: line.debit ? parseMoney(line.debit) : 0,
            creditMinor: line.credit ? parseMoney(line.credit) : 0,
            description: line.description,
          })),
        }),
      });
      setNotice(`Voucher ${result.number} posted.`);
      setDraft(null);
      await load();
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setBusy(false);
    }
  }

  async function reverse(id: string) {
    if (!user || !window.confirm("Create a reversal for this voucher?")) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      const token = await user.getIdToken();
      await apiFetch(token, `/api/vouchers/${id}/reverse`, { method: "POST" });
      setNotice("Reversal voucher created.");
      await load();
    } catch (reverseError) {
      setError(getErrorMessage(reverseError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell
      title="Vouchers"
      subtitle="Post transactions with balanced debits and credits. Posted records are immutable."
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
            <h2 className="text-lg font-bold text-navy">New voucher</h2>
            {!draft ? (
              <button
                type="button"
                onClick={() => {
                  setDraft(emptyDraft());
                  setError("");
                  setNotice("");
                }}
                className="brand-gradient rounded-xl px-5 py-2.5 text-sm font-bold text-white"
              >
                Start voucher
              </button>
            ) : null}
          </div>

          {draft ? (
            <form onSubmit={submit} className="mt-6 space-y-5">
              <div className="grid gap-4 sm:grid-cols-5">
                <label className="text-sm font-semibold text-navy">
                  Type
                  <select
                    value={draft.type}
                    onChange={(event) =>
                      setDraft({ ...draft, type: event.target.value as VoucherType })
                    }
                    className={inputClass}
                  >
                    {TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-semibold text-navy">
                  Date
                  <input type="date" value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} className={inputClass} required />
                </label>
                <label className="text-sm font-semibold text-navy">
                  Party
                  <select value={draft.partyId} onChange={(event) => setDraft({ ...draft, partyId: event.target.value })} className={inputClass}>
                    <option value="">None</option>
                    {parties.map((party) => (
                      <option key={party.id} value={party.id}>{String(party.name ?? party.id)}</option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-semibold text-navy">
                  Branch
                  <input value={draft.branch} onChange={(event) => setDraft({ ...draft, branch: event.target.value })} className={inputClass} />
                </label>
                <label className="text-sm font-semibold text-navy">
                  Currency
                  <select value={draft.currency} onChange={(event) => setDraft({ ...draft, currency: event.target.value as Currency })} className={inputClass}>
                    {CURRENCIES.map((currency) => (
                      <option key={currency} value={currency}>{currency}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="text-sm font-semibold text-navy">
                  Exchange rate
                  <input type="number" step="0.0001" value={draft.exchangeRate} onChange={(event) => setDraft({ ...draft, exchangeRate: event.target.value })} className={inputClass} />
                </label>
                <label className="text-sm font-semibold text-navy">
                  VAT (GHS)
                  <input type="number" step="0.01" value={draft.vat} onChange={(event) => setDraft({ ...draft, vat: event.target.value })} className={inputClass} />
                </label>
                <label className="text-sm font-semibold text-navy">
                  NHIL / GETFund (GHS)
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    <input aria-label="NHIL" type="number" step="0.01" value={draft.nhil} onChange={(event) => setDraft({ ...draft, nhil: event.target.value })} className={inputClass} />
                    <input aria-label="GETFund" type="number" step="0.01" value={draft.getfund} onChange={(event) => setDraft({ ...draft, getfund: event.target.value })} className={inputClass} />
                  </div>
                </label>
              </div>

              <label className="block text-sm font-semibold text-navy">
                Narration
                <input value={draft.narration} onChange={(event) => setDraft({ ...draft, narration: event.target.value })} className={inputClass} />
              </label>
              <label className="block text-sm font-semibold text-navy">
                Attachment link (optional)
                <input type="url" value={draft.attachmentUrl} onChange={(event) => setDraft({ ...draft, attachmentUrl: event.target.value })} className={inputClass} />
              </label>

              <div>
                <div className="grid gap-3 sm:grid-cols-[1fr_120px_120px_1fr_40px] sm:px-1 text-xs font-bold uppercase text-navy/50">
                  <span>Account</span><span>Debit</span><span>Credit</span><span>Description</span><span />
                </div>
                {draft.lines.map((line, index) => (
                  <div key={index} className="mt-2 grid gap-3 sm:grid-cols-[1fr_120px_120px_1fr_40px]">
                    <select value={line.accountId} onChange={(event) => setLine(index, { accountId: event.target.value })} className={inputClass} required aria-label={`Account line ${index + 1}`}>
                      <option value="">Select…</option>
                      {accounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {String(account.code ?? "")} {String(account.name ?? "")}
                        </option>
                      ))}
                    </select>
                    <input type="number" step="0.01" value={line.debit} onChange={(event) => setLine(index, { debit: event.target.value, credit: "" })} className={inputClass} aria-label={`Debit line ${index + 1}`} />
                    <input type="number" step="0.01" value={line.credit} onChange={(event) => setLine(index, { credit: event.target.value, debit: "" })} className={inputClass} aria-label={`Credit line ${index + 1}`} />
                    <input value={line.description} onChange={(event) => setLine(index, { description: event.target.value })} className={inputClass} aria-label={`Description line ${index + 1}`} />
                    <button type="button" onClick={() => setDraft({ ...draft, lines: draft.lines.filter((_, i) => i !== index) })} className="rounded-xl px-2 text-error" aria-label={`Remove line ${index + 1}`}>×</button>
                  </div>
                ))}
                <button type="button" onClick={() => setDraft({ ...draft, lines: [...draft.lines, { accountId: "", debit: "", credit: "", description: "" }] })} className="mt-3 text-sm font-bold text-brand hover:underline">
                  + Add line
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-navy/5 p-4">
                <p className={`text-sm font-bold ${totals.debit === totals.credit && totals.debit > 0 ? "text-brand" : "text-error"}`}>
                  Debit {moneyInput(totals.debit)} · Credit {moneyInput(totals.credit)}
                </p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setDraft(null)} className="rounded-xl border border-navy/15 px-5 py-2.5 text-sm font-bold text-navy">Cancel</button>
                  <button type="submit" disabled={busy || totals.debit !== totals.credit || totals.debit === 0} className="brand-gradient rounded-xl px-6 py-2.5 text-sm font-bold text-white disabled:opacity-60">
                    {busy ? "Posting…" : "Post voucher"}
                  </button>
                </div>
              </div>
            </form>
          ) : null}
        </section>
      ) : null}

      <section className="glass-panel mt-6 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-navy">Posted vouchers</h2>
        <div className="mt-4 overflow-x-auto">
          {vouchers.length === 0 ? (
            <p className="rounded-xl border border-dashed border-navy/20 p-6 text-sm text-navy/60">No vouchers yet.</p>
          ) : (
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b border-navy/10 text-xs uppercase text-navy/50">
                  <th className="px-3 py-2">Number</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Narration</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vouchers.map((voucher) => (
                  <tr key={voucher.id} className="border-b border-navy/5 last:border-0">
                    <td className="px-3 py-3 font-bold text-navy">{String(voucher.number ?? "")}</td>
                    <td className="px-3 py-3 text-navy/70">{String(voucher.date ?? "")}</td>
                    <td className="px-3 py-3 text-navy/70">{String(voucher.type ?? "")}</td>
                    <td className="px-3 py-3 text-navy/70">{String(voucher.narration ?? "")}</td>
                    <td className="px-3 py-3 text-navy/70">{formatMoney(Number(voucher.totalDebitMinor ?? 0))}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${voucher.status === "reversed" ? "bg-error/10 text-error" : "bg-brand/15 text-brand"}`}>
                        {String(voucher.status ?? "")}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      {canWrite && voucher.status !== "reversed" ? (
                        <button type="button" onClick={() => reverse(voucher.id)} disabled={busy} className="text-xs font-bold text-brand hover:underline disabled:opacity-60">Reverse</button>
                      ) : (
                        <span className="text-xs text-navy/40">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <p className="mt-4 text-xs text-navy/50">Account names: {accounts.map((account) => String(account.name ?? "")).slice(0, 6).join(", ") || "none"}</p>
      </section>
    </AppShell>
  );
}

export default function VouchersPage() {
  return (
    <AuthGuard>
      <FeatureGuard feature="vouchers">
        <VouchersContent />
      </FeatureGuard>
    </AuthGuard>
  );
}
