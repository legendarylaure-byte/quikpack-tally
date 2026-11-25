"use client";

import { useState, type FormEvent } from "react";
import { AppShell } from "@/components/app-shell";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/components/auth-provider";
import { ResourceManager } from "@/components/resource-manager";
import { SignOutButton } from "@/components/sign-out-button";
import { apiFetch } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/errors";
import { formatMoney } from "@/lib/money";

const PLANS = [
  { name: "Demo / Sandbox", monthly: 0, yearly: 0, note: "Evaluation only" },
  { name: "Starter", monthly: 18_000, yearly: 180_000, note: "GH₵180 / month" },
  { name: "Business", monthly: 59_000, yearly: 590_000, note: "GH₵590 / month" },
  { name: "Franchise / White-label", monthly: 180_000, yearly: 1_800_000, note: "GH₵1,800 / month" },
  { name: "Enterprise / Custom", monthly: 500_000, yearly: 0, note: "From GH₵5,000 / month" },
];

const inputClass =
  "mt-1 w-full rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-sm text-navy outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

function PaymentProofForm({ onDone }: { onDone: () => void }) {
  const { user } = useAuth();
  const [plan, setPlan] = useState("Starter");
  const [cycle, setCycle] = useState("monthly");
  const [amount, setAmount] = useState("180.00");
  const [method, setMethod] = useState("bankTransfer");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) {
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const token = await user.getIdToken();
      await apiFetch(token, "/api/subscription/payment-proof", {
        method: "POST",
        body: JSON.stringify({
          plan,
          cycle,
          amount,
          method,
          reference,
          note,
          email: user.email ?? "",
        }),
      });
      setMessage("Payment proof submitted for admin review.");
      setReference("");
      setNote("");
      onDone();
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="glass-panel rounded-2xl p-6">
      <h2 className="text-lg font-bold text-navy">Submit a payment proof</h2>
      <p className="mt-1 text-sm text-navy/65">
        Paystack and Flutterwave need provider accounts. Bank transfer and mobile money references
        are reviewed manually by an admin.
      </p>
      <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-navy">
          Plan
          <select value={plan} onChange={(event) => setPlan(event.target.value)} className={inputClass}>
            {PLANS.map((item) => <option key={item.name}>{item.name}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold text-navy">
          Cycle
          <select value={cycle} onChange={(event) => setCycle(event.target.value)} className={inputClass}>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </label>
        <label className="text-sm font-semibold text-navy">
          Amount (GHS)
          <input type="number" min="0" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} className={inputClass} required />
        </label>
        <label className="text-sm font-semibold text-navy">
          Method
          <select value={method} onChange={(event) => setMethod(event.target.value)} className={inputClass}>
            <option value="bankTransfer">Bank transfer</option>
            <option value="mobileMoney">Mobile money</option>
            <option value="card">Card</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label className="text-sm font-semibold text-navy sm:col-span-2">
          Payment reference
          <input value={reference} onChange={(event) => setReference(event.target.value)} className={inputClass} required />
        </label>
        <label className="text-sm font-semibold text-navy sm:col-span-2">
          Note
          <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={2} className={inputClass} />
        </label>
        <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
          <button type="submit" disabled={busy} className="brand-gradient rounded-xl px-6 py-2.5 text-sm font-bold text-white disabled:opacity-60">
            {busy ? "Submitting…" : "Submit proof"}
          </button>
          {message ? <p className="text-sm text-navy/70">{message}</p> : null}
        </div>
      </form>
    </section>
  );
}

function SubscriptionContent() {
  const { can } = useAuth();
  const [refresh, setRefresh] = useState(0);
  const canManage = can("settings");

  return (
    <AppShell
      title="Plan & payments"
      subtitle="QUIKPACK subscription plans and manual payment approval."
      actions={<SignOutButton />}
    >
      <section className="glass-panel rounded-2xl p-6">
        <h2 className="text-lg font-bold text-navy">Subscription plans</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <article key={plan.name} className="rounded-2xl border border-navy/10 bg-white p-5">
              <h3 className="font-bold text-navy">{plan.name}</h3>
              <p className="mt-2 text-xl font-black text-brand">{formatMoney(plan.monthly)}<span className="text-xs font-semibold text-navy/50"> / month</span></p>
              {plan.yearly > 0 ? (
                <p className="mt-1 text-xs text-navy/60">{formatMoney(plan.yearly)} / year</p>
              ) : null}
              <p className="mt-2 text-xs text-navy/50">{plan.note}</p>
            </article>
          ))}
        </div>
        <p className="mt-4 text-xs text-navy/55">
          Onboarding fees: GH₵300 / GH₵800 / GH₵2,000. First 10 annual clients may have onboarding waived.
        </p>
      </section>

      <div className="mt-6">
        <PaymentProofForm onDone={() => setRefresh((value) => value + 1)} />
      </div>

      {canManage ? (
        <div className="mt-6">
          <ResourceManager
            key={refresh}
            collection="paymentRequests"
            title="Payment proofs"
            description="Approve or reject submitted references."
            fields={[
              { key: "plan", label: "Plan", type: "text", required: true },
              { key: "amountMinor", label: "Amount", type: "money", required: true },
              { key: "method", label: "Method", type: "text" },
              { key: "reference", label: "Reference", type: "text" },
              {
                key: "status",
                label: "Status",
                type: "select",
                options: [
                  { value: "pending", label: "Pending" },
                  { value: "approved", label: "Approved" },
                  { value: "rejected", label: "Rejected" },
                ],
              },
              { key: "note", label: "Note", type: "textarea" },
            ]}
            columns={[
              { key: "plan", label: "Plan" },
              { key: "amountMinor", label: "Amount", format: (value) => formatMoney(Number(value ?? 0)) },
              { key: "method", label: "Method" },
              { key: "reference", label: "Reference" },
              { key: "status", label: "Status" },
            ]}
            defaults={{ status: "pending", method: "bankTransfer" }}
            canWrite
          />
        </div>
      ) : null}
    </AppShell>
  );
}

export default function SubscriptionPage() {
  return (
    <AuthGuard>
      <SubscriptionContent />
    </AuthGuard>
  );
}
