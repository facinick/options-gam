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
  const response = await fetch("/api/bankbalance");
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

// Fetch all positions
const fetchPositions = async () => {
  const response = await fetch("/api/positions");
  if (!response.ok) {
    throw new Error("Failed to fetch positions");
  }
  return await response.json();
};

export const useGetPositions = () => {
  return useQuery({
    queryKey: ["positions"],
    queryFn: fetchPositions,
    select: (data) => zodSchemas.positions.parse(data),
    refetchOnWindowFocus: false,
  });
};

// Add a new position
const addPosition = async (position: Omit<z.infer<typeof zodSchemas.position>, "id" | "timestamp">) => {
  const response = await fetch("/api/positions", {
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
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      queryClient.invalidateQueries({ queryKey: ["bankBalance"] });
    },
  });
};