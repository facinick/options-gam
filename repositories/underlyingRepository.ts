import { z } from "zod";
import { zodSchemas } from "../lib/zod";

export type Underlying = z.infer<typeof zodSchemas.underlying>;

const underlyings: Underlying[] = [
  { id: 'b7e6e2e2-1c2a-4b1a-8e2a-1e2a1e2a1e2a', name: 'NIFTY50' },
  { id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', name: 'ASIANPAINT' },
  { id: 'c0ffee00-1234-5678-9abc-def012345678', name: 'RELIANCE' },
];

export function getAllUnderlyings(): Underlying[] {
  return underlyings;
}

export function getUnderlyingById(id: string): Underlying | undefined {
  return underlyings.find(u => u.id === id);
}

export function getUnderlyingByName(name: string): Underlying | undefined {
  return underlyings.find(u => u.name.toUpperCase() === name.toUpperCase());
} 