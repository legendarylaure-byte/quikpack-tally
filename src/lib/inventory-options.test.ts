import assert from "node:assert/strict";
import test from "node:test";
import { inventoryOptions } from "./inventory-options";

test("inventory options expose only item labels and reorder levels", () => {
  const result = inventoryOptions([
    { id: "i2", name: "Zoom", reorderLevel: 10, salePriceMinor: 5000 },
    { id: "i1", name: "Ama", reorderLevel: "bad" },
  ]);

  assert.deepEqual(result, {
    items: [
      { id: "i1", name: "Ama", reorderLevel: 0 },
      { id: "i2", name: "Zoom", reorderLevel: 10 },
    ],
  });
  assert.ok(!JSON.stringify(result).includes("salePriceMinor"));
});
