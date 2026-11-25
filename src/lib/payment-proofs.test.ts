import assert from "node:assert/strict";
import test from "node:test";
import { canChangePaymentProofStatus } from "./payment-proofs";

test("payment proof status cannot be self-approved", () => {
  assert.equal(canChangePaymentProofStatus(true, "admin-1", "admin-1"), false);
  assert.equal(canChangePaymentProofStatus(true, "user-1", "admin-1"), true);
  assert.equal(canChangePaymentProofStatus(false, "user-1", "admin-1"), false);
});
