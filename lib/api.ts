import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { zodSchemas } from "./zod";

const fetchCMP = async (underlyingId: string) => {
  const response = await fetch(`/api/cmp?underlyingId=${underlyingId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch CMP");
  }
  return await response.json();
};

export const useGetCMP = (underlyingId: string) => {
  return useQuery({
    queryKey: ["cmp", underlyingId],
    queryFn: () => fetchCMP(underlyingId),
    select: (data) => {
      return zodSchemas.cmp.parse(data)
    },
    refetchOnWindowFocus: false
  });
};

const fetchBankBalance = async () => {
  const response = await fetch("/api/user/bankbalance");
  if (!response.ok) {
    throw new Error("Failed to fetch bank balance");
  }
  return await response.json();
};

export const useGetBankBalance = () => {
  return useQuery({
    queryKey: ["bankBalance"],
    queryFn: fetchBankBalance,
    select: (data) => {
      return zodSchemas.bankBalance.parse(data)
    }
  });
};

export const fetchCurrentTime = async () => {
  const response = await fetch("/api/time");
  if (!response.ok) {
    throw new Error("Failed to fetch current time");
  }
  return await response.json();
};

export const useGetCurrentTime = () => {
  return useQuery({
    queryKey: ["currentTime"],
    queryFn: fetchCurrentTime,
    select: (data) => {
      return zodSchemas.currentTime.parse(data)
    },
    refetchInterval: 1000,
  });
};

// Fetch the full user object from /api/user
const fetchUser = async () => {
  const response = await fetch("/api/user");
  if (!response.ok) throw new Error("Failed to fetch user data");
  return await response.json();
};

export const useGetUser = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
    refetchOnWindowFocus: false,
  });
};

// Fetch all user positions from /api/user
const fetchPositions = async () => {
  const response = await fetch("/api/user");
  if (!response.ok) {
    throw new Error("Failed to fetch user data");
  }
  const data = await response.json();
  return data.positions;
};

export const useGetPositions = () => {
  return useQuery({
    queryKey: ["positions"],
    queryFn: fetchPositions,
    select: (data) => zodSchemas.positions.parse(data),
    refetchOnWindowFocus: false,
  });
};

// Add a new position (user-specific)
const addPosition = async (position: Omit<z.infer<typeof zodSchemas.position>, "id">) => {
  const response = await fetch("/api/user/positions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(position),
  });
  if (!response.ok) {
    throw new Error("Failed to add position");
  }
  return await response.json();
};

export const useAddPosition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addPosition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      queryClient.invalidateQueries({ queryKey: ["bankBalance"] });
    },
  });
};

// Fetch all available strikes for an underlying around CMP
const fetchAvailableStrikes = async (underlyingId: string, cmp: number): Promise<number[]> => {
  const response = await fetch(`/api/positions?underlyingId=${encodeURIComponent(underlyingId)}&cmp=${cmp}`);
  if (!response.ok) {
    throw new Error("Failed to fetch available strikes");
  }
  // Validate as array of numbers
  const data = await response.json();
  return z.array(z.number()).parse(data);
};

/**
 * React Query hook to get all available strikes for an underlying and cmp
 */
export const useGetAvailableStrikes = (underlyingId: string | undefined, cmp: number | undefined) => {
  return useQuery({
    queryKey: ["availableStrikes", underlyingId, cmp],
    queryFn: () => {
      if (!underlyingId || cmp === undefined) throw new Error("Missing params");
      return fetchAvailableStrikes(underlyingId, cmp);
    },
    enabled: !!underlyingId && cmp !== undefined,
    refetchOnWindowFocus: false,
  });
};