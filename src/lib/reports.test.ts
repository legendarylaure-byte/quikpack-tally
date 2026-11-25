import assert from "node:assert/strict";
import test from "node:test";
import { stockMovementReport } from "./reports";

test("stock report falls back to the item reorder level", () => {
  const rows = stockMovementReport(
    [{ itemId: "i1", location: "Main", quantity: 2, unitCostMinor: 100, reorderLevel: 0 }],
    [{ itemId: "i1", location: "Main", direction: "in", quantity: 2, unitCostMinor: 100, date: "2026-11-25", reference: "GRN-1" }],
    [{ id: "i1", name: "Everpack Carton", reorderLevel: 5 }],
  );
  assert.equal(rows[0].name, "Everpack Carton");
  assert.equal(rows[0].reorderLevel, 5);
});
