'use client';

import React, { useState } from 'react';
import {
  DollarSign,
  PiggyBank,
  Sliders,
  ShieldCheck,
  TrendingDown,
  ArrowRight,
  Layers,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { FINOPS_BREAKDOWN } from '../lib/aws-simulator';

export const FinOpsView: React.FC = () => {
  const [monthlyVolumeK, setMonthlyVolumeK] = useState<number>(100);

  // Exact dynamic FinOps formula from aws-simulator.ts / ChaosAndFinOpsPanel.tsx
  const volumeMultiplier = monthlyVolumeK / 100;
  const baseOnDemand = 148.00;
  const baseOptimized = 42.00;
  const currentOnDemand = (baseOnDemand * (0.8 + 0.2 * volumeMultiplier)).toFixed(2);
  const currentOptimized = (baseOptimized * (0.85 + 0.15 * volumeMultiplier)).toFixed(2);
  const netMonthlySavings = (Number(currentOnDemand) - Number(currentOptimized)).toFixed(2);
  const savingsPct = (((Number(currentOnDemand) - Number(currentOptimized)) / Number(currentOnDemand)) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      
      {/* Header & Primary Savings Callout */}
      <section className="bg-white border border-[#D9D6CF] rounded-2xl p-6 sm:p-8 shadow-bento font-sans">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#D9D6CF]">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#F45B2A] font-bold mb-1">
              CLOUD FINANCIAL MANAGEMENT & COST GOVERNANCE
            </div>
            <h2 className="font-display font-extrabold text-2xl text-[#171717] tracking-tight">
              FinOps Cost Optimizer & 71.6% Architectural Savings Proof
            </h2>
            <p className="text-xs text-[#73716B] mt-1">
              Mathematical proof of cost efficiency comparing traditional static AWS on-demand resources with CloudGuard decoupled serverless architecture.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="p-3 bg-[#EDF7F0] border border-[#C6E7D2] text-[#236B43] rounded-xl font-mono text-sm font-bold flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              <span>{savingsPct}% NET SAVINGS</span>
            </span>
          </div>
        </div>

        {/* 3 Prominent Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
          
          {/* Card 1: Baseline On-Demand */}
          <div className="p-5 bg-[#F5F3EF] border border-[#D9D6CF] rounded-2xl font-mono text-center">
            <div className="text-[10px] text-[#85837E] uppercase font-bold tracking-wider">
              Traditional Static On-Demand
            </div>
            <div className="font-display font-bold text-2xl sm:text-3xl text-[#85837E] line-through mt-2 tabular-nums">
              ${currentOnDemand}
              <span className="text-xs font-normal text-[#85837E] no-underline">/mo</span>
            </div>
            <div className="text-[11px] text-[#85837E] mt-1 font-sans">
              Always-on compute & unreserved multi-AZ RDS
            </div>
          </div>

          {/* Card 2: CloudGuard Optimized */}
          <div className="p-5 bg-white border-2 border-[#236B43] rounded-2xl font-mono text-center shadow-subtle">
            <div className="text-[10px] text-[#236B43] uppercase font-bold tracking-wider">
              CloudGuard Optimized Architecture
            </div>
            <div className="font-display font-extrabold text-3xl sm:text-4xl text-[#236B43] mt-2 tabular-nums">
              ${currentOptimized}
              <span className="text-xs font-normal text-[#236B43]">/mo</span>
            </div>
            <div className="text-[11px] text-[#236B43] mt-1 font-sans font-medium">
              ASG + 1-Yr Reserved RDS + Pay-per-Use Lambda
            </div>
          </div>

          {/* Card 3: Net Monthly Savings */}
          <div className="p-5 bg-[#FFF3EE] border border-[#FDC4B0] rounded-2xl font-mono text-center">
            <div className="text-[10px] text-[#F45B2A] uppercase font-bold tracking-wider">
              Net Monthly Savings
            </div>
            <div className="font-display font-bold text-2xl sm:text-3xl text-[#F45B2A] mt-2 tabular-nums">
              ${netMonthlySavings}
              <span className="text-xs font-normal text-[#F45B2A]">/mo</span>
            </div>
            <div className="text-[11px] text-[#F45B2A] mt-1 font-sans">
              {savingsPct}% reduced AWS infrastructure expenditure
            </div>
          </div>

        </div>
      </section>

      {/* Interactive Transaction Volume Sensitivity Slider */}
      <section className="bg-white border border-[#D9D6CF] rounded-2xl p-6 sm:p-8 shadow-bento font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-[#D9D6CF]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#171717] flex items-center justify-center text-white">
              <Sliders className="w-4 h-4 text-[#F45B2A]" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-[#171717]">
                Transaction Volume Sensitivity Model
              </h3>
              <p className="text-xs text-[#85837E]">
                Test elasticity and auto-scaling cost trajectory under retail scale
              </p>
            </div>
          </div>

          <div className="font-mono text-sm font-bold text-[#171717] px-3 py-1 bg-[#F5F3EF] border border-[#D9D6CF] rounded-xl">
            {monthlyVolumeK}K Transfers / month
          </div>
        </div>

        <div className="space-y-3">
          <input
            type="range"
            min="10"
            max="500"
            step="10"
            value={monthlyVolumeK}
            onChange={(e) => setMonthlyVolumeK(Number(e.target.value))}
            className="w-full accent-[#171717] cursor-pointer h-2 bg-[#EEECE6] rounded-lg"
          />

          <div className="flex items-center justify-between text-[11px] font-mono text-[#85837E]">
            <span>10K (Early Beta)</span>
            <span>100K (Baseline Reference)</span>
            <span>250K (Growth)</span>
            <span>500K (Enterprise Peak)</span>
          </div>
        </div>
      </section>

      {/* Architectural Cost Breakdown Table & Budget Safety */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 font-sans">
        
        {/* Left Column: Itemized Architectural Breakdown (col-span-8) */}
        <div className="lg:col-span-8 bg-white border border-[#D9D6CF] rounded-2xl shadow-bento overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-6 pb-4 border-b border-[#D9D6CF] flex items-center justify-between">
              <div className="font-display font-bold text-sm text-[#171717]">
                Architectural Itemized Cost Audit
              </div>
              <span className="font-mono text-[10px] bg-[#EEECE6] text-[#403E39] px-2 py-0.5 rounded font-bold">
                6 ARCHITECTURAL TIERS
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#D9D6CF] bg-[#F5F3EF]/70 font-mono text-[10px] text-[#85837E] uppercase">
                    <th className="py-3 px-4 font-bold">Service / Architecture Component</th>
                    <th className="py-3 px-4 font-bold">Tier</th>
                    <th className="py-3 px-4 font-bold text-right">On-Demand</th>
                    <th className="py-3 px-4 font-bold text-right">Optimized</th>
                    <th className="py-3 px-4 font-bold text-right text-[#236B43]">Savings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9D6CF] font-mono">
                  {FINOPS_BREAKDOWN.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#F5F3EF]/60 transition-colors">
                      <td className="py-3 px-4 font-sans font-medium text-[#171717]">
                        {item.item}
                      </td>
                      <td className="py-3 px-4 text-[10px] text-[#85837E]">
                        <span className="px-1.5 py-0.2 rounded bg-[#F5F3EF] border border-[#D9D6CF]">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-[#85837E] line-through">
                        ${item.onDemand.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-[#171717]">
                        ${item.optimized.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-[#236B43]">
                        +${item.savings.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-[#171717] bg-[#F5F3EF] font-mono text-xs font-bold">
                    <td className="py-3 px-4 font-sans text-[#171717]">
                      Total Baseline Sum
                    </td>
                    <td className="py-3 px-4 text-[#85837E] text-[10px]">ALL TIERS</td>
                    <td className="py-3 px-4 text-right text-[#85837E] line-through">
                      $148.00
                    </td>
                    <td className="py-3 px-4 text-right text-[#236B43]">
                      $42.00
                    </td>
                    <td className="py-3 px-4 text-right text-[#236B43]">
                      +$106.00 (71.6%)
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: AWS Budgets Student Threshold Guard (col-span-4) */}
        <div className="lg:col-span-4 bg-white border border-[#D9D6CF] rounded-2xl p-6 shadow-bento flex flex-col justify-between font-sans">
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#D9D6CF]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#236B43]" />
                <h3 className="font-display font-bold text-sm text-[#171717]">
                  AWS Budgets Safety Guard
                </h3>
              </div>
              <span className="font-mono text-[10px] bg-[#EDF7F0] text-[#236B43] border border-[#C6E7D2] px-2 py-0.5 rounded font-bold">
                SAFE
              </span>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="p-3 bg-[#F5F3EF] rounded-xl border border-[#D9D6CF] space-y-1">
                <div className="text-[10px] text-[#85837E]">BUDGET LIMIT</div>
                <div className="text-xl font-bold text-[#171717]">$5.00 USD</div>
                <div className="text-[10px] text-[#85837E]">Student AWS Educate Tier</div>
              </div>

              <div className="p-3 bg-[#F5F3EF] rounded-xl border border-[#D9D6CF] space-y-1">
                <div className="text-[10px] text-[#85837E]">CURRENT ACCRUED BILL</div>
                <div className="text-xl font-bold text-[#236B43]">$1.35 USD (27.0%)</div>
                <div className="w-full bg-[#EEECE6] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-[#236B43] rounded-full" style={{ width: '27%' }} />
                </div>
              </div>

              <div className="p-3 bg-[#F5F3EF] rounded-xl border border-[#D9D6CF] text-[#73716B] text-[11px] leading-relaxed">
                CloudFormation resource <code className="text-[#171717]">AWS::Budgets::Budget</code> dispatches critical SNS alerts at 85% and 100% threshold to prevent accidental student overages.
              </div>
            </div>
          </div>

          <div className="pt-3 mt-4 border-t border-[#D9D6CF] text-xs text-[#85837E] font-mono flex items-center justify-between">
            <span>Safety Threshold Status:</span>
            <span className="text-[#236B43] font-bold">ZERO OVERAGES</span>
          </div>
        </div>

      </section>

    </div>
  );
};
