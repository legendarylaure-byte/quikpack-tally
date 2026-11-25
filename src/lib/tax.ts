import { TAX } from "./constants";
import type { TaxCategory, TaxRate } from "./domain";

export type { TaxCategory, TaxRate };

export interface CalculateTaxInput {
  amountMinor: number;
  taxCategory: TaxCategory;
  priceIncludesTax?: boolean;
}

export interface TaxBreakdown {
  taxableMinor: number;
  vatMinor: number;
  nhilMinor: number;
  getfundMinor: number;
  totalTaxMinor: number;
  totalMinor: number;
}

export interface TaxRates {
  vatRate: number;
  nhilRate: number;
  getfundRate: number;
}

export const DEFAULT_TAX_RATES: TaxRates = {
  vatRate: TAX.vatRate,
  nhilRate: TAX.nhilRate,
  getfundRate: TAX.getfundRate,
};

function assertAmount(amountMinor: number) {
  if (!Number.isInteger(amountMinor) || amountMinor < 0) {
    throw new Error("amountMinor must be a non-negative integer");
  }
}

export function resolveTaxRates(rates: TaxRate[], date: string): TaxRates {
  const at = new Date(date).getTime();
  if (!Number.isFinite(at)) {
    return DEFAULT_TAX_RATES;
  }

  function pick(name: TaxRate["name"]) {
    const matches = rates
      .filter((rate) => rate.name === name)
      .filter((rate) => new Date(rate.effectiveFrom).getTime() <= at)
      .filter(
        (rate) =>
          !rate.effectiveTo || new Date(rate.effectiveTo).getTime() >= at,
      )
      .sort(
        (a, b) =>
          new Date(b.effectiveFrom).getTime() - new Date(a.effectiveFrom).getTime(),
      );
    return matches[0]?.rate;
  }

  return {
    vatRate: pick("vat") ?? DEFAULT_TAX_RATES.vatRate,
    nhilRate: pick("nhil") ?? DEFAULT_TAX_RATES.nhilRate,
    getfundRate: pick("getfund") ?? DEFAULT_TAX_RATES.getfundRate,
  };
}

export function calculateGhanaTaxWithRates(
  { amountMinor, taxCategory, priceIncludesTax = false }: CalculateTaxInput,
  rates: TaxRates = DEFAULT_TAX_RATES,
): TaxBreakdown {
  assertAmount(amountMinor);

  if (taxCategory !== "standard") {
    return {
      taxableMinor: amountMinor,
      vatMinor: 0,
      nhilMinor: 0,
      getfundMinor: 0,
      totalTaxMinor: 0,
      totalMinor: amountMinor,
    };
  }

  const totalRate = rates.vatRate + rates.nhilRate + rates.getfundRate;
  const taxableMinor = priceIncludesTax
    ? Math.round(amountMinor / (1 + totalRate))
    : amountMinor;

  const vatMinor = Math.round(taxableMinor * rates.vatRate);
  const nhilMinor = Math.round(taxableMinor * rates.nhilRate);
  const getfundMinor = Math.round(taxableMinor * rates.getfundRate);

  const expectedTaxMinor = priceIncludesTax
    ? amountMinor - taxableMinor
    : Math.round(amountMinor * totalRate);

  const totalTaxBeforeAdjustment = vatMinor + nhilMinor + getfundMinor;
  const roundingAdjustment = expectedTaxMinor - totalTaxBeforeAdjustment;

  return {
    taxableMinor,
    vatMinor: vatMinor + roundingAdjustment,
    nhilMinor,
    getfundMinor,
    totalTaxMinor: expectedTaxMinor,
    totalMinor: priceIncludesTax
      ? amountMinor
      : amountMinor + expectedTaxMinor,
  };
}

export function calculateGhanaTax(input: CalculateTaxInput): TaxBreakdown {
  return calculateGhanaTaxWithRates(input, DEFAULT_TAX_RATES);
}
