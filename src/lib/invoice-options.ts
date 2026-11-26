import type { TaxRate } from "./domain";

type OptionRow = Record<string, unknown> & { id: string };

export interface InvoicePartyOption {
  id: string;
  name: string;
}

export interface InvoiceItemOption {
  id: string;
  name: string;
  salePriceMinor: number;
  taxCategory: string;
}

export interface InvoiceOptions {
  parties: InvoicePartyOption[];
  items: InvoiceItemOption[];
  taxRates: TaxRate[];
}

function finiteNumber(value: unknown): number {
  const result = Number(value ?? 0);
  return Number.isFinite(result) ? result : 0;
}

export function invoiceOptions(
  parties: OptionRow[],
  items: OptionRow[],
  taxRates: OptionRow[],
): InvoiceOptions {
  return {
    parties: parties
      .map((party) => ({ id: party.id, name: String(party.name ?? party.id) }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    items: items
      .map((item) => ({
        id: item.id,
        name: String(item.name ?? item.id),
        salePriceMinor: finiteNumber(item.salePriceMinor),
        taxCategory: String(item.taxCategory ?? "standard"),
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    taxRates: taxRates
      .map((row) => {
        const rate: TaxRate = {
          name: row.name as TaxRate["name"],
          rate: finiteNumber(row.rate),
          effectiveFrom: String(row.effectiveFrom ?? ""),
        };
        if (row.effectiveTo) {
          rate.effectiveTo = String(row.effectiveTo);
        }
        if (row.note) {
          rate.note = String(row.note);
        }
        return rate;
      })
      .sort(
        (a, b) =>
          a.effectiveFrom.localeCompare(b.effectiveFrom) ||
          a.name.localeCompare(b.name),
      ),
  };
}
