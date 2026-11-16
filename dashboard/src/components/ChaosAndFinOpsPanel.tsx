'use client';

import React, { useState } from 'react';
import {
  Flame,
  Server,
  Globe,
  RefreshCw,
  DollarSign,
  Sliders
} from 'lucide-react';
import { FINOPS_BREAKDOWN } from '../lib/aws-simulator';

interface EC2NodeState {
  id: string;
  az: string;
  ip: string;
  state: 'running' | 'terminated' | 'initializing';
  cpu: number;
}

interface ChaosAndFinOpsPanelProps {
  onTerminateNodeParent?: () => void;
}

export const ChaosAndFinOpsPanel: React.FC<ChaosAndFinOpsPanelProps> = () => {
  // Chaos Engineering State with authentic EC2 node IDs
  const [nodes, setNodes] = useState<EC2NodeState[]>([
    { id: 'i-07343d1cee5fbcbb5', az: 'ap-south-1a', ip: '10.0.10.94', state: 'running', cpu: 32 },
    { id: 'i-0af744995af529e58', az: 'ap-south-1b', ip: '10.0.11.139', state: 'running', cpu: 28 },
  ]);
  const [alarmActive, setAlarmActive] = useState<boolean>(false);
  const [isHealing, setIsHealing] = useState<boolean>(false);
  const [s3ReplicationStatus, setS3ReplicationStatus] = useState<'IDLE' | 'REPLICATING' | 'SYNCED'>('SYNCED');

  // FinOps Calculator State
  const [monthlyVolumeK, setMonthlyVolumeK] = useState<number>(100);

  // Trigger EC2 Instance Termination Chaos
  const handleTerminateNode = () => {
    if (isHealing) return;

    setNodes((prev) => [
      { ...prev[0], state: 'terminated', cpu: 0 },
      prev[1]
    ]);
    setAlarmActive(true);
    setIsHealing(true);

    setTimeout(() => {
      setNodes((prev) => [
        { id: `i-0${Math.random().toString(36).substring(2, 9)}`, az: 'ap-south-1a', ip: '10.0.10.201', state: 'initializing', cpu: 15 },
        prev[1]
      ]);
    }, 2000);

    setTimeout(() => {
      setNodes((prev) => [
        { ...prev[0], state: 'running', cpu: 29 },
        prev[1]
      ]);
      setAlarmActive(false);
      setIsHealing(false);
    }, 4500);
  };

  const handleS3Failover = () => {
    setS3ReplicationStatus('REPLICATING');
    setTimeout(() => {
      setS3ReplicationStatus('SYNCED');
    }, 2500);
  };

  // FinOps calculation
  const volumeMultiplier = monthlyVolumeK / 100;
  const baseOnDemand = 148.00;
  const baseOptimized = 42.00;
  const currentOnDemand = (baseOnDemand * (0.8 + 0.2 * volumeMultiplier)).toFixed(2);
  const currentOptimized = (baseOptimized * (0.85 + 0.15 * volumeMultiplier)).toFixed(2);
  const savingsPct = (((Number(currentOnDemand) - Number(currentOptimized)) / Number(currentOnDemand)) * 100).toFixed(1);

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.03)] flex flex-col h-full font-sans">

      {/* Panel Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 shadow-sm">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Chaos Engineering & FinOps Cost Optimizer
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              ASG self-healing demonstration & 71.6% savings calculator
            </p>
          </div>
        </div>
        <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full font-bold">
          FINOPS & RESILIENCE
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-hidden">

        {/* =========================================================================
            LEFT COLUMN: Chaos Engineering & Auto-Healing ASG
           ========================================================================= */}
        <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-bold text-slate-900 flex items-center gap-2">
                <Server className="w-4 h-4 text-slate-700" />
                EC2 ASG Self-Healing Simulator
              </span>
              <span
                className={`text-[9px] px-2.5 py-0.5 rounded font-bold uppercase ${alarmActive
                  ? 'bg-rose-50 text-rose-800 border border-rose-300 animate-pulse'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}
              >
                {alarmActive ? 'ALARM_EC2_UNHEALTHY' : 'ASG_NOMINAL (2/2)'}
              </span>
            </div>

            {/* Active Nodes Display */}
            <div className="space-y-2 mb-3">
              {nodes.map((node) => (
                <div
                  key={node.id}
                  className={`p-3 rounded-lg border flex items-center justify-between text-xs font-mono shadow-sm ${node.state === 'running'
                    ? 'bg-white border-slate-200'
                    : node.state === 'initializing'
                      ? 'bg-amber-50 border-amber-300'
                      : 'bg-rose-50 border-rose-300'
                    }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{node.id}</span>
                      <span className="text-[10px] text-slate-500 font-sans">({node.az})</span>
                    </div>
                    <div className="text-[11px] text-slate-500">{node.ip} (Private Subnet)</div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${node.state === 'running'
                        ? 'text-emerald-800 bg-emerald-50 border border-emerald-200'
                        : node.state === 'initializing'
                          ? 'text-amber-800 bg-amber-50 border border-amber-200'
                          : 'text-rose-800 bg-rose-50 border border-rose-200'
                        }`}
                    >
                      {node.state}
                    </span>
                    <span className="text-slate-600 font-bold text-[11px]">{node.cpu}% CPU</span>
                  </div>
                </div>
              ))}
            </div>

            {/* S3 CRR Failover Status */}
            <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-sans mb-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-700 flex items-center gap-2 text-xs font-medium">
                  <Globe className="w-3.5 h-3.5 text-slate-600" />
                  S3 CRR (ap-south-1 &rarr; ap-southeast-1):
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold font-mono ${s3ReplicationStatus === 'REPLICATING'
                    ? 'text-amber-800 bg-amber-50 border border-amber-300 animate-pulse'
                    : 'text-slate-800 bg-slate-100 border border-slate-200'
                    }`}
                >
                  {s3ReplicationStatus === 'REPLICATING' ? 'SYNCING_OBJECTS' : 'REPLICATED_SYNCED'}
                </span>
              </div>
            </div>
          </div>

          {/* Chaos Trigger Buttons */}
          <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-200 text-xs font-sans">
            <button
              onClick={handleTerminateNode}
              disabled={isHealing}
              className="p-2.5 bg-white hover:bg-rose-50 text-rose-800 border border-slate-200 hover:border-rose-300 rounded-lg transition-all flex items-center justify-center gap-2 font-bold disabled:opacity-50 shadow-sm"
            >
              TERMINATE_NODE [CHAOS]
            </button>
            <button
              onClick={handleS3Failover}
              disabled={s3ReplicationStatus === 'REPLICATING'}
              className="p-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 hover:border-slate-300 rounded-lg transition-all flex items-center justify-center gap-2 font-bold shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${s3ReplicationStatus === 'REPLICATING' ? 'animate-spin' : ''}`} />
              <span>Simulate S3 CRR</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN: FinOps Cost Calculator & 71.6% Savings Proof
           ========================================================================= */}
        <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200 text-xs">
              <span className="font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-slate-700" />
                FinOps Cost Optimization Calculator
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded font-bold">
                {savingsPct}% MONTHLY SAVINGS
              </span>
            </div>

            {/* Cost Comparison High-Contrast Summary */}
            <div className="grid grid-cols-2 gap-2.5 mb-3 text-center">
              <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Standard On-Demand</div>
                <div className="text-base font-bold text-slate-400 line-through font-mono mt-1">
                  ${currentOnDemand}/mo
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Fixed EC2 + RDS On-Demand</div>
              </div>

              <div className="bg-white border border-emerald-300 p-3 rounded-lg shadow-sm">
                <div className="text-[10px] text-emerald-800 uppercase font-bold tracking-wider">CloudGuard Optimized</div>
                <div className="text-base font-extrabold text-emerald-800 font-mono mt-1">
                  ${currentOptimized}/mo
                </div>
                <div className="text-[10px] text-emerald-700 font-medium mt-0.5">ASG + 1-Yr Reserved + SQS</div>
              </div>
            </div>

            {/* Transaction Volume Slider */}
            <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs mb-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-700 flex items-center gap-2 text-xs font-semibold">
                  <Sliders className="w-3.5 h-3.5 text-slate-600" />
                  Monthly Transaction Volume:
                </span>
                <span className="text-slate-900 font-mono font-bold">{monthlyVolumeK}K Transfers</span>
              </div>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={monthlyVolumeK}
                onChange={(e) => setMonthlyVolumeK(Number(e.target.value))}
                className="w-full accent-slate-900 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
              />
            </div>

            {/* Architectural Savings Item Breakdown */}
            <div className="space-y-1.5 text-xs font-mono">
              {FINOPS_BREAKDOWN.slice(0, 3).map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-slate-800 shadow-sm"
                >
                  <span className="truncate max-w-[200px] font-sans text-xs text-slate-700 font-medium">{item.item}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 line-through">${item.onDemand}</span>
                    <span className="text-emerald-800 font-bold">${item.optimized}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>Free-Tier Budget Guard: Active</span>
            <span className="text-emerald-800 font-bold font-mono">AWS::Budgets Configured ($5.00)</span>
          </div>
        </div>

      </div>

    </div>
  );
};
