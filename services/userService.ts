import * as bankBalanceRepo from "../repositories/bankBalanceRepository";
import * as positionRepo from "../repositories/positionRepository";
import * as userRepo from "../repositories/userRepository";

// Get user by ID
export function getUserById(id: string) {
  return userRepo.getUserById(id);
}

// Get all positions for a user
export function getUserPositions(userId: string) {
  const user = userRepo.getUserById(userId);
  if (!user) return [];
  return user.positionIds.map(pid => positionRepo.getPositionById(pid)).filter(Boolean);
}

// Add a position to a user
export function addUserPosition(userId: string, position: Omit<positionRepo.Position, "id"> & { id?: string }) {
  const user = userRepo.getUserById(userId);
  if (!user) throw new Error("User not found");
  const newPosition = positionRepo.addPosition(position);
  user.positionIds.push(newPosition.id);

  // Update bank balance
  const balance = bankBalanceRepo.getBankBalanceById(user.bankBalanceId);
  if (balance) {
    const newBalance =
      position.transaction_type === "BUY"
        ? balance.bankBalance - position.net_price
        : balance.bankBalance + position.net_price;
    bankBalanceRepo.updateBankBalance({ ...balance, bankBalance: newBalance });
  }

  userRepo.updateUser(user);
  return newPosition;
}

// Update a user's position
export function updateUserPosition(userId: string, position: positionRepo.Position) {
  const user = userRepo.getUserById(userId);
  if (!user) throw new Error("User not found");
  if (!user.positionIds.includes(position.id)) throw new Error("Position does not belong to user");
  return positionRepo.updatePosition(position);
}

// Delete a user's position
export function deleteUserPosition(userId: string, positionId: string) {
  const user = userRepo.getUserById(userId);
  if (!user) throw new Error("User not found");
  if (!user.positionIds.includes(positionId)) throw new Error("Position does not belong to user");
  user.positionIds = user.positionIds.filter(pid => pid !== positionId);
  userRepo.updateUser(user);
  return positionRepo.deletePosition(positionId);
}

// Get user's bank balance
export function getUserBankBalance(userId: string) {
  const user = userRepo.getUserById(userId);
  if (!user) throw new Error("User not found");
  return bankBalanceRepo.getBankBalanceById(user.bankBalanceId);
}

// Set user's bank balance
export function setUserBankBalance(userId: string, newBalance: number) {
  const user = userRepo.getUserById(userId);
  if (!user) throw new Error("User not found");
  const balance = bankBalanceRepo.getBankBalanceById(user.bankBalanceId);
  if (!balance) throw new Error("Bank balance not found");
  balance.bankBalance = newBalance;
  bankBalanceRepo.updateBankBalance(balance);
  return balance;
}

// Square off a user's position (remove it)
export function squareOffUserPosition(userId: string, positionId: string) {
  return deleteUserPosition(userId, positionId);
}