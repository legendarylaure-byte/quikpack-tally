import assert from "node:assert/strict";
import test from "node:test";
import { GET as getInventoryOptions } from "../app/api/inventory/options/route";
import { GET as getInvoiceOptions } from "../app/api/invoices/options/route";

test("inventory options reject requests without a member token", async () => {
  const response = await getInventoryOptions(new Request("http://localhost/api/inventory/options"));
  assert.equal(response.status, 401);
});

test("invoice options reject requests without a member token", async () => {
  const response = await getInvoiceOptions(new Request("http://localhost/api/invoices/options"));
  assert.equal(response.status, 401);
});
