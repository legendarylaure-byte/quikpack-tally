import { CURRENCIES } from "./constants";
import { parseMoney } from "./money";

export type MasterImportCollection = "items" | "parties";

type Row = Record<string, unknown>;

function value(row: Row, ...keys: string[]): string {
  for (const key of keys) {
    const raw = row[key];
    if (raw !== undefined && raw !== null && String(raw).trim() !== "") {
      return String(raw).trim();
    }
  }
  return "";
}

function money(raw: string, label: string, line: number): number {
  const amount = raw.replace(/[^0-9,.-]/g, "");
  if (!amount) {
    return 0;
  }
  try {
    return parseMoney(amount);
  } catch {
    throw new Error(`Row ${line} has an invalid ${label}.`);
  }
}

function wholeNumber(raw: string, fallback: number, label: string, line: number): number {
  if (!raw) {
    return fallback;
  }
  const amount = Number(raw.replace(/,/g, ""));
  if (!Number.isInteger(amount) || amount < 0) {
    throw new Error(`Row ${line} has an invalid ${label}.`);
  }
  return amount;
}

function flag(raw: string, fallback: boolean): boolean {
  if (!raw) {
    return fallback;
  }
  return !["false", "0", "no", "off"].includes(raw.toLowerCase());
}

function taxCategory(raw: string, line: number): string {
  const normalized = raw.toLowerCase().replace(/[^a-z]/g, "");
  if (!normalized || normalized === "standard") {
    return "standard";
  }
  if (normalized === "zerorated") {
    return "zeroRated";
  }
  if (normalized === "exempt") {
    return "exempt";
  }
  throw new Error(`Row ${line} has an invalid tax category.`);
}

function partyType(raw: string, line: number): string {
  const normalized = raw.toLowerCase();
  if (!normalized || normalized === "customer") {
    return "customer";
  }
  if (normalized === "supplier" || normalized === "both") {
    return normalized;
  }
  throw new Error(`Row ${line} has an invalid party type.`);
}

function currency(raw: string, line: number): string {
  const normalized = raw.toUpperCase();
  if (!normalized) {
    return "GHS";
  }
  if (!(CURRENCIES as readonly string[]).includes(normalized)) {
    throw new Error(`Row ${line} has an invalid currency.`);
  }
  return normalized;
}

export function prepareMasterImportRows(
  collection: MasterImportCollection,
  rows: Row[],
): Array<Record<string, unknown>> {
  return rows.map((row, index) => {
    const line = index + 2;

    if (collection === "items") {
      const sku = value(row, "sku", "code", "itemcode");
      const name = value(row, "name", "itemname");
      if (!sku || !name) {
        throw new Error(`Row ${line} needs a SKU and name.`);
      }
      return {
        sku,
        name,
        barcode: value(row, "barcode"),
        unit: value(row, "unit", "uom") || "piece",
        taxCategory: taxCategory(value(row, "taxcategory", "tax"), line),
        salePriceMinor: money(
          value(row, "saleprice", "sellingprice", "price", "retailprice"),
          "sale price",
          line,
        ),
        purchasePriceMinor: money(
          value(row, "purchaseprice", "costprice", "purchasecost", "cost"),
          "purchase price",
          line,
        ),
        reorderLevel: wholeNumber(
          value(row, "reorderlevel", "reorderat", "reorderpoint"),
          0,
          "reorder level",
          line,
        ),
        location: value(row, "location", "defaultlocation"),
        trackStock: flag(value(row, "trackstock"), true),
        resellable: flag(value(row, "resellable"), true),
        description: value(row, "description", "notes"),
        customFields: value(row, "customfields", "custom"),
      };
    }

    const name = value(row, "name", "partyname");
    if (!name) {
      throw new Error(`Row ${line} needs a name.`);
    }
    return {
      name,
      type: partyType(value(row, "type", "partytype"), line),
      contactPerson: value(row, "contactperson", "contact"),
      email: value(row, "email"),
      phone: value(row, "phone", "mobile"),
      address: value(row, "address"),
      tin: value(row, "tin", "taxid"),
      currency: currency(value(row, "currency"), line),
      creditLimitMinor: money(
        value(row, "creditlimit", "creditlimitminor"),
        "credit limit",
        line,
      ),
      paymentTermsDays: wholeNumber(
        value(row, "paymenttermsdays", "paymentterms", "terms"),
        0,
        "payment terms",
        line,
      ),
      customFields: value(row, "customfields", "custom"),
    };
  });
}
