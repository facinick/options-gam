"use client";

import { useGetCMP } from "@/lib/api";
import React from "react";

/**
 * CMP component displays the current market price fetched from the API.
 * Uses React Query for data fetching and caching.
 * Handles loading and error states gracefully.
 * Accessible and uses semantic HTML.
 */
export const CMP: React.FC = () => {
  const { data, isLoading, isError, error } = useGetCMP();

  // Loading state
  if (isLoading) {
    return (
      <section aria-busy="true" aria-live="polite" className="p-4 rounded bg-gray-100 text-gray-700">
        Loading market price...
      </section>
    );
  }

  // Error state
  if (isError) {
    return (
      <section role="alert" className="p-4 rounded bg-red-100 text-red-700">
        Error loading market price: {error instanceof Error ? error.message : "Unknown error"}
      </section>
    );
  }

  // Success state
  return (
    <section aria-label="Current Market Price" className="p-4 rounded bg-white shadow text-gray-900">
      <h2 className="text-lg font-semibold mb-2">Current Market Price</h2>
      <p className="text-2xl font-mono" data-testid="cmp-value">
        {data?.cmp.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
      </p>
    </section>
  );
};

export default CMP; 