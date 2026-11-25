"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/components/auth-provider";
import { apiFetch } from "@/lib/api-client";
import { COMPANY, SUPPORT } from "@/lib/constants";
import type { Currency, Invoice } from "@/lib/domain";
import { getErrorMessage } from "@/lib/errors";
import { formatMoney } from "@/lib/money";

function InvoicePreview() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      if (!user) {
        return;
      }
      try {
        const token = await user.getIdToken();
        const data = await apiFetch<{ item: Invoice }>(token, `/api/invoices/${params.id}`);
        if (active) {
          setInvoice({ ...data.item, id: data.item.id ?? params.id });
        }
      } catch (loadError) {
        if (active) {
          setError(getErrorMessage(loadError));
        }
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [params.id, user]);

  async function download() {
    if (!user || !invoice?.id) {
      return;
    }
    const token = await user.getIdToken();
    const response = await fetch(`/api/invoices/${invoice.id}/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      setError("PDF download failed.");
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${invoice.number}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  if (error) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <p role="alert" className="rounded-xl bg-error/10 p-4 text-sm text-error">{error}</p>
        <Link href="/invoices" className="mt-4 inline-block text-sm font-bold text-brand">Back to invoices</Link>
      </main>
    );
  }
  if (!invoice) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16 text-sm text-navy/65">Loading invoice…</main>
    );
  }

  const currency = (invoice.currency ?? "GHS") as Currency;
  const brand = invoice.clientBranding;

  return (
    <main className="min-h-screen bg-surface px-4 py-8 sm:px-6">
      <div className="no-print mx-auto mb-6 flex max-w-3xl flex-wrap items-center gap-3">
        <Link href="/invoices" className="rounded-xl border border-navy/15 px-4 py-2 text-sm font-bold text-navy">← Invoices</Link>
        <button type="button" onClick={() => window.print()} className="rounded-xl bg-navy px-4 py-2 text-sm font-bold text-white">Print / Save as PDF</button>
        <button type="button" onClick={download} className="brand-gradient rounded-xl px-4 py-2 text-sm font-bold text-white">Download PDF</button>
      </div>

      <article className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-lg sm:p-12">
        <div className="flex flex-wrap items-start justify-between gap-6 border-b border-brand/30 pb-6">
          <div>
            <p className="text-lg font-black text-navy">{brand?.name ?? COMPANY.legalName}</p>
            {brand?.address ? <p className="mt-1 text-sm text-navy/65">{brand.address}</p> : null}
            {brand?.tin ? <p className="text-sm text-navy/65">TIN: {brand.tin}</p> : null}
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-black tracking-tight text-navy">INVOICE</h1>
            <p className="mt-1 text-sm font-semibold text-navy/70">{invoice.number}</p>
            <p className="text-sm text-navy/60">Date: {invoice.date}</p>
            <p className="text-sm text-navy/60">Due: {invoice.dueDate}</p>
            <p className="mt-1 text-xs font-bold uppercase text-brand">{invoice.status}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-navy/50">Bill to</p>
            <p className="mt-1 text-sm whitespace-pre-line text-navy/80">{invoice.billTo || brand?.name || "—"}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-navy/50">Ship to</p>
            <p className="mt-1 text-sm whitespace-pre-line text-navy/80">{invoice.shipTo || "—"}</p>
          </div>
        </div>

        <table className="mt-8 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-navy/15 text-xs uppercase text-navy/50">
              <th className="py-2">Description</th>
              <th className="py-2">Qty</th>
              <th className="py-2">Unit</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {(invoice.lines ?? []).map((line, index) => (
              <tr key={index} className="border-b border-navy/5">
                <td className="py-3 text-navy/80">{line.description}<span className="ml-2 text-xs text-navy/40">{line.taxCategory}</span></td>
                <td className="py-3 text-navy/70">{line.quantity}</td>
                <td className="py-3 text-navy/70">{formatMoney(line.unitPriceMinor, currency)}</td>
                <td className="py-3 text-right text-navy/80">{formatMoney(line.lineTotalMinor, currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 ml-auto max-w-xs space-y-1 text-sm">
          <div className="flex justify-between text-navy/70"><span>Subtotal</span><span>{formatMoney(invoice.subtotalMinor, currency)}</span></div>
          <div className="flex justify-between text-navy/70"><span>VAT</span><span>{formatMoney(invoice.vatMinor, currency)}</span></div>
          <div className="flex justify-between text-navy/70"><span>NHIL</span><span>{formatMoney(invoice.nhilMinor, currency)}</span></div>
          <div className="flex justify-between text-navy/70"><span>GETFund</span><span>{formatMoney(invoice.getfundMinor, currency)}</span></div>
          <div className="flex justify-between border-t border-navy/15 pt-2 text-base font-black text-navy"><span>Total</span><span>{formatMoney(invoice.totalMinor, currency)}</span></div>
          <div className="flex justify-between text-navy/60"><span>Paid</span><span>{formatMoney(invoice.amountPaidMinor, currency)}</span></div>
        </div>

        {invoice.notes ? <p className="mt-6 text-sm text-navy/65">Notes: {invoice.notes}</p> : null}

        <div className="mt-10 border-t border-brand/30 pt-4 text-xs text-navy/55">
          <p className="font-bold text-brand">Powered by quikpack</p>
          <p>{COMPANY.legalName} · Reg {COMPANY.registrationNumber} · TIN {COMPANY.tin}</p>
          <p>Support: {SUPPORT.whatsappNumber}</p>
        </div>
      </article>
    </main>
  );
}

export default function InvoicePreviewPage() {
  return (
    <AuthGuard>
      <InvoicePreview />
    </AuthGuard>
  );
}
