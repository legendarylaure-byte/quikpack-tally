import type { InvoiceLine, TaxCategory } from "./domain";
import { calculateGhanaTaxWithRates, type TaxRates } from "./tax";

export interface InvoiceLineInput {
  itemId?: string;
  description: string;
  quantity: number;
  unitPriceMinor: number;
  taxCategory: TaxCategory;
  priceIncludesTax?: boolean;
}

export interface InvoiceTotals {
  lines: InvoiceLine[];
  subtotalMinor: number;
  vatMinor: number;
  nhilMinor: number;
  getfundMinor: number;
  totalTaxMinor: number;
  totalMinor: number;
}

export function computeInvoice(
  inputs: InvoiceLineInput[],
  rates: TaxRates,
): InvoiceTotals {
  if (inputs.length === 0) {
    throw new Error("Add at least one invoice line.");
  }

  const lines: InvoiceLine[] = [];
  let subtotalMinor = 0;
  let vatMinor = 0;
  let nhilMinor = 0;
  let getfundMinor = 0;
  let totalTaxMinor = 0;
  let totalMinor = 0;

  for (const input of inputs) {
    if (!Number.isFinite(input.quantity) || input.quantity <= 0) {
      throw new Error("Quantity must be greater than zero.");
    }
    if (
      !Number.isInteger(input.unitPriceMinor) ||
      input.unitPriceMinor < 0
    ) {
      throw new Error("Unit price must be a non-negative whole number of pesewas.");
    }

    const grossMinor = Math.round(input.quantity * input.unitPriceMinor);
    const tax = calculateGhanaTaxWithRates(
      {
        amountMinor: grossMinor,
        taxCategory: input.taxCategory,
        priceIncludesTax: input.priceIncludesTax ?? false,
      },
      rates,
    );

    lines.push({
      itemId: input.itemId,
      description: input.description,
      quantity: input.quantity,
      unitPriceMinor: input.unitPriceMinor,
      taxCategory: input.taxCategory,
      lineTotalMinor: grossMinor,
      taxableMinor: tax.taxableMinor,
      vatMinor: tax.vatMinor,
      nhilMinor: tax.nhilMinor,
      getfundMinor: tax.getfundMinor,
    });

    subtotalMinor += grossMinor;
    vatMinor += tax.vatMinor;
    nhilMinor += tax.nhilMinor;
    getfundMinor += tax.getfundMinor;
    totalTaxMinor += tax.totalTaxMinor;
    totalMinor += tax.totalMinor;
  }

  return {
    lines,
    subtotalMinor,
    vatMinor,
    nhilMinor,
    getfundMinor,
    totalTaxMinor,
    totalMinor,
  };
}
