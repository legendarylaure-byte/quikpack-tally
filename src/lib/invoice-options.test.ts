import assert from "node:assert/strict";
import test from "node:test";
import { invoiceOptions } from "./invoice-options";

test("invoice options expose only form inputs in stable order", () => {
  const result = invoiceOptions(
    [
      { id: "p2", name: "Ama", phone: "0240000000" },
      { id: "p1", name: "Kofi" },
    ],
    [
      { id: "i2", name: "Zoom", salePriceMinor: 5000, taxCategory: "standard", purchasePriceMinor: 100 },
      { id: "i1", name: "Ama", salePriceMinor: "bad" },
    ],
    [
      { id: "t2", name: "vat", rate: 0.125, effectiveFrom: "2026-01-01", createdBy: "x" },
      { id: "t1", name: "vat", rate: 0.15, effectiveFrom: "2025-01-01", note: "old" },
    ],
  );

  assert.deepEqual(result.parties, [
    { id: "p2", name: "Ama" },
    { id: "p1", name: "Kofi" },
  ]);
  assert.deepEqual(result.items, [
    { id: "i1", name: "Ama", salePriceMinor: 0, taxCategory: "standard" },
    { id: "i2", name: "Zoom", salePriceMinor: 5000, taxCategory: "standard" },
  ]);
  assert.deepEqual(result.taxRates, [
    { name: "vat", rate: 0.15, effectiveFrom: "2025-01-01", note: "old" },
    { name: "vat", rate: 0.125, effectiveFrom: "2026-01-01" },
  ]);
  assert.ok(!JSON.stringify(result).includes("phone"));
  assert.ok(!JSON.stringify(result).includes("purchasePriceMinor"));
  assert.ok(!JSON.stringify(result).includes("createdBy"));
});
