import assert from "node:assert/strict";
import test from "node:test";
import { validateLogoFile } from "./logo";

test("accepts a small raster logo", () => {
  assert.equal(
    validateLogoFile({ type: "image/png", size: 100 * 1024 }),
    null,
  );
});

test("rejects unsupported, empty and oversized logos", () => {
  assert.match(
    validateLogoFile({ type: "image/svg+xml", size: 100 }) ?? "",
    /PNG, JPEG or WebP/,
  );
  assert.match(validateLogoFile({ type: "image/png", size: 0 }) ?? "", /empty/);
  assert.match(
    validateLogoFile({ type: "image/png", size: 151 * 1024 }) ?? "",
    /150KB or smaller/,
  );
});
