import { TAX } from "./constants";

export type TaxCategory = "standard" | "zeroRated" | "exempt";

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

const TOTAL_RATE = TAX.vatRate + TAX.nhilRate + TAX.getfundRate;

function assertAmount(amountMinor: number) {
  if (!Number.isInteger(amountMinor) || amountMinor < 0) {
    throw new Error("amountMinor must be a non-negative integer");
  }
}

export function calculateGhanaTax({
  amountMinor,
  taxCategory,
  priceIncludesTax = false,
}: CalculateTaxInput): TaxBreakdown {
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

  const taxableMinor = priceIncludesTax
    ? Math.round(amountMinor / (1 + TOTAL_RATE))
    : amountMinor;

  const vatMinor = Math.round(taxableMinor * TAX.vatRate);
  const nhilMinor = Math.round(taxableMinor * TAX.nhilRate);
  const getfundMinor = Math.round(taxableMinor * TAX.getfundRate);

  const expectedTaxMinor = priceIncludesTax
    ? amountMinor - taxableMinor
    : Math.round(amountMinor * TOTAL_RATE);

  const totalTaxMinor = vatMinor + nhilMinor + getfundMinor;
  const roundingAdjustment = expectedTaxMinor - totalTaxMinor;

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
