import { zodSchemas } from "@/lib/zod";
import { z } from "zod";

export type BankBalance = z.infer<typeof zodSchemas.bankBalance>;

// Use a global singleton for in-memory store (works in dev, not serverless/prod)
const globalAny = global as any;
if (!globalAny.bankBalances) {
  globalAny.bankBalances = [
    { id: "bal1", bankBalance: 100000 },
  ];
}
const bankBalances: BankBalance[] = globalAny.bankBalances;

export function getBankBalanceById(id: string): BankBalance | undefined {
  console.log("getting bank balance", bankBalances);
  return bankBalances.find((b) => b.id === id);
}

export function updateBankBalance(balance: BankBalance): BankBalance | undefined {
  const idx = bankBalances.findIndex((b) => b.id === balance.id);
  if (idx === -1) return undefined;
  // Always create a new object to ensure reference is updated
  const updated = { ...balance };
  bankBalances[idx] = updated;
  console.log("updated bank balance", bankBalances);
  return updated;
}

export function addBankBalance(balance: BankBalance): BankBalance {
  bankBalances.push(balance);
  return balance;
} 