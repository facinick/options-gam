import { zodSchemas } from "@/lib/zod";
import { z } from "zod";

export type BankBalance = z.infer<typeof zodSchemas.bankBalance>;

let bankBalance: BankBalance = {
  bankBalance: 100000,
};

export function getBankBalance(): BankBalance {
  return bankBalance;
}

export function setBankBalance(newBalance: BankBalance): void {
  bankBalance = newBalance;
} 