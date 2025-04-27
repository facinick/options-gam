import { zodSchemas } from "@/lib/zod";
import { z } from "zod";

export type User = z.infer<typeof zodSchemas.user>;

// In-memory user store
const users: User[] = [
  {
    id: "1",
    positionIds: [], // User's position IDs
    bankBalanceId: "bal1", // Reference to bank balance
  },
];

export function getUserById(id: string): User | undefined {
  return users.find((user) => user.id === id);
}

export function updateUser(user: User): User | undefined {
  const idx = users.findIndex((u) => u.id === user.id);
  if (idx === -1) return undefined;
  users[idx] = user;
  return user;
}

export function addUser(user: User): User {
  users.push(user);
  return user;
}