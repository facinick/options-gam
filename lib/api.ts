import { useQuery } from "@tanstack/react-query";
import { zodSchemas } from "./zod";

const fetchCMP = async () => {
  const response = await fetch("/api/cmp");
  if (!response.ok) {
    throw new Error("Failed to fetch CMP");
  }
  return await response.json();
};

export const useGetCMP = () => {
  return useQuery({
    queryKey: ["cmp"],
    queryFn: fetchCMP,
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