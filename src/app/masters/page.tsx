"use client";

import { useState, type FormEvent } from "react";
import { AppShell } from "@/components/app-shell";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/components/auth-provider";
import { FeatureGuard } from "@/components/feature-guard";
import {
  ResourceManager,
  type ColumnDef,
  type FieldDef,
} from "@/components/resource-manager";
import { SignOutButton } from "@/components/sign-out-button";
import { apiFetch } from "@/lib/api-client";
import { CURRENCIES } from "@/lib/constants";
import { getErrorMessage } from "@/lib/errors";
import { formatMoney } from "@/lib/money";

const currencyOptions = CURRENCIES.map((value) => ({ value, label: value }));

const accountFields: FieldDef[] = [
  { key: "code", label: "Account code", type: "text", required: true },
  { key: "name", label: "Account name", type: "text", required: true },
  {
    key: "type",
    label: "Type",
    type: "select",
    required: true,
    options: ["asset", "liability", "equity", "income", "expense"].map((value) => ({
      value,
      label: value,
    })),
  },
  { key: "group", label: "Group", type: "text", required: true, hint: "e.g. Current Assets" },
  { key: "openingBalanceMinor", label: "Opening balance (GHS)", type: "money" },
  { key: "description", label: "Description", type: "textarea" },
];

const accountColumns: ColumnDef[] = [
  { key: "code", label: "Code" },
  { key: "name", label: "Name" },
  { key: "type", label: "Type" },
  { key: "group", label: "Group" },
  {
    key: "openingBalanceMinor",
    label: "Opening",
    format: (value) => formatMoney(Number(value ?? 0)),
  },
];

const partyFields: FieldDef[] = [
  { key: "name", label: "Name", type: "text", required: true },
  {
    key: "type",
    label: "Type",
    type: "select",
    required: true,
    options: [
      { value: "customer", label: "Customer" },
      { value: "supplier", label: "Supplier" },
      { value: "both", label: "Both" },
    ],
  },
  { key: "contactPerson", label: "Contact person", type: "text" },
  { key: "email", label: "Email", type: "text" },
  { key: "phone", label: "Phone", type: "text" },
  { key: "address", label: "Address", type: "textarea" },
  { key: "tin", label: "TIN", type: "text" },
  { key: "currency", label: "Currency", type: "select", options: currencyOptions },
  { key: "creditLimitMinor", label: "Credit limit", type: "money" },
  { key: "paymentTermsDays", label: "Payment terms (days)", type: "number" },
  {
    key: "customFields",
    label: "Custom fields",
    type: "textarea",
    hint: "One key=value per line, e.g. region=Greater Accra",
  },
];

const partyColumns: ColumnDef[] = [
  { key: "name", label: "Name" },
  { key: "type", label: "Type" },
  { key: "contactPerson", label: "Contact" },
  { key: "phone", label: "Phone" },
  { key: "tin", label: "TIN" },
  { key: "currency", label: "Currency" },
];

const itemFields: FieldDef[] = [
  { key: "sku", label: "SKU", type: "text", required: true },
  { key: "name", label: "Name", type: "text", required: true },
  { key: "barcode", label: "Barcode", type: "text" },
  { key: "unit", label: "Unit", type: "text", required: true, hint: "e.g. box, carton, piece" },
  {
    key: "taxCategory",
    label: "Tax category",
    type: "select",
    required: true,
    options: [
      { value: "standard", label: "Standard (VAT/NHIL/GETFund)" },
      { value: "zeroRated", label: "Zero-rated (evidence required)" },
      { value: "exempt", label: "Exempt (evidence required)" },
    ],
  },
  { key: "salePriceMinor", label: "Sale price", type: "money" },
  { key: "purchasePriceMinor", label: "Purchase price", type: "money" },
  { key: "reorderLevel", label: "Reorder level", type: "number" },
  { key: "location", label: "Default location", type: "text" },
  { key: "trackStock", label: "Track stock", type: "checkbox" },
  { key: "resellable", label: "Resellable", type: "checkbox" },
  { key: "description", label: "Description", type: "textarea" },
  {
    key: "customFields",
    label: "Custom fields",
    type: "textarea",
    hint: "One key=value per line, e.g. colour=blue",
  },
];

