'use client';

import React, { useState } from 'react';
import {
  Menu,
  Layers,
  Cpu,
  Lock,
  DollarSign,
  Radio,
  Zap,
  ShieldAlert,
  Skull,
  Flame,
  ChevronDown,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { ExecutionMode } from '../types/cloud';
import { DashboardView } from './EditorialSidebar';

interface EditorialTopBarProps {
  currentView: DashboardView;
  onOpenMobileNav: () => void;
  executionMode: ExecutionMode;
  onToggleMode: () => void;
  activePacketActive: boolean;
  onTriggerBurst: () => void;
  onTriggerFraud: () => void;
  onTriggerPoisonPill: () => void;
  onTriggerChaos?: () => void;
  isProcessing: boolean;
  burstActive: boolean;
}

const VIEW_TITLES: Record<DashboardView, { num: string; title: string }> = {
  overview: { num: '01', title: 'Executive Operations Overview' },
  transactions: { num: '02', title: 'FinTech Transaction Ledger' },
  fraud: { num: '03', title: 'Fraud & Cryptographic Security' },
  queue: { num: '04', title: 'Amazon SQS Decoupling & DLQ' },
  infrastructure: { num: '05', title: 'Multi-AZ Infrastructure Resilience' },
  database: { num: '06', title: 'Polyglot Persistence: RDS vs DynamoDB' },
  compliance: { num: '07', title: 'Compliance & CloudTrail Auditor' },
  monitoring: { num: '08', title: 'CloudWatch Telemetry & SNS Alerts' },
  finops: { num: '09', title: 'FinOps 71.6% Cost Optimization' },
};

export const EditorialTopBar: React.FC<EditorialTopBarProps> = ({
  currentView,
  onOpenMobileNav,
  executionMode,
  onToggleMode,
  activePacketActive,
  onTriggerBurst,
  onTriggerFraud,
  onTriggerPoisonPill,
  onTriggerChaos,
  isProcessing,
  burstActive,
}) => {
  const [showDemoDropdown, setShowDemoDropdown] = useState<boolean>(false);
  const viewMeta = VIEW_TITLES[currentView];

  return (
    <header className="sticky top-0 z-30 bg-[#F5F3EF]/95 backdrop-blur-md border-b border-[#D9D6CF] select-none">
      <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        
        {/* Left: Mobile Nav & Editorial Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileNav}
            className="lg:hidden p-2 rounded-xl border border-[#D9D6CF] bg-white text-[#171717] hover:bg-[#EEECE6] transition-colors"
            aria-label="Open Navigation"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-[#85837E]">
              <span>CLOUDGUARD</span>
              <span className="text-[#D9D6CF]">/</span>
              <span className="text-[#F45B2A] font-bold">{viewMeta.num}</span>
              <span className="text-[#D9D6CF]">/</span>
              <span className="text-[#403E39] font-medium hidden sm:inline">BANKING INFRASTRUCTURE</span>
            </div>
            <h1 className="font-display font-bold text-sm sm:text-base text-[#171717] tracking-tight">
              {viewMeta.title}
            </h1>
          </div>
        </div>

        {/* Center: Live Architecture Telemetry Strip */}
        <div className="hidden xl:flex items-center gap-2 text-[11px] font-mono">
          
          {/* VPC CIDR Tag */}
          <div className="flex items-center gap-1.5 bg-white border border-[#D9D6CF] px-2.5 py-1 rounded-lg text-[#171717] shadow-subtle">
            <Layers className="w-3.5 h-3.5 text-[#F45B2A]" />
            <span className="text-[#85837E] text-[10px]">VPC:</span>
            <span className="font-semibold">10.0.0.0/16</span>
          </div>

          {/* KMS Key Status */}
          <div className="flex items-center gap-1.5 bg-white border border-[#D9D6CF] px-2.5 py-1 rounded-lg shadow-subtle">
            <Lock className="w-3.5 h-3.5 text-[#171717]" />
            <span className="text-[#85837E] text-[10px]">KMS:</span>
            <span className="text-[#236B43] bg-[#EDF7F0] border border-[#C6E7D2] px-1.5 py-0.2 rounded font-bold text-[10px]">
              AES-256 ROTATION
            </span>
          </div>

          {/* Student Budget Meter */}
          <div className="flex items-center gap-1.5 bg-white border border-[#D9D6CF] px-2.5 py-1 rounded-lg shadow-subtle">
            <DollarSign className="w-3.5 h-3.5 text-[#92400E]" />
            <span className="text-[#85837E] text-[10px]">BUDGET:</span>
            <span className="font-bold text-[#171717]">$1.35</span>
            <span className="text-[#D9D6CF]">/</span>
            <span className="text-[#85837E]">$5.00</span>
            <div className="w-8 h-1.5 bg-[#EEECE6] rounded-full overflow-hidden ml-1">
              <div className="h-full bg-[#236B43] rounded-full" style={{ width: '27%' }} />
            </div>
          </div>

          {/* Pipeline Activity Pulse */}
          <div className="flex items-center gap-1.5 bg-white border border-[#D9D6CF] px-2.5 py-1 rounded-lg shadow-subtle">
            <Radio className={`w-3.5 h-3.5 ${activePacketActive ? 'text-[#F45B2A] animate-spin' : 'text-[#85837E]'}`} />
            <span className="text-[#85837E] text-[10px]">PIPELINE:</span>
            <span className={`font-semibold ${activePacketActive ? 'text-[#F45B2A] animate-pulse' : 'text-[#403E39]'}`}>
              {activePacketActive ? 'DISPATCHING' : 'IDLE / LISTENING'}
            </span>
          </div>
        </div>

        {/* Right: Quick Demonstrations & Execution Engine Toggle */}
        <div className="flex items-center gap-2">
          
          {/* Quick Demonstration Actions Menu */}
          <div className="relative">
            <button
              onClick={() => setShowDemoDropdown((v) => !v)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#D9D6CF] bg-white hover:bg-[#EEECE6]/60 text-xs font-sans font-semibold text-[#171717] shadow-subtle transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F45B2A]" />
              <span className="hidden sm:inline">Demonstrations</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#85837E]" />
            </button>

            {showDemoDropdown && (
              <>
                <div
                  onClick={() => setShowDemoDropdown(false)}
                  className="fixed inset-0 z-40"
                />
                <div className="absolute right-0 mt-2 w-64 bg-white border border-[#D9D6CF] rounded-2xl p-2 shadow-2xl z-50 text-xs font-sans space-y-1">
                  <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-[#85837E]">
                    Live Interactive Tests
                  </div>

                  {/* 50x Burst */}
                  <button
                    onClick={() => {
                      onTriggerBurst();
                      setShowDemoDropdown(false);
                    }}
                    disabled={isProcessing || burstActive}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-[#EEECE6] transition-colors disabled:opacity-40"
                  >
                    <div className="w-6 h-6 rounded-lg bg-[#EFF6FF] text-[#1E40AF] flex items-center justify-center shrink-0">
                      <Zap className="w-3.5 h-3.5 text-[#F45B2A]" />
                    </div>
                    <div>
                      <div className="font-bold text-[#171717]">50x Traffic Burst</div>
                      <div className="text-[10px] text-[#85837E]">SQS buffer soak & drain</div>
                    </div>
                  </button>

                  {/* High Value Fraud */}
                  <button
                    onClick={() => {
                      onTriggerFraud();
                      setShowDemoDropdown(false);
                    }}
                    disabled={isProcessing}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-[#EEECE6] transition-colors disabled:opacity-40"
                  >
                    <div className="w-6 h-6 rounded-lg bg-[#FEF2F2] text-[#B91C1C] flex items-center justify-center shrink-0">
                      <ShieldAlert className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-[#171717]">₹2.45L Fraud Anomaly</div>
                      <div className="text-[10px] text-[#85837E]">SNS SecOps alert + halt</div>
                    </div>
                  </button>

                  {/* Poison Pill DLQ */}
                  <button
                    onClick={() => {
                      onTriggerPoisonPill();
                      setShowDemoDropdown(false);
                    }}
                    disabled={isProcessing}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-[#EEECE6] transition-colors disabled:opacity-40"
                  >
                    <div className="w-6 h-6 rounded-lg bg-[#FEF3C7] text-[#92400E] flex items-center justify-center shrink-0">
                      <Skull className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-[#171717]">Poison Pill DLQ</div>
                      <div className="text-[10px] text-[#85837E]">3 retries &rarr; DLQ quarantine</div>
                    </div>
                  </button>

                  {/* Terminate EC2 Chaos */}
                  {onTriggerChaos && (
                    <button
                      onClick={() => {
                        onTriggerChaos();
                        setShowDemoDropdown(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-[#EEECE6] transition-colors"
                    >
                      <div className="w-6 h-6 rounded-lg bg-[#F5F3EF] text-[#171717] flex items-center justify-center shrink-0">
                        <Flame className="w-3.5 h-3.5 text-[#F45B2A]" />
                      </div>
                      <div>
                        <div className="font-bold text-[#171717]">Terminate EC2 (Chaos)</div>
                        <div className="text-[10px] text-[#85837E]">ASG self-healing lifecycle</div>
                      </div>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Engine Mode Toggle */}
          <button
            onClick={onToggleMode}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-[11px] border shadow-subtle transition-all ${
              executionMode === 'SIMULATION'
                ? 'bg-white border-[#D9D6CF] text-[#171717] hover:bg-[#EEECE6]'
                : 'bg-[#EDF7F0] border-[#C6E7D2] text-[#236B43] hover:bg-[#DCF0E3]'
            }`}
            title="Toggle between deterministic local simulation engine and live AWS SDK credentials"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                executionMode === 'SIMULATION' ? 'bg-[#F45B2A] animate-pulse' : 'bg-[#236B43]'
              }`}
            />
            <span className="hidden sm:inline text-[#85837E]">MODE:</span>
            <span className="font-bold">
              {executionMode === 'SIMULATION' ? 'DETERMINISTIC SIM' : 'LIVE AWS SDK'}
            </span>
          </button>

        </div>

      </div>
    </header>
  );
};
