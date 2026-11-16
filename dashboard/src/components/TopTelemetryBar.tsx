'use client';

import React from 'react';
import {
  ShieldCheck,
  Cpu,
  Lock,
  DollarSign,
  Layers,
  Radio
} from 'lucide-react';
import { ExecutionMode } from '../types/cloud';

interface TopTelemetryBarProps {
  executionMode: ExecutionMode;
  onToggleMode: () => void;
  activePacketActive?: boolean;
}

export const TopTelemetryBar: React.FC<TopTelemetryBarProps> = ({
  executionMode,
  onToggleMode,
  activePacketActive = false
}) => {
  return (
    <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-30 select-none shadow-[0_1px_3px_0_rgba(15,23,42,0.03)]">
      <div className="flex flex-wrap items-center justify-between gap-3 max-w-[1700px] mx-auto px-4 sm:px-6 py-2.5">
        
        {/* Brand & Project Identity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 px-3 py-1.5 rounded-xl shadow-sm">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="font-bold tracking-tight text-slate-900 font-sans text-sm">
              CLOUDGUARD<span className="text-indigo-600 font-extrabold">.BANK</span>
            </span>
            <span className="bg-white/90 text-[10px] text-indigo-700 font-mono font-semibold px-2 py-0.5 rounded-full border border-indigo-200/70 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              PCI-DSS v4.0
            </span>
          </div>

          <div className="hidden xl:flex items-center gap-2 text-slate-500 font-mono text-[11px] bg-slate-50/80 px-3 py-1.5 rounded-xl border border-slate-200/70">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-400 font-semibold">PRIMARY:</span>
            <span className="text-slate-700 font-medium">ap-south-1 (Mumbai)</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-400 font-semibold">DR:</span>
            <span className="text-cyan-700 font-medium">ap-southeast-1 (Singapore)</span>
          </div>
        </div>

        {/* Live Cloud Infrastructure Telemetry Tele-strip */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
          
          {/* VPC CIDR Tag */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200/80 px-2.5 py-1 rounded-lg text-slate-700 shadow-stripe-subtle">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-slate-400 text-[10px]">VPC:</span>
            <span className="text-slate-800 font-semibold">10.0.0.0/16</span>
          </div>

          {/* IAM Role ARN Scoped */}
          <div className="hidden lg:flex items-center gap-1.5 bg-white border border-slate-200/80 px-2.5 py-1 rounded-lg text-slate-700 shadow-stripe-subtle">
            <Cpu className="w-3.5 h-3.5 text-purple-600" />
            <span className="text-slate-400 text-[10px]">IAM:</span>
            <span className="text-slate-800 font-semibold truncate max-w-[130px]" title="arn:aws:iam::739201845201:role/CloudGuard-LeastPrivilege-Role">
              role/CloudGuard
            </span>
          </div>

          {/* KMS CMK Key Status */}
          <div className="hidden sm:flex items-center gap-1.5 bg-white border border-slate-200/80 px-2.5 py-1 rounded-lg text-slate-700 shadow-stripe-subtle">
            <Lock className="w-3.5 h-3.5 text-cyan-600" />
            <span className="text-slate-400 text-[10px]">KMS:</span>
            <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-bold border border-emerald-200/60">
              AES-256 ROTATION
            </span>
          </div>

          {/* Free-Tier Safety Budget Gauge */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200/80 px-2.5 py-1 rounded-lg shadow-stripe-subtle">
            <DollarSign className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-slate-400 text-[10px]">BUDGET:</span>
            <span className="text-slate-800 font-semibold">$1.35</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500">$5.00</span>
            <div className="w-10 h-1.5 bg-slate-100 rounded-full overflow-hidden ml-1 border border-slate-200/50">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '27%' }} />
            </div>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 rounded font-bold ml-0.5">
              SAFE
            </span>
          </div>

          {/* Pipeline Activity Pulse */}
          <div className="hidden md:flex items-center gap-1.5 bg-white border border-slate-200/80 px-2.5 py-1 rounded-lg shadow-stripe-subtle">
            <Radio className={`w-3.5 h-3.5 ${activePacketActive ? 'text-indigo-600 animate-spin' : 'text-slate-400'}`} />
            <span className="text-slate-400 text-[10px]">PIPELINE:</span>
            <span className={activePacketActive ? 'text-indigo-600 font-bold' : 'text-slate-600'}>
              {activePacketActive ? 'DISPATCHING' : 'IDLE / LISTENING'}
            </span>
          </div>
        </div>

        {/* Action Controls & Mode Toggle */}
        <div className="flex items-center gap-2">
          
          {/* Dual-Mode Toggle Button */}
          <button
            onClick={onToggleMode}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-[11px] transition-all border shadow-sm ${
              executionMode === 'SIMULATION'
                ? 'bg-slate-100/90 border-slate-200 text-slate-700 hover:bg-slate-200/90'
                : 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
            }`}
            title="Toggle between deterministic local simulation engine and live AWS SDK credentials"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                executionMode === 'SIMULATION' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
              }`}
            />
            <span className="text-slate-400 font-medium">MODE:</span>
            <span className="font-bold">
              {executionMode === 'SIMULATION' ? 'DETERMINISTIC SIM' : 'LIVE AWS SDK'}
            </span>
          </button>

        </div>

      </div>
    </header>
  );
};
