import { z } from "zod";
import { zodSchemas } from "../lib/zod";

export type Position = z.infer<typeof zodSchemas.position>;

// Use a global singleton for in-memory store (works in dev, not serverless/prod)
const globalAny = global as any;
if (!globalAny.positions) {
  globalAny.positions = [
    {
      id: "1",
      strike: 20000,
      instrument_type: "CE",
      transaction_type: "BUY",
      expiry: {
        date: 1,
        month: 1,
        year: 2026,
      },
      net_quantity: 100,
      net_price: 100,
      timestamp: "2021-01-01 12:00:00",
      underlyingId: "1",
    },
    {
      id: "2",
      strike: 20000,
      instrument_type: "PE",
      transaction_type: "BUY",
      expiry: {
        date: 1,
        month: 1,
        year: 2026,
      },
      net_quantity: 100,
      net_price: 100,
      timestamp: "2021-01-01 12:00:00",
      underlyingId: "1",
    },
  ];
}
const positions: Position[] = globalAny.positions;

export function getAllPositions(): Position[] {
  return positions;
}

export function getPositionById(id: string): Position | undefined {
  return positions.find((p) => p.id === id);
}

export function addPosition(position: Omit<Position, "id"> & { id?: string }): Position {
  const newPosition: Position = {
    ...position,
    id: position.id || crypto.randomUUID(),
  };
  positions.push(newPosition);
  return newPosition;
}

export function deletePosition(id: string): Position | undefined {
  const index = positions.findIndex((p) => p.id === id);
  if (index === -1) return undefined;
  return positions.splice(index, 1)[0];
}

export function updatePosition(position: Position): Position | undefined {
  const index = positions.findIndex((p) => p.id === position.id);
  if (index === -1) return undefined;
  positions[index] = position;
  return position;
}

/**
 * Returns all available strike prices for a given underlying, within +-1000 of the CMP.
 * Strikes are generated every 100 units in the range [cmp-1000, cmp+1000].
 * This does not depend on user positions.
 */
export function getAllAvailablePositions(underlyingId: string, cmp: number): number[] {
  // For demo, generate strikes every 100 units in the range
  const strikes: number[] = [];
  const minStrike = Math.floor((cmp - 1000) / 100) * 100;
  const maxStrike = Math.ceil((cmp + 1000) / 100) * 100;
  for (let strike = minStrike; strike <= maxStrike; strike += 100) {
    strikes.push(strike);
  }
  return strikes;
} 