const itemColumns: ColumnDef[] = [
  { key: "sku", label: "SKU" },
  { key: "name", label: "Name" },
  { key: "unit", label: "Unit" },
  { key: "taxCategory", label: "Tax" },
  {
    key: "salePriceMinor",
    label: "Sale price",
    format: (value) => formatMoney(Number(value ?? 0)),
  },
  { key: "reorderLevel", label: "Reorder at" },
];

const catalogueFields: FieldDef[] = [
  { key: "sku", label: "SKU", type: "text", required: true },
  { key: "description", label: "Description", type: "text", required: true },
  { key: "barcode", label: "Barcode", type: "text" },
  { key: "pack", label: "Pack", type: "text" },
  { key: "distributorPriceMinor", label: "Distributor price", type: "money" },
  { key: "boxPriceMinor", label: "Box price", type: "money" },
  { key: "sellingPriceMinor", label: "Selling price", type: "money" },
  { key: "source", label: "Source", type: "text" },
  { key: "resellable", label: "Resellable", type: "checkbox" },
];

const catalogueColumns: ColumnDef[] = [
  { key: "sku", label: "SKU" },
  { key: "description", label: "Description" },
  { key: "pack", label: "Pack" },
  {
    key: "sellingPriceMinor",
    label: "Selling",
    format: (value) => formatMoney(Number(value ?? 0)),
  },
  { key: "source", label: "Source" },
];

const exchangeFields: FieldDef[] = [
  { key: "currency", label: "Currency", type: "select", required: true, options: currencyOptions },
  { key: "rate", label: "Rate (units per GHS)", type: "number", required: true, hint: "e.g. 0.018 for USD" },
  { key: "date", label: "Effective date", type: "date", required: true },
  { key: "source", label: "Source", type: "text" },
];

const taxFields: FieldDef[] = [
  {
    key: "name",
    label: "Tax",
    type: "select",
    required: true,
    options: [
      { value: "vat", label: "VAT" },
      { value: "nhil", label: "NHIL" },
      { value: "getfund", label: "GETFund" },
    ],
  },
  { key: "rate", label: "Rate (%)", type: "percent", required: true, hint: "e.g. 15 for 15%" },
  { key: "effectiveFrom", label: "Effective from", type: "date", required: true },
  { key: "effectiveTo", label: "Effective to", type: "date" },
  { key: "note", label: "Note", type: "text" },
];

function CatalogueImport({ onImported }: { onImported: () => void }) {
  const { user } = useAuth();
  const [csv, setCsv] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function importCsv(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !csv.trim()) {
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const token = await user.getIdToken();
      const result = await apiFetch<{ imported: number }>(
        token,
        "/api/catalogue/import",
        { method: "POST", body: JSON.stringify({ csv }) },
      );
      setMessage(`Imported ${result.imported} items.`);
      setCsv("");
      onImported();
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="glass-panel rounded-2xl p-6">
      <h2 className="text-lg font-bold text-navy">Import Everpack catalogue</h2>
      <p className="mt-1 text-sm text-navy/65">
        Paste CSV with headers <code>sku,description,sellingPrice,pack</code>. Existing items are
        not repriced.
      </p>
      <form onSubmit={importCsv} className="mt-4">
        <textarea
          value={csv}
          onChange={(event) => setCsv(event.target.value)}
          rows={4}
          placeholder="sku,description,sellingPrice,pack&#10;EP-001,A4 tissues,45.00,10 packs"
          className="w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-sm text-navy outline-none focus:border-brand"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={busy}
            className="rounded-xl bg-navy px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {busy ? "Importing…" : "Import CSV"}
          </button>
          {message ? <p className="text-sm text-navy/70">{message}</p> : null}
        </div>
      </form>
    </section>
  );
}

