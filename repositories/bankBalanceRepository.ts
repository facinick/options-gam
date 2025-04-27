import { zodSchemas } from "@/lib/zod";
import { z } from "zod";

export type BankBalance = z.infer<typeof zodSchemas.bankBalance>;

// In-memory bank balances store
const bankBalances: BankBalance[] = [
  { id: "bal1", bankBalance: 100000 },
];

export function getBankBalanceById(id: string): BankBalance | undefined {
  return bankBalances.find((b) => b.id === id);
}

export function updateBankBalance(balance: BankBalance): BankBalance | undefined {
  const idx = bankBalances.findIndex((b) => b.id === balance.id);
  if (idx === -1) return undefined;
  bankBalances[idx] = balance;
  return balance;
}

export function addBankBalance(balance: BankBalance): BankBalance {
  bankBalances.push(balance);
  return balance;
} 