import { z } from "zod";
import { zodSchemas } from "../lib/zod";

export type Position = z.infer<typeof zodSchemas.position>;

let positions: Position[] = [
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

export function getAllPositions(): Position[] {
  return positions;
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