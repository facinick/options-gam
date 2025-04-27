import { getAllAvailablePositions, getAllPositions, getPositionById } from "../repositories/positionRepository";
import { getAllUnderlyings, getUnderlyingById, getUnderlyingByName, Underlying } from "../repositories/underlyingRepository";

// Hardcoded CMPs for demo
const cmpMap: Record<string, number> = {
  'b7e6e2e2-1c2a-4b1a-8e2a-1e2a1e2a1e2a': 20000, // NIFTY50
  'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d': 3200,  // ASIANPAINT
  'c0ffee00-1234-5678-9abc-def012345678': 2800,  // RELIANCE
};

// Get all underlyings
export function getAllStocks(): Underlying[] {
  return getAllUnderlyings();
}

// Get underlying by ID
export function getStockById(id: string): Underlying | undefined {
  return getUnderlyingById(id);
}

// Get underlying by name
export function getStockByName(name: string): Underlying | undefined {
  return getUnderlyingByName(name);
}

// Get CMP by underlying ID
export function getCMPByStockId(id: string): number | undefined {
  return cmpMap[id];
}

// Get CMP by underlying name
export function getCMPByStockName(name: string): number | undefined {
  const underlying = getUnderlyingByName(name);
  return underlying ? cmpMap[underlying.id] : undefined;
}

// Get all available strikes for an underlying and cmp
export function getAvailableStrikes(underlyingId: string, cmp: number): number[] {
  return getAllAvailablePositions(underlyingId, cmp);
}

// Get all positions (global, not user-specific)
export function getAllStockPositions() {
  return getAllPositions();
}

// Get a position by ID (global, not user-specific)
export function getStockPositionById(id: string) {
  return getPositionById(id);
} 