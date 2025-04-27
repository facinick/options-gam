import BankBalance from "@/components/BankBalance";
import CMP from "@/components/CMP";
import StrikePnLChart from "@/components/StrikePnLChart";

const underlyingId = 'b7e6e2e2-1c2a-4b1a-8e2a-1e2a1e2a1e2a';

export default function Home() {
  return (
    // Main container with grid layout
    <main className="min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)] w-full">
      {/* Top bar with BankBalance (left) and CMP (right) */}
      <header className="flex flex-row items-start justify-between w-full mb-12 gap-4">
        <div className="flex-1 flex justify-start">
          <BankBalance />
        </div>
        <div className="flex-1 flex justify-end">
          <CMP underlyingId={underlyingId} />
        </div>
      </header>
      {/* Chart section */}
      <StrikePnLChart underlyingId={underlyingId} />
      {/* Main content area (add more content here as needed) */}
      <section className="w-full">
        {/* ...existing or future content... */}
      </section>
    </main>
  );
}
