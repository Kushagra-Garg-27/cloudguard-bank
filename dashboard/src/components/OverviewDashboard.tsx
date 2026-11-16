'use client';

import React from 'react';
import {
  TrendingUp,
  ShieldCheck,
  Zap,
  Inbox,
  Clock,
  Server,
  Activity,
  ArrowRight,
  Database,
  Lock,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { ArchitectureFlow } from './ArchitectureFlow';
import { TransactionTerminal } from './TransactionTerminal';
import {
  BankAccount,
  CloudTrailEvent,
  CloudWatchMetrics,
  Transaction
} from '../types/cloud';
import { DashboardView } from './EditorialSidebar';

interface OverviewDashboardProps {
  accounts: BankAccount[];
  transactions: Transaction[];
  selectedTxn: Transaction | null;
  onSelectTxn: (txn: Transaction) => void;
  metrics: CloudWatchMetrics;
  isProcessing: boolean;
  activeStage: string | null;
  burstProgress: { active: boolean; total: number; processed: number; remaining: number } | null;
  onSubmitTransaction: (payload: any) => void;
  onTriggerBurst: () => void;
  onNavigateView: (view: DashboardView) => void;
  onTriggerChaos?: () => void;
  chaosHealing?: boolean;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  accounts,
  transactions,
  selectedTxn,
  onSelectTxn,
  metrics,
  isProcessing,
  activeStage,
  burstProgress,
  onSubmitTransaction,
  onTriggerBurst,
  onNavigateView,
  onTriggerChaos,
  chaosHealing = false,
}) => {
  // Compute accurate metrics from live data
  const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0);
  const committedCount = transactions.filter((t) => t.status === 'COMMITTED').length;
  const fraudCount = transactions.filter((t) => t.status === 'FRAUD_BLOCKED').length;
  const poisonCount = transactions.filter((t) => t.status === 'POISON_PILL_DLQ').length;
  const successRate = transactions.length > 0
    ? ((committedCount / transactions.length) * 100).toFixed(1)
    : '100.0';
  const avgLatency = transactions.length > 0
    ? Math.round(transactions.reduce((sum, t) => sum + t.latencyMs, 0) / transactions.length)
    : 38;

  // Max transaction amount for throughput bar scaling
  const maxTxnAmount = Math.max(...transactions.map((t) => t.amount), 50000);

  return (
    <div className="space-y-6">
      
      {/* 1. Editorial Dashboard Header */}
      <section className="bg-white border border-[#D9D6CF] rounded-2xl p-6 sm:p-8 shadow-bento">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#F45B2A] bg-[#FFF3EE] border border-[#FDC4B0] px-2.5 py-0.5 rounded">
                CLOUDGUARD / BANKING INFRASTRUCTURE
              </span>
              <span className="text-[#85837E] text-xs font-mono">•</span>
              <span className="text-[#236B43] text-xs font-mono font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#236B43] animate-pulse" />
                OPERATIONAL
              </span>
            </div>
            
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#171717] tracking-tight leading-tight">
              Banking operations, under control.
            </h2>
            
            <p className="text-sm text-[#73716B] leading-relaxed">
              Real-time visibility into transaction processing, cryptographic envelope security, regulatory compliance, and multi-AZ cloud resilience.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
            <div className="p-3 bg-[#F5F3EF] border border-[#D9D6CF] rounded-xl">
              <div className="text-[10px] text-[#85837E]">PRIMARY REGION</div>
              <div className="font-bold text-[#171717]">ap-south-1 (Mumbai)</div>
            </div>
            <div className="p-3 bg-[#F5F3EF] border border-[#D9D6CF] rounded-xl">
              <div className="text-[10px] text-[#85837E]">DISASTER RECOVERY</div>
              <div className="font-bold text-[#403E39]">ap-southeast-1 (S3 CRR)</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Key Operational Metrics Bento Grid (6 Bento Cards) */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* Metric 1: Total Volume */}
        <div className="bg-white border border-[#D9D6CF] rounded-2xl p-4 shadow-bento flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#85837E] mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider">Total Volume</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#171717]" />
          </div>
          <div>
            <div className="font-display font-bold text-xl sm:text-2xl text-[#171717] tracking-tight tabular-nums">
              ₹{(totalVolume / 100000).toFixed(2)}L
            </div>
            <div className="text-[10px] text-[#85837E] font-mono mt-1">
              {transactions.length} transactions total
            </div>
          </div>
        </div>

        {/* Metric 2: Committed Transactions */}
        <div className="bg-white border border-[#D9D6CF] rounded-2xl p-4 shadow-bento flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#85837E] mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider">Success Rate</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#236B43]" />
          </div>
          <div>
            <div className="font-display font-bold text-xl sm:text-2xl text-[#236B43] tracking-tight tabular-nums">
              {successRate}%
            </div>
            <div className="text-[10px] text-[#85837E] font-mono mt-1">
              {committedCount} committed ledger
            </div>
          </div>
        </div>

        {/* Metric 3: SQS Buffer Depth */}
        <div className="bg-white border border-[#D9D6CF] rounded-2xl p-4 shadow-bento flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#85837E] mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider">SQS Buffer</span>
            <span className={`w-1.5 h-1.5 rounded-full ${metrics.sqsQueueDepth > 0 ? 'bg-[#F45B2A] animate-ping' : 'bg-[#236B43]'}`} />
          </div>
          <div>
            <div className={`font-display font-bold text-xl sm:text-2xl tracking-tight tabular-nums ${metrics.sqsQueueDepth > 0 ? 'text-[#F45B2A]' : 'text-[#171717]'}`}>
              {metrics.sqsQueueDepth} <span className="text-xs font-normal text-[#85837E]">msgs</span>
            </div>
            <div className="text-[10px] text-[#85837E] font-mono mt-1">
              DLQ: <strong className={metrics.sqsDlqDepth > 0 ? 'text-[#B91C1C]' : 'text-[#236B43]'}>{metrics.sqsDlqDepth}</strong> msgs
            </div>
          </div>
        </div>

        {/* Metric 4: Fraud Detections */}
        <div className="bg-white border border-[#D9D6CF] rounded-2xl p-4 shadow-bento flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#85837E] mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider">Fraud Blocked</span>
            <span className={`w-1.5 h-1.5 rounded-full ${fraudCount > 0 ? 'bg-[#B91C1C]' : 'bg-[#236B43]'}`} />
          </div>
          <div>
            <div className="font-display font-bold text-xl sm:text-2xl text-[#B91C1C] tracking-tight tabular-nums">
              {fraudCount} <span className="text-xs font-normal text-[#85837E]">anomalies</span>
            </div>
            <div className="text-[10px] text-[#85837E] font-mono mt-1">
              SNS bus alerted
            </div>
          </div>
        </div>

        {/* Metric 5: Mean Latency */}
        <div className="bg-white border border-[#D9D6CF] rounded-2xl p-4 shadow-bento flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#85837E] mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider">Processing Mean</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#171717]" />
          </div>
          <div>
            <div className="font-display font-bold text-xl sm:text-2xl text-[#171717] tracking-tight tabular-nums">
              {avgLatency} <span className="text-xs font-normal text-[#85837E]">ms</span>
            </div>
            <div className="text-[10px] text-[#85837E] font-mono mt-1">
              p99: 54ms • KMS GCM
            </div>
          </div>
        </div>

        {/* Metric 6: Compute ASG Health */}
        <div className="bg-white border border-[#D9D6CF] rounded-2xl p-4 shadow-bento flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#85837E] mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider">ASG Compute</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#236B43]" />
          </div>
          <div>
            <div className="font-display font-bold text-xl sm:text-2xl text-[#236B43] tracking-tight tabular-nums">
              2/2 <span className="text-xs font-normal text-[#85837E]">t3.micro</span>
            </div>
            <div className="text-[10px] text-[#85837E] font-mono mt-1">
              CPU: {metrics.ec2CpuUtilization.toFixed(1)}%
            </div>
          </div>
        </div>

      </section>

      {/* 3. Interactive Architecture Pipeline */}
      <section>
        <ArchitectureFlow
          metrics={metrics}
          isProcessing={isProcessing}
          activeStage={activeStage}
        />
      </section>

      {/* 4. Bento Split: Ingress Terminal (Left) + Throughput Chart & Feed (Right) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Transaction Terminal (col-span-5) */}
        <div className="lg:col-span-5 h-[500px]">
          <TransactionTerminal
            accounts={accounts}
            transactions={transactions}
            selectedTxn={selectedTxn}
            onSelectTxn={onSelectTxn}
            onSubmitTransaction={onSubmitTransaction}
            onTriggerBurst={onTriggerBurst}
            isProcessing={isProcessing}
            burstProgress={burstProgress}
          />
        </div>

        {/* Right: Minimalist Throughput Visualization & Activity Feed (col-span-7) */}
        <div className="lg:col-span-7 h-[500px] bg-white border border-[#D9D6CF] rounded-2xl p-5 sm:p-6 flex flex-col shadow-bento font-sans">
          
          <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-[#D9D6CF]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#171717] flex items-center justify-center text-white">
                <TrendingUp className="w-4 h-4 text-[#F45B2A]" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-[#171717] tracking-tight">
                  Transaction Throughput & Anomaly Distribution
                </h3>
                <p className="text-xs text-[#85837E]">
                  Real-time batch ingestion volume with anomaly classification
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigateView('transactions')}
              className="text-xs font-mono text-[#F45B2A] hover:text-[#DF4A1B] font-semibold flex items-center gap-1"
            >
              <span>Full Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Minimalist Rounded Bar Chart (Actual Ingestion Data) */}
          <div className="mb-4 p-3.5 bg-[#F5F3EF] rounded-xl border border-[#D9D6CF]">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#85837E] mb-2">
              <span>RECENT INGESTION BURSTS (INR ₹)</span>
              <span>PEAK: ₹{maxTxnAmount.toLocaleString()}</span>
            </div>

            {/* Bars container */}
            <div className="h-24 flex items-end gap-1.5 pt-2">
              {transactions.slice(0, 16).map((t, idx) => {
                const heightPct = Math.max(12, Math.min(100, (t.amount / maxTxnAmount) * 100));
                const isAnomalous = t.status === 'FRAUD_BLOCKED';
                const isSelected = selectedTxn?.transactionId === t.transactionId;

                return (
                  <div
                    key={t.transactionId}
                    onClick={() => onSelectTxn(t)}
                    className="flex-1 flex flex-col items-center group relative cursor-pointer h-full justify-end"
                  >
                    {/* Hover Tooltip */}
                    <div className="absolute bottom-full mb-1 hidden group-hover:block z-30 bg-[#171717] text-white text-[10px] font-mono px-2 py-1 rounded whitespace-nowrap shadow-lg">
                      <div className="font-bold">₹{t.amount.toLocaleString()}</div>
                      <div className="text-[9px] text-[#A5A29C]">{t.status} • {t.latencyMs}ms</div>
                    </div>

                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t-md transition-all ${
                        isAnomalous
                          ? 'bg-[#B91C1C]'
                          : isSelected
                          ? 'bg-[#F45B2A]'
                          : 'bg-[#171717]/80 hover:bg-[#F45B2A]'
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[9px] font-mono text-[#A5A29C] mt-2 pt-1.5 border-t border-[#D9D6CF]/60">
              <span>T-15 BATCH</span>
              <span className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded bg-[#171717]" /> Normal
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded bg-[#F45B2A]" /> Selected
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded bg-[#B91C1C]" /> Anomaly
                </span>
              </span>
              <span>LATEST INGRESS</span>
            </div>
          </div>

          {/* Detailed Selected Transaction Card */}
          <div className="flex-1 bg-[#F5F3EF] border border-[#D9D6CF] rounded-xl p-3.5 flex flex-col justify-between overflow-hidden">
            {selectedTxn ? (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#D9D6CF]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-[#171717]">{selectedTxn.transactionId}</span>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                      selectedTxn.status === 'COMMITTED'
                        ? 'bg-[#EDF7F0] text-[#236B43] border border-[#C6E7D2]'
                        : 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]'
                    }`}>
                      {selectedTxn.status}
                    </span>
                  </div>
                  <span className="font-display font-bold text-base text-[#171717]">
                    ₹{selectedTxn.amount.toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div>
                    <span className="text-[#85837E]">SENDER: </span>
                    <span className="text-[#171717] font-semibold">{selectedTxn.senderAccount}</span>
                  </div>
                  <div>
                    <span className="text-[#85837E]">RECEIVER: </span>
                    <span className="text-[#171717] font-semibold">{selectedTxn.receiverAccount}</span>
                  </div>
                  <div>
                    <span className="text-[#85837E]">LOCATION: </span>
                    <span className="text-[#403E39] truncate block">{selectedTxn.location}</span>
                  </div>
                  <div>
                    <span className="text-[#85837E]">LATENCY: </span>
                    <span className="text-[#F45B2A] font-bold">{selectedTxn.latencyMs}ms</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#D9D6CF] text-[10px] font-mono flex items-center justify-between">
                  <div className="truncate max-w-[280px]">
                    <span className="text-[#85837E]">KMS CIPHER: </span>
                    <span className="text-[#171717]">{selectedTxn.kmsEnvelope.ciphertextBlob.slice(0, 24)}...</span>
                  </div>
                  <button
                    onClick={() => onNavigateView('fraud')}
                    className="text-[#F45B2A] hover:underline font-bold shrink-0 ml-2"
                  >
                    View Diff &rarr;
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-[#85837E]">
                Select a transaction from the terminal or chart to inspect details
              </div>
            )}
          </div>

        </div>

      </section>

      {/* 5. Quick Operations Bento Row: Infrastructure Chaos (Left) & Polyglot Database (Right) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Quick ASG Resilience & Chaos Card */}
        <div className="bg-white border border-[#D9D6CF] rounded-2xl p-5 shadow-bento flex flex-col justify-between font-sans">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#D9D6CF]">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#F45B2A]" />
                <h3 className="font-display font-bold text-sm text-[#171717]">
                  EC2 ASG Self-Healing & Chaos
                </h3>
              </div>
              <button
                onClick={() => onNavigateView('infrastructure')}
                className="text-xs font-mono text-[#F45B2A] hover:underline font-semibold"
              >
                Deep Dive &rarr;
              </button>
            </div>

            <p className="text-xs text-[#73716B] mb-3">
              Demonstrate cloud fault tolerance. Simulates EC2 instance crash, triggering CloudWatch ALARM and automated Auto Scaling replacement.
            </p>

            <div className="p-3 bg-[#F5F3EF] border border-[#D9D6CF] rounded-xl flex items-center justify-between text-xs font-mono mb-3">
              <div>
                <div className="text-[10px] text-[#85837E]">ASG CAPACITY</div>
                <div className="font-bold text-[#171717]">Min: 2 / Desired: 2 / Max: 4</div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                chaosHealing ? 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] animate-pulse' : 'bg-[#EDF7F0] text-[#236B43] border border-[#C6E7D2]'
              }`}>
                {chaosHealing ? 'ASG REPLACING NODE' : 'ASG NOMINAL (2/2)'}
              </span>
            </div>
          </div>

          {onTriggerChaos && (
            <button
              onClick={onTriggerChaos}
              disabled={chaosHealing}
              className="w-full p-2.5 bg-[#F5F3EF] hover:bg-[#FEF2F2] border border-[#D9D6CF] hover:border-[#B91C1C] text-[#B91C1C] rounded-xl font-mono text-xs font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>TERMINATE_NODE [CHAOS TEST]</span>
            </button>
          )}
        </div>

        {/* Quick Polyglot Persistence Snapshot */}
        <div className="bg-white border border-[#D9D6CF] rounded-2xl p-5 shadow-bento flex flex-col justify-between font-sans">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#D9D6CF]">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#236B43]" />
                <h3 className="font-display font-bold text-sm text-[#171717]">
                  Polyglot Persistence: RDS vs DynamoDB
                </h3>
              </div>
              <button
                onClick={() => onNavigateView('database')}
                className="text-xs font-mono text-[#F45B2A] hover:underline font-semibold"
              >
                Explorer &rarr;
              </button>
            </div>

            <p className="text-xs text-[#73716B] mb-3">
              Strong ACID consistency for relational banking accounts paired with eventual consistency NoSQL for immutable compliance items.
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-3">
              <div className="p-2.5 bg-[#F5F3EF] border border-[#D9D6CF] rounded-xl">
                <div className="text-[10px] text-[#85837E]">RDS POSTGRESQL</div>
                <div className="font-bold text-[#171717]">{accounts.length} Accounts Active</div>
                <div className="text-[10px] text-[#236B43] font-semibold mt-0.5">ACID Serializable</div>
              </div>
              <div className="p-2.5 bg-[#F5F3EF] border border-[#D9D6CF] rounded-xl">
                <div className="text-[10px] text-[#85837E]">DYNAMODB TABLE</div>
                <div className="font-bold text-[#171717]">{transactions.length} Audit Items</div>
                <div className="text-[10px] text-[#403E39] font-semibold mt-0.5">365-Day Auto TTL</div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#D9D6CF] flex items-center justify-between text-xs text-[#85837E] font-mono">
            <span>Storage Encrypted: AWS KMS CMK</span>
            <span className="text-[#236B43] font-bold">100% VERIFIED</span>
          </div>
        </div>

      </section>

    </div>
  );
};
