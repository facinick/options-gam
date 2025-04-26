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

export const zodSchemas = {
  cmp: cmpSchema,
  bankBalance: bankBalanceSchema,
  currentTime: currentTimeSchema,
};