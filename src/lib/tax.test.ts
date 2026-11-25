import assert from "node:assert/strict";
import test from "node:test";
import { calculateGhanaTax, DEFAULT_TAX_RATES, resolveTaxRates } from "./tax";

test("tax-exclusive GHS 1,000 adds VAT, NHIL and GETFund", () => {
  assert.deepEqual(
    calculateGhanaTax({
      amountMinor: 100_000,
      taxCategory: "standard",
    }),
    {
      taxableMinor: 100_000,
      vatMinor: 15_000,
      nhilMinor: 2_500,
      getfundMinor: 2_500,
      totalTaxMinor: 20_000,
      totalMinor: 120_000,
    },
  );
});

test("tax-inclusive GHS 1,200 extracts the same components", () => {
  assert.deepEqual(
    calculateGhanaTax({
      amountMinor: 120_000,
      taxCategory: "standard",
      priceIncludesTax: true,
    }),
    {
      taxableMinor: 100_000,
      vatMinor: 15_000,
      nhilMinor: 2_500,
      getfundMinor: 2_500,
      totalTaxMinor: 20_000,
      totalMinor: 120_000,
    },
  );
});

test("zero-rated and exempt items carry no tax", () => {
  for (const taxCategory of ["zeroRated", "exempt"] as const) {
    const result = calculateGhanaTax({ amountMinor: 50_000, taxCategory });
    assert.equal(result.totalTaxMinor, 0);
    assert.equal(result.totalMinor, 50_000);
  }
});

test("rounding stays consistent for awkward amounts", () => {
  for (const priceIncludesTax of [false, true]) {
    const result = calculateGhanaTax({
      amountMinor: 10_199,
      taxCategory: "standard",
      priceIncludesTax,
    });

    assert.equal(
      result.totalTaxMinor,
      result.vatMinor + result.nhilMinor + result.getfundMinor,
    );
    assert.equal(
      result.totalMinor,
      result.taxableMinor + result.totalTaxMinor,
    );
  }
});

test("missing or unusable tax rates fall back to Ghana defaults", () => {
  assert.deepEqual(resolveTaxRates([], "2026-11-25"), DEFAULT_TAX_RATES);
  assert.deepEqual(resolveTaxRates([], "not-a-date"), DEFAULT_TAX_RATES);
});

test("invalid amounts are rejected", () => {
  assert.throws(() =>
    calculateGhanaTax({ amountMinor: -1, taxCategory: "standard" }),
  );
  assert.throws(() =>
    calculateGhanaTax({ amountMinor: 10.5, taxCategory: "standard" }),
  );
});
