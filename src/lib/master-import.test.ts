import assert from "node:assert/strict";
import test from "node:test";
import { prepareMasterImportRows } from "./master-import";

test("prepares item rows with aliases and safe defaults", () => {
  const [row] = prepareMasterImportRows("items", [
    {
      sku: "EP-1",
      name: "Tissues",
      unit: "pack",
      taxcategory: "Zero-Rated",
      saleprice: "GH₵ 45.00",
      costprice: "30",
      reorderlevel: "12",
      trackstock: "false",
    },
  ]);

  assert.deepEqual(row, {
    sku: "EP-1",
    name: "Tissues",
    barcode: "",
    unit: "pack",
    taxCategory: "zeroRated",
    salePriceMinor: 4500,
    purchasePriceMinor: 3000,
    reorderLevel: 12,
    location: "",
    trackStock: false,
    resellable: true,
    description: "",
    customFields: "",
  });
});

test("prepares party rows with defaults", () => {
  const [row] = prepareMasterImportRows("parties", [
    {
      name: "Ama Serwaa",
      type: "supplier",
      contact: "Kofi",
      mobile: "0240000000",
      tin: "C001",
      currency: "usd",
      creditlimit: "1,000.00",
      paymentterms: "30",
    },
  ]);

  assert.deepEqual(row, {
    name: "Ama Serwaa",
    type: "supplier",
    contactPerson: "Kofi",
    email: "",
    phone: "0240000000",
    address: "",
    tin: "C001",
    currency: "USD",
    creditLimitMinor: 100000,
    paymentTermsDays: 30,
    customFields: "",
  });
});

test("rejects invalid master rows", () => {
  assert.throws(
    () => prepareMasterImportRows("items", [{ sku: "", name: "Tissues" }]),
    /Row 2 needs a SKU and name/,
  );
  assert.throws(
    () => prepareMasterImportRows("parties", [{ name: "Ama", type: "agent" }]),
    /Row 2 has an invalid party type/,
  );
});
