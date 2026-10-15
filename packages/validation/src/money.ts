import { z } from "zod";

export const currencySchema = z.enum(["AOA", "USD", "EUR"]);

/** Money in exact integer minor units (cêntimos). */
export const moneySchema = z.object({
  amountMinor: z.number().int().nonnegative(),
  currency: currencySchema,
});

/** Price input from humans, expressed in major units (Kz). */
export const priceInputSchema = z.object({
  amountMajor: z.number().nonnegative(),
  currency: currencySchema.default("AOA"),
});

export type PriceInput = z.infer<typeof priceInputSchema>;
