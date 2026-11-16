'use client';

import React from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  ShieldAlert,
  Inbox,
  Server,
  Database,
  FileCheck2,
  Activity,
  PiggyBank,
  ChevronRight,
  ShieldCheck,
  Radio,
  X
} from 'lucide-react';
import { ExecutionMode } from '../types/cloud';

export type DashboardView =
  | 'overview'
  | 'transactions'
  | 'fraud'
  | 'queue'
  | 'infrastructure'
  | 'database'
  | 'compliance'
  | 'monitoring'
  | 'finops';

interface NavItem {
  id: DashboardView;
  number: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', number: '01', label: 'Overview', icon: LayoutDashboard },
  { id: 'transactions', number: '02', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'fraud', number: '03', label: 'Fraud & Security', icon: ShieldAlert },
  { id: 'queue', number: '04', label: 'Processing Queue', icon: Inbox },
  { id: 'infrastructure', number: '05', label: 'Infrastructure', icon: Server },
  { id: 'database', number: '06', label: 'Database Explorer', icon: Database },
  { id: 'compliance', number: '07', label: 'Compliance & Audit', icon: FileCheck2 },
  { id: 'monitoring', number: '08', label: 'Monitoring & Alerts', icon: Activity },
  { id: 'finops', number: '09', label: 'FinOps Optimizer', icon: PiggyBank, badge: '71.6%' },
];

interface EditorialSidebarProps {
  currentView: DashboardView;
  onSelectView: (view: DashboardView) => void;
  executionMode: ExecutionMode;
  onToggleMode: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  sqsQueueDepth?: number;
  sqsDlqDepth?: number;
}

export const EditorialSidebar: React.FC<EditorialSidebarProps> = ({
  currentView,
  onSelectView,
  executionMode,
  onToggleMode,
  isOpenMobile,
  onCloseMobile,
  sqsQueueDepth = 0,
  sqsDlqDepth = 0,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-[#171717]/30 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#F5F3EF] border-r border-[#D9D6CF] flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top Brand Block */}
        <div>
          <div className="p-6 pb-4 border-b border-[#D9D6CF] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#171717] flex items-center justify-center text-white shadow-sm">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#F45B2A]" />
                </div>
                <div className="font-display font-bold text-base tracking-tight text-[#171717]">
                  CLOUDGUARD<span className="text-[#F45B2A]">.BANK</span>
                </div>
              </div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-[#85837E] mt-1 flex items-center gap-1.5">
                <span>FinTech Operations Control</span>
                <span className="text-[#D9D6CF]">•</span>
                <span className="text-[#236B43] font-semibold">v4.0 Ready</span>
              </div>
            </div>

            {/* Close Button on Mobile */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-[#85837E] hover:text-[#171717] hover:bg-[#EEECE6]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Editorial Navigation List */}
          <nav className="p-3 space-y-0.5 overflow-y-auto max-h-[calc(100vh-250px)]">
            <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-[#A5A29C]">
              Operations Navigation
            </div>

            {NAV_ITEMS.map((item) => {
              const isActive = currentView === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectView(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-sans transition-all text-left ${
                    isActive
                      ? 'bg-white text-[#171717] font-semibold border border-[#D9D6CF] shadow-[0_1px_3px_rgba(23,23,23,0.04)]'
                      : 'text-[#73716B] hover:text-[#171717] hover:bg-[#EEECE6]/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-mono text-[11px] transition-colors ${
                        isActive ? 'text-[#F45B2A] font-bold' : 'text-[#A5A29C] group-hover:text-[#73716B]'
                      }`}
                    >
                      {item.number}
                    </span>
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-[#F45B2A]' : 'text-[#85837E] group-hover:text-[#171717]'
                      }`}
                    />
                    <span className="tracking-tight">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Badge for FinOps or Syllabus or Queue alerts */}
                    {item.id === 'queue' && (sqsQueueDepth > 0 || sqsDlqDepth > 0) && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] font-bold animate-pulse">
                        {sqsQueueDepth + sqsDlqDepth}
                      </span>
                    )}

                    {item.badge && (
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold border ${
                          isActive
                            ? 'bg-[#FFF3EE] text-[#F45B2A] border-[#FDC4B0]'
                            : 'bg-white/80 text-[#73716B] border-[#D9D6CF]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[#F45B2A]" />
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom System & Infrastructure Panel */}
        <div className="p-4 border-t border-[#D9D6CF] bg-[#EEECE6]/40 text-xs font-sans space-y-3">
          {/* Cloud Region Indicator */}
          <div className="space-y-1 font-mono text-[11px]">
            <div className="flex items-center justify-between text-[#85837E]">
              <span>PRIMARY AWS:</span>
              <span className="text-[#171717] font-semibold">ap-south-1</span>
            </div>
            <div className="flex items-center justify-between text-[#85837E]">
              <span>DR REPLICA:</span>
              <span className="text-[#403E39]">ap-southeast-1</span>
            </div>
          </div>

          {/* Mode Switch Card */}
          <div className="p-2.5 bg-white border border-[#D9D6CF] rounded-xl flex items-center justify-between shadow-subtle">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  executionMode === 'SIMULATION' ? 'bg-[#F45B2A] animate-pulse' : 'bg-[#236B43]'
                }`}
              />
              <div className="text-[10px] font-mono leading-tight">
                <div className="text-[#85837E]">ENGINE MODE</div>
                <div className="font-bold text-[#171717]">
                  {executionMode === 'SIMULATION' ? 'DETERMINISTIC SIM' : 'LIVE AWS SDK'}
                </div>
              </div>
            </div>

            <button
              onClick={onToggleMode}
              className="text-[10px] font-mono text-[#F45B2A] hover:text-[#DF4A1B] font-bold px-2 py-1 rounded bg-[#FFF3EE] hover:bg-[#FFECE4] border border-[#FDC4B0] transition-colors"
              title="Switch execution engine"
            >
              SWITCH
            </button>
          </div>

          {/* Academic Governance Pill */}
          <div className="text-[10px] text-[#85837E] font-mono text-center flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#236B43]" />
            <span>PCI-DSS v4.0 & GDPR Article 32</span>
          </div>
        </div>
      </aside>
    </>
  );
};
