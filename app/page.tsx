import BankBalance from "@/components/BankBalance";
import CMP from "@/components/CMP";

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
          <CMP />
        </div>
      </header>
      {/* Main content area (add more content here as needed) */}
      <section className="w-full">
        {/* ...existing or future content... */}
      </section>
    </main>
  );
}