function MastersContent() {
  const { can } = useAuth();
  const [tab, setTab] = useState("accounts");
  const [catalogueVersion, setCatalogueVersion] = useState(0);
  const canWriteMasters = can("masters");
  const canWriteSettings = can("settings");

  const tabs = [
    { key: "accounts", label: "Accounts" },
    { key: "parties", label: "Parties" },
    { key: "items", label: "Items" },
    { key: "catalogue", label: "Catalogue" },
    ...(canWriteSettings ? [{ key: "rates", label: "Rates & tax" }] : []),
  ];

  return (
    <AppShell
      title="Masters"
      subtitle="Chart of accounts, parties, items and the Everpack catalogue."
      actions={<SignOutButton />}
    >
      <div className="mb-6 flex flex-wrap gap-2" role="tablist">
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={tab === item.key}
            onClick={() => setTab(item.key)}
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
              tab === item.key
                ? "brand-gradient text-white"
                : "border border-navy/15 text-navy hover:border-brand"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {tab === "accounts" ? (
          <ResourceManager
            collection="accounts"
            title="Chart of accounts"
            description="Opening balances feed the trial balance and financial reports."
            fields={accountFields}
            columns={accountColumns}
            defaults={{ type: "asset", group: "", openingBalanceMinor: 0 }}
            canWrite={canWriteMasters}
          />
        ) : null}
        {tab === "parties" ? (
          <ResourceManager
            collection="parties"
            title="Customers and suppliers"
            fields={partyFields}
            columns={partyColumns}
            defaults={{ type: "customer", currency: "GHS" }}
            canWrite={canWriteMasters}
          />
        ) : null}
        {tab === "items" ? (
          <ResourceManager
            collection="items"
            title="Items and services"
            fields={itemFields}
            columns={itemColumns}
            defaults={{
              taxCategory: "standard",
              unit: "piece",
              trackStock: true,
              resellable: true,
              salePriceMinor: 0,
              purchasePriceMinor: 0,
              reorderLevel: 0,
            }}
            canWrite={canWriteMasters}
          />
        ) : null}
        {tab === "catalogue" ? (
          <>
            <CatalogueImport onImported={() => setCatalogueVersion((value) => value + 1)} />
            <ResourceManager
              key={`catalogue-${catalogueVersion}`}
              collection="catalogue"
              title="Everpack catalogue"
              description="Source prices stay in GHS; display is controlled by company settings."
              fields={catalogueFields}
              columns={catalogueColumns}
              defaults={{ source: "Everpack", resellable: true }}
              canWrite={canWriteMasters}
            />
          </>
        ) : null}
        {tab === "rates" ? (
          <>
            <ResourceManager
              collection="exchangeRates"
              title="Exchange rates"
              description="GHS base; rates express units of currency per 1 GHS."
              fields={exchangeFields}
              columns={[
                { key: "currency", label: "Currency" },
                { key: "rate", label: "Rate" },
                { key: "date", label: "Date" },
                { key: "source", label: "Source" },
              ]}
              defaults={{ currency: "USD", rate: 1, source: "Manual" }}
              canWrite={canWriteSettings}
            />
            <ResourceManager
              collection="taxRates"
              title="Ghana tax rates"
              description="Effective-dated VAT, NHIL and GETFund rates used by invoices and reports."
              fields={taxFields}
              columns={[
                { key: "name", label: "Tax" },
                { key: "rate", label: "Rate", format: (value) => `${Number(value ?? 0) * 100}%` },
                { key: "effectiveFrom", label: "From" },
                { key: "effectiveTo", label: "To" },
              ]}
              defaults={{ name: "vat", rate: 0.15 }}
              canWrite={canWriteSettings}
            />
          </>
        ) : null}
      </div>
    </AppShell>
  );
}

export default function MastersPage() {
  return (
    <AuthGuard>
      <FeatureGuard feature="masters">
        <MastersContent />
      </FeatureGuard>
    </AuthGuard>
  );
}
