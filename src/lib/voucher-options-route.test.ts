import assert from "node:assert/strict";
import test from "node:test";
import { GET } from "../app/api/vouchers/options/route";

test("voucher options reject requests without a member token", async () => {
  const response = await GET(new Request("http://localhost/api/vouchers/options"));
  assert.equal(response.status, 401);
});
