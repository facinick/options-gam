'use client'

import { useGetBankBalance } from "@/lib/api";
import React from "react";

/**
 * BankBalance component displays the current bank balance fetched from the API.
 * Uses React Query for data fetching and caching.
 * Handles loading and error states gracefully.
 * Accessible and uses semantic HTML.
 */
export const BankBalance: React.FC = () => {
  const { data, isLoading, isError, error } = useGetBankBalance();

  // Loading state
  if (isLoading) {
    return (
      <section aria-busy="true" aria-live="polite" className="p-4 rounded bg-gray-100 text-gray-700">
        Loading balance...
      </section>
    );
  }

  // Error state
  if (isError) {
    return (
      <section role="alert" className="p-4 rounded bg-red-100 text-red-700">
        Error loading balance: {error instanceof Error ? error.message : "Unknown error"}
      </section>
    );
  }

  // Success state
  return (
    <section aria-label="Current Bank Balance" className="p-4 rounded bg-white shadow text-gray-900">
      <h2 className="text-lg font-semibold mb-2">Bank Balance</h2>
      <p className="text-2xl font-mono" data-testid="bank-balance">
        {data?.bankBalance.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
      </p>
    </section>
  );
};

export default BankBalance;
