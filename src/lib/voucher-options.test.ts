import assert from "node:assert/strict";
import test from "node:test";
import { voucherOptions } from "./voucher-options";

test("voucher options expose only labels in stable order", () => {
  const result = voucherOptions(
    [
      { id: "a2", code: "2000", name: "Sales", openingBalanceMinor: 12345 },
      { id: "a1", code: "1000", name: "Cash", openingBalanceMinor: 999 },
    ],
    [
      { id: "p2", name: "Ama" },
      { id: "p1", name: "Kofi", phone: "0240000000" },
    ],
  );

  assert.deepEqual(result, {
    accounts: [
      { id: "a1", code: "1000", name: "Cash" },
      { id: "a2", code: "2000", name: "Sales" },
    ],
    parties: [
      { id: "p2", name: "Ama" },
      { id: "p1", name: "Kofi" },
    ],
  });
  assert.ok(!JSON.stringify(result).includes("openingBalanceMinor"));
  assert.ok(!JSON.stringify(result).includes("0240000000"));
});
