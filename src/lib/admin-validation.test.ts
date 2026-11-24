import assert from "node:assert/strict";
import test from "node:test";
import {
  isValidEmail,
  normalizeEmail,
  validateMembershipUpdate,
  validateNewUser,
} from "./admin-validation";
import { defaultPermissions, isRole } from "./permissions";

function errorMessage(result: { error?: string }) {
  return result.error ?? "";
}

test("normalizes and validates emails", () => {
  assert.equal(normalizeEmail("  User@Example.COM "), "user@example.com");
  assert.equal(isValidEmail("user@example.com"), true);
  assert.equal(isValidEmail("not-an-email"), false);
});

test("rejects invalid new-user input", () => {
  assert.match(
    errorMessage(validateNewUser({ email: "bad", fullName: "Test User", role: "admin" })),
    /valid email/,
  );
  assert.match(
    errorMessage(validateNewUser({ email: "a@b.com", fullName: "", role: "admin" })),
    /Full name/,
  );
  assert.match(
    errorMessage(validateNewUser({ email: "a@b.com", fullName: "Test User", role: "hacker" })),
    /valid role/,
  );
});

test("applies role defaults and explicit permission overrides", () => {
  const result = validateNewUser({
    email: "a@b.com",
    fullName: "Test User",
    role: "cashier",
    permissions: { invoicing: false },
  });
  if (!("value" in result) || !result.value) {
    assert.fail("expected valid input");
  }
  assert.equal(result.value.permissions.masters, false);
  assert.equal(result.value.permissions.invoicing, false);
  assert.equal(result.value.permissions.dashboard, true);
});

test("validates membership updates and roles", () => {
  assert.equal(isRole("accountant"), true);
  assert.equal(isRole("owner"), false);
  const result = validateMembershipUpdate({ status: "suspended", currentRole: "admin" });
  if (!("value" in result) || !result.value) {
    assert.fail("expected valid update");
  }
  assert.equal(result.value.status, "suspended");
  assert.deepEqual(defaultPermissions("auditor").vouchers, false);
});
