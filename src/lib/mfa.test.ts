import assert from "node:assert/strict";
import test from "node:test";
import { totpHint } from "./mfa";

test("selects the TOTP factor from multi-factor hints", () => {
  assert.equal(
    totpHint([
      { factorId: "phone", uid: "phone-1" },
      { factorId: "totp", uid: "totp-1" },
    ])?.uid,
    "totp-1",
  );
  assert.equal(totpHint([{ factorId: "phone", uid: "phone-1" }]), undefined);
});
