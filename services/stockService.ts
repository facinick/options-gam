import { getUnderlyingById, getUnderlyingByName, getAllUnderlyings as repoGetAllUnderlyings, Underlying } from "../repositories/underlyingRepository";

// Hardcoded CMPs for demo
const cmpMap: Record<string, number> = {
  'b7e6e2e2-1c2a-4b1a-8e2a-1e2a1e2a1e2a': 20000, // NIFTY50
  'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d': 3200,  // ASIANPAINT
  'c0ffee00-1234-5678-9abc-def012345678': 2800,  // RELIANCE
};

export function getUnderlyingNameById(id: string): string | undefined {
  return getUnderlyingById(id)?.name;
}

export function getAllUnderlyings(): Underlying[] {
  return repoGetAllUnderlyings();
}

export function getCMPByUnderlyingId(id: string): number | undefined {
  return cmpMap[id];
}

export function getCMPByUnderlyingName(name: string): number | undefined {
  const underlying = getUnderlyingByName(name);
  return underlying ? cmpMap[underlying.id] : undefined;
}

export function getCMPOfPosition(position: {
  underlyingId: string,
  strike: number,
  instrument_type: 'CE' | 'PE',
  expiry: { date: number, month: number, year: number }
}): number | undefined {
  // For demo, just return the CMP of the underlying
  return getCMPByUnderlyingId(position.underlyingId);
} 