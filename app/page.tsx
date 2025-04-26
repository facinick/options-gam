'use client'

import { useGetBankBalance, useGetCMP } from "@/lib/api";
import OptionsChart from "@/components/OptionsChart";

export default function Home() {
  // Fetch CMP using the useGetCMP hook
  const { data: cmpData, isLoading: isLoadingCmp } = useGetCMP();
  // Fetch Bank Balance
  const { data: bankBalanceData, isLoading: isLoadingBankBalance } = useGetBankBalance();

  // Define width and height for the chart
  const width = 1000;
  const height = 500;

  // Check if CMP data is still loading
  if (isLoadingCmp || isLoadingBankBalance) {
    return <div>Loading Data...</div>;
  }

  // Ensure cmpData is not null and contains cmp property
  const cmp = cmpData?.cmp;
  if (!cmp) {
    return <div>Error loading CMP</div>;
  }

      // Check if BankBalance data is still loading
      if (isLoadingBankBalance) {
        return <div>Loading Bank Balance...</div>;
      }
      const bankBalance = bankBalanceData?.bankBalance;
      if (!bankBalance) {
        return <div>Error loading Bank Balance</div>;
      }
  // Define initial chart data
  const initialData = [
    { strike: cmp - 1000, pnl: 0 },
    { strike: cmp + 1000, pnl: 0 },
  ];

  return (
    // Main container with grid layout
    <main className="grid grid-rows-[auto_1fr] items-start justify-items-start min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] flex flex-col w-full">
      {/* Title */}
      <h1 className="text-3xl font-bold">Stock Options</h1>
      {/* Bank balance display */}
      <div className="flex flex-row w-full justify-between">
        <p>Bank Balance: {bankBalance}</p>
      </div>
      {/* Options Chart component */}
      <OptionsChart width={width} height={height} strikePrice={cmp} data={initialData}/>
    </main>
  );
}
