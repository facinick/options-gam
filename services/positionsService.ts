import type { Position } from "../repositories/positionsRepository";
import * as repo from "../repositories/positionsRepository";
import * as bankBalanceService from "./bankBalanceService";

export async function getAllPositions(): Promise<Position[]> {
  // Add business logic here if needed
  return repo.getAllPositions();
}

export async function addPosition(position: Omit<Position, "id"> & { id?: string }): Promise<Position> {
  // Add business logic here if needed
  const newPosition = repo.addPosition(position);
  // Use net_price and transaction_type
  const netPrice = newPosition.net_price;
  const transactionType = newPosition.transaction_type;
  let bankBalance = await bankBalanceService.getBankBalance();
  if (transactionType === 'BUY') {
    bankBalance.bankBalance -= netPrice;
  } else {
    bankBalance.bankBalance += netPrice;
  }
  await bankBalanceService.setBankBalance(bankBalance);
  return newPosition;
}

export async function deletePosition(id: string): Promise<Position | undefined> {
  return repo.deletePosition(id);
}

export async function updatePosition(position: Position): Promise<Position | undefined> {
  // Find the old position
  const allPositions = repo.getAllPositions();
  const oldPosition = allPositions.find((p) => p.id === position.id);
  if (!oldPosition) return undefined;
  let bankBalance = await bankBalanceService.getBankBalance();
  // Reverse the old position effect
  if (oldPosition.transaction_type === 'BUY') {
    bankBalance.bankBalance += oldPosition.net_price;
  } else {
    bankBalance.bankBalance -= oldPosition.net_price;
  }
  // Apply the new position effect
  if (position.transaction_type === 'BUY') {
    bankBalance.bankBalance -= position.net_price;
  } else {
    bankBalance.bankBalance += position.net_price;
  }
  await bankBalanceService.setBankBalance(bankBalance);
  // Update the position
  return repo.updatePosition(position);
} 