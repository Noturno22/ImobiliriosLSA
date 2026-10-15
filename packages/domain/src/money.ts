import { Currency } from "./enums";

/**
 * Money is stored as an exact integer number of minor units (cÃªntimos for AOA).
 * Never use floating point for financial values.
 */
export interface Money {
  /** Integer minor units, e.g. 500000000 Kz => 50_000_000_000 cÃªntimos. */
  amountMinor: number;
  currency: Currency;
}

const CURRENCY_FRACTION_DIGITS: Record<Currency, number> = {
  AOA: 2,
  USD: 2,
  EUR: 2,
};

export function isMoney(value: unknown): value is Money {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.amountMinor === "number" &&
    Number.isInteger(v.amountMinor) &&
    typeof v.currency === "string" &&
    v.currency in CURRENCY_FRACTION_DIGITS
  );
}

export function toMajor(money: Money): number {
  return money.amountMinor / 10 ** CURRENCY_FRACTION_DIGITS[money.currency];
}

export function fromMajor(amountMajor: number, currency: Currency): Money {
  return {
    amountMinor: Math.round(amountMajor * 10 ** CURRENCY_FRACTION_DIGITS[currency]),
    currency,
  };
}

/**
 * Formats money for the Angolan market (pt-AO / AOA => Kz).
 * Uses Intl and normalises the AOA symbol to "Kz" where the runtime emits "AOA".
 */
export function formatMoney(money: Money, locale = "pt-AO"): string {
  const value = toMajor(money);
  const formatted = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: money.currency,
    maximumFractionDigits: CURRENCY_FRACTION_DIGITS[money.currency],
  }).format(value);
  return money.currency === "AOA" ? formatted.replace(/AOA/, "Kz").trim() : formatted;
}
