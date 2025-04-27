import { z } from "zod";

export const cmpSchema = z.object({
  cmp: z.number(),
});

export const bankBalanceSchema = z.object({
  bankBalance: z.number(),
})

export const currentTimeSchema = z.object({
  currentTime: z.string(),
})

export const expirySchema = z.object({
  date: z.number(),
  month: z.number(),
  year: z.number(),
});

export const positionSchema = z.object({
  id: z.string(),
  strike: z.number(),
  instrument_type: z.enum(["CE", "PE"]),
  transaction_type: z.enum(["BUY", "SELL"]),
  net_quantity: z.number(),
  net_price: z.number(),
  timestamp: z.string(),
  expiry: expirySchema,
  underlyingId: z.string(),
});

export const positionsSchema = z.array(positionSchema);

export const underlyingSchema = z.object({
  id: z.string(),
  name: z.string(), // e.g., 'ASIANPAINT', 'NIFTY50'
});

export const underlyingsSchema = z.array(underlyingSchema);

export const zodSchemas = {
  cmp: cmpSchema,
  bankBalance: bankBalanceSchema,
  currentTime: currentTimeSchema,
  position: positionSchema,
  positions: positionsSchema,
  underlying: underlyingSchema,
  underlyings: underlyingsSchema,
};