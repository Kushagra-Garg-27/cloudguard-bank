'use client';

import dynamic from 'next/dynamic';

const MasterDashboard = dynamic(() => import('../components/MasterDashboard'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#F5F3EF] text-[#171717] flex items-center justify-center font-sans select-none">
      <div className="flex items-center gap-3.5 bg-white border border-[#D9D6CF] px-6 py-4 rounded-2xl shadow-bento">
        <span className="w-2.5 h-2.5 rounded-full bg-[#F45B2A] animate-ping" />
        <span className="text-xs font-mono font-bold tracking-wider text-[#171717] uppercase">
          Initializing CloudGuard Bank Operations Control...
        </span>
      </div>
    </div>
  ),
});

export default function Page() {
  return <MasterDashboard />;
}
