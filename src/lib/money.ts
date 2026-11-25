import type { Currency } from "./domain";

const SYMBOLS: Record<Currency, string> = {
  GHS: "GH₵",
  USD: "US$",
  NPR: "रू",
};

export function toMinor(amount: number): number {
  return Math.round(amount * 100);
}

export function fromMinor(minor: number): number {
  return minor / 100;
}

export function formatMoney(minor: number, currency: Currency = "GHS"): string {
  const value = fromMinor(minor).toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${SYMBOLS[currency] ?? currency} ${value}`;
}

export function moneyInput(minor: number): string {
  return (minor / 100).toFixed(2);
}

export function parseMoney(value: string | number): number {
  const amount = typeof value === "number" ? value : Number(String(value).replace(/,/g, ""));
  if (!Number.isFinite(amount)) {
    throw new Error("Enter a valid amount.");
  }
  return toMinor(amount);
}

export function convertFromGhs(ghsMinor: number, rate: number): number {
  return Math.round(ghsMinor * rate);
}

export function convertToGhs(amountMinor: number, rate: number): number {
  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error("Exchange rate must be greater than zero.");
  }
  return Math.round(amountMinor / rate);
}

export function currencySymbol(currency: Currency): string {
  return SYMBOLS[currency] ?? currency;
}
