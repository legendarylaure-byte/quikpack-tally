"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { AppShell } from "@/components/app-shell";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/components/auth-provider";
import { FeatureGuard } from "@/components/feature-guard";
import { SignOutButton } from "@/components/sign-out-button";
import { apiFetch, todayIso } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/errors";
import { formatMoney, moneyInput, parseMoney } from "@/lib/money";

type Row = Record<string, unknown> & { id: string };

const inputClass =
  "mt-1 w-full rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-sm text-navy outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

function InventoryContent() {
  const { user, can } = useAuth();
  const canWrite = can("inventory");
  const [stock, setStock] = useState<Row[]>([]);
  const [movements, setMovements] = useState<Row[]>([]);
  const [items, setItems] = useState<Row[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [itemId, setItemId] = useState("");
  const [location, setLocation] = useState("Main");
  const [direction, setDirection] = useState<"in" | "out">("in");
  const [quantity, setQuantity] = useState("");
  const [unitCost, setUnitCost] = useState("0");
  const [date, setDate] = useState(todayIso());
  const [reference, setReference] = useState("");
  const [branch, setBranch] = useState("Main");
  const [batch, setBatch] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    if (!user) {
      return;
    }
    try {
      const token = await user.getIdToken();
      const [stockData, movementData, itemData] = await Promise.all([
        apiFetch<{ items: Row[] }>(token, "/api/data/stock"),
        apiFetch<{ items: Row[] }>(token, "/api/stock/movements"),
        apiFetch<{ items: Row[] }>(token, "/api/data/items"),
      ]);
      setStock(stockData.items);
      setMovements(movementData.items);
      setItems(itemData.items);
      if (!itemId && itemData.items[0]) {
        setItemId(String(itemData.items[0].id));
      }
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    }
  }, [user, itemId]);

  useEffect(() => {
    void Promise.resolve().then(() => load());
  }, [load]);

  const itemName = (id: unknown) =>
    String(items.find((item) => item.id === id)?.name ?? id ?? "—");

  const reorderFor = (row: Row) =>
    Number(row.reorderLevel ?? 0) ||
    Number(items.find((item) => item.id === row.itemId)?.reorderLevel ?? 0);
  const lowStock = stock.filter(
    (row) => Number(row.quantity ?? 0) <= reorderFor(row),
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) {
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const token = await user.getIdToken();
      await apiFetch(token, "/api/stock/movements", {
        method: "POST",
        body: JSON.stringify({
          itemId,
          location,
          direction,
          quantity: Number(quantity),
          unitCostMinor: parseMoney(unitCost),
          date,
          reference: reference || (direction === "in" ? "Stock received" : "Stock issued"),
          branch,
          batch,
          expiryDate,
        }),
      });
      setNotice("Stock movement recorded.");
      setQuantity("");
      setReference("");
      setFormOpen(false);
      await load();
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell
      title="Inventory"
      subtitle="Stock by item and location, with an append-only movement ledger."
      actions={<SignOutButton />}
    >
      {error ? (
        <p role="alert" className="mb-5 rounded-xl bg-error/10 p-4 text-sm text-error">{error}</p>
      ) : null}
      {notice ? (
        <p role="status" className="mb-5 rounded-xl bg-brand/15 p-4 text-sm font-semibold text-brand">{notice}</p>
      ) : null}

      <div className="mb-6 flex flex-wrap items-center gap-3">
        {canWrite ? (
          <button type="button" onClick={() => setFormOpen(!formOpen)} className="brand-gradient rounded-xl px-5 py-2.5 text-sm font-bold text-white">
            {formOpen ? "Close form" : "Record stock movement"}
          </button>
        ) : null}
        <span className={`rounded-full px-4 py-2 text-xs font-bold ${lowStock.length > 0 ? "bg-error/10 text-error" : "bg-brand/15 text-brand"}`}>
          {lowStock.length === 0 ? "No low-stock alerts" : `${lowStock.length} item${lowStock.length === 1 ? "" : "s"} at or below reorder level`}
        </span>
      </div>

      {formOpen ? (
        <section className="glass-panel rounded-2xl p-6">
          <h2 className="text-lg font-bold text-navy">New stock movement</h2>
          <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-3">
            <label className="text-sm font-semibold text-navy">
              Item
              <select value={itemId} onChange={(event) => setItemId(event.target.value)} className={inputClass} required>
                <option value="">Select…</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>{String(item.name ?? "")}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-navy">
              Location
              <input value={location} onChange={(event) => setLocation(event.target.value)} className={inputClass} required />
            </label>
            <label className="text-sm font-semibold text-navy">
              Direction
              <select value={direction} onChange={(event) => setDirection(event.target.value as "in" | "out")} className={inputClass}>
                <option value="in">Stock in</option>
                <option value="out">Stock out</option>
              </select>
            </label>
            <label className="text-sm font-semibold text-navy">
              Quantity
              <input type="number" min="1" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} className={inputClass} required />
            </label>
            <label className="text-sm font-semibold text-navy">
              Unit cost (GHS)
              <input type="number" min="0" step="0.01" value={unitCost} onChange={(event) => setUnitCost(event.target.value)} className={inputClass} />
            </label>
            <label className="text-sm font-semibold text-navy">
              Date
              <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className={inputClass} required />
            </label>
            <label className="text-sm font-semibold text-navy sm:col-span-2">
              Reference
              <input value={reference} onChange={(event) => setReference(event.target.value)} className={inputClass} placeholder="e.g. GRN-104 / adjustment" />
            </label>
            <label className="text-sm font-semibold text-navy">
              Branch
              <input value={branch} onChange={(event) => setBranch(event.target.value)} className={inputClass} />
            </label>
            <label className="text-sm font-semibold text-navy">
              Batch
              <input value={batch} onChange={(event) => setBatch(event.target.value)} className={inputClass} />
            </label>
            <label className="text-sm font-semibold text-navy">
              Expiry date (optional)
              <input type="date" value={expiryDate} onChange={(event) => setExpiryDate(event.target.value)} className={inputClass} />
            </label>
            <div className="flex items-end">
              <button type="submit" disabled={busy || !itemId} className="brand-gradient w-full rounded-xl px-6 py-2.5 text-sm font-bold text-white disabled:opacity-60">
                {busy ? "Saving…" : "Record movement"}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="glass-panel mt-6 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-navy">Stock on hand</h2>
        <div className="mt-4 overflow-x-auto">
          {stock.length === 0 ? (
            <p className="rounded-xl border border-dashed border-navy/20 p-6 text-sm text-navy/60">No stock recorded yet. Add a stock-in movement to begin.</p>
          ) : (
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-navy/10 text-xs uppercase text-navy/50">
                  <th className="px-3 py-2">Item</th>
                  <th className="px-3 py-2">Location</th>
                  <th className="px-3 py-2">Quantity</th>
                  <th className="px-3 py-2">Reorder at</th>
                  <th className="px-3 py-2">Unit cost</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {stock.map((row) => {
                  const isLow = Number(row.quantity ?? 0) <= reorderFor(row);
                  return (
                    <tr key={row.id} className="border-b border-navy/5 last:border-0">
                      <td className="px-3 py-3 font-semibold text-navy">{itemName(row.itemId)}</td>
                      <td className="px-3 py-3 text-navy/70">{String(row.location ?? "")}</td>
                      <td className="px-3 py-3 text-navy/70">{Number(row.quantity ?? 0)}</td>
                      <td className="px-3 py-3 text-navy/70">{reorderFor(row)}</td>
                      <td className="px-3 py-3 text-navy/70">{formatMoney(Number(row.unitCostMinor ?? 0))}</td>
                      <td className="px-3 py-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${isLow ? "bg-error/10 text-error" : "bg-brand/15 text-brand"}`}>
                          {isLow ? "Low stock" : "OK"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section className="glass-panel mt-6 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-navy">Movement ledger</h2>
        <div className="mt-4 overflow-x-auto">
          {movements.length === 0 ? (
            <p className="text-sm text-navy/60">No movements yet.</p>
          ) : (
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-navy/10 text-xs uppercase text-navy/50">
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Item</th>
                  <th className="px-3 py-2">Direction</th>
                  <th className="px-3 py-2">Qty</th>
                  <th className="px-3 py-2">Unit cost</th>
                  <th className="px-3 py-2">Reference</th>
                </tr>
              </thead>
              <tbody>
                {movements.slice(0, 100).map((row) => (
                  <tr key={row.id} className="border-b border-navy/5 last:border-0">
                    <td className="px-3 py-3 text-navy/70">{String(row.date ?? "")}</td>
                    <td className="px-3 py-3 text-navy/70">{itemName(row.itemId)} · {String(row.location ?? "")}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${row.direction === "in" ? "bg-brand/15 text-brand" : "bg-info/10 text-info"}`}>
                        {String(row.direction ?? "")}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-navy/70">{Number(row.quantity ?? 0)}</td>
                    <td className="px-3 py-3 text-navy/70">{moneyInput(Number(row.unitCostMinor ?? 0))}</td>
                    <td className="px-3 py-3 text-navy/70">{String(row.reference ?? "")}</td>
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

export default function InventoryPage() {
  return (
    <AuthGuard>
      <FeatureGuard feature="inventory">
        <InventoryContent />
      </FeatureGuard>
    </AuthGuard>
  );
}
