import * as repo from "../repositories/bankBalanceRepository";

export async function getBankBalance() {
  // Add business logic here if needed
  return repo.getBankBalance();
}

export async function setBankBalance(newBalance: repo.BankBalance) {
  // Add business logic here if needed
  return repo.setBankBalance(newBalance);
} 