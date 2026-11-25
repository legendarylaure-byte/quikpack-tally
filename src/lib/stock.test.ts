import assert from "node:assert/strict";
import test from "node:test";
import { valueStock } from "./stock";

test("same-date movements use creation order for FIFO valuation", () => {
  const result = valueStock(
    [
      { itemId: "i1", location: "main", direction: "in", quantity: 10, unitCostMinor: 100, date: "2026-11-25", reference: "first", id: "m2", createdAt: "2026-11-25T09:00:00.000Z" },
      { itemId: "i1", location: "main", direction: "in", quantity: 10, unitCostMinor: 300, date: "2026-11-25", reference: "second", id: "m1", createdAt: "2026-11-25T10:00:00.000Z" },
      { itemId: "i1", location: "main", direction: "out", quantity: 5, unitCostMinor: 0, date: "2026-11-25", reference: "sale", id: "m3", createdAt: "2026-11-25T11:00:00.000Z" },
    ],
    "fifo",
  );
  assert.equal(result.valueMinor, 3_500);
  assert.equal(result.costOfGoodsSoldMinor, 500);
});
