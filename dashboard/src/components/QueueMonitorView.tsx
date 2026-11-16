'use client';

import React from 'react';
import {
  Inbox,
  Zap,
  Skull,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Server,
  Layers
} from 'lucide-react';
import { CloudWatchMetrics, Transaction } from '../types/cloud';

interface QueueMonitorViewProps {
  metrics: CloudWatchMetrics;
  transactions: Transaction[];
  onTriggerBurst: () => void;
  onTriggerPoisonPill: () => void;
  isProcessing: boolean;
  burstProgress: { active: boolean; total: number; processed: number; remaining: number } | null;
}

export const QueueMonitorView: React.FC<QueueMonitorViewProps> = ({
  metrics,
  transactions,
  onTriggerBurst,
  onTriggerPoisonPill,
  isProcessing,
  burstProgress
}) => {
  const poisonPillTxns = transactions.filter((t) => t.status === 'POISON_PILL_DLQ');

  return (
    <div className="space-y-6">
      
      {/* Header & Controls Strip */}
      <section className="bg-white border border-[#D9D6CF] rounded-2xl p-6 sm:p-8 shadow-bento font-sans">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#D9D6CF]">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#F45B2A] font-bold mb-1">
              ASYNCHRONOUS DECOUPLING & RESILIENCE
            </div>
            <h2 className="font-display font-extrabold text-2xl text-[#171717] tracking-tight">
              Amazon SQS Decoupling & Dead-Letter Queue (DLQ)
            </h2>
            <p className="text-xs text-[#73716B] mt-1">
              Absorb high-volume retail traffic spikes, insulate downstream compute, and quarantine malformed poison pill messages.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onTriggerBurst}
              disabled={isProcessing || (burstProgress?.active ?? false)}
              className="px-4 py-2.5 bg-[#FFF3EE] hover:bg-[#FFECE4] border border-[#FDC4B0] hover:border-[#F45B2A] text-[#F45B2A] rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 shadow-subtle disabled:opacity-40"
            >
              <Zap className="w-4 h-4" />
              <span>50X TRAFFIC BURST</span>
            </button>

            <button
              onClick={onTriggerPoisonPill}
              disabled={isProcessing}
              className="px-4 py-2.5 bg-[#FEF3C7] hover:bg-[#FDE68A] border border-[#FDE68A] hover:border-[#92400E] text-[#92400E] rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 shadow-subtle disabled:opacity-40"
            >
              <Skull className="w-4 h-4" />
              <span>INJECT POISON PILL</span>
            </button>
          </div>
        </div>

        {/* 4 Core Queue Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 pt-4">
          <div className="p-3.5 bg-[#F5F3EF] border border-[#D9D6CF] rounded-xl font-mono">
            <div className="text-[10px] text-[#85837E]">PRIMARY QUEUE DEPTH</div>
            <div className="text-2xl font-bold text-[#171717] mt-0.5">
              {metrics.sqsQueueDepth} <span className="text-xs font-normal text-[#85837E]">msgs</span>
            </div>
            <div className="text-[10px] text-[#236B43] mt-0.5">Buffer Nominal</div>
          </div>

          <div className="p-3.5 bg-[#F5F3EF] border border-[#D9D6CF] rounded-xl font-mono">
            <div className="text-[10px] text-[#85837E]">DLQ QUARANTINE</div>
            <div className={`text-2xl font-bold mt-0.5 ${metrics.sqsDlqDepth > 0 ? 'text-[#B91C1C]' : 'text-[#236B43]'}`}>
              {metrics.sqsDlqDepth} <span className="text-xs font-normal text-[#85837E]">msgs</span>
            </div>
            <div className="text-[10px] text-[#85837E] mt-0.5">Max Receive Count: 3</div>
          </div>

          <div className="p-3.5 bg-[#F5F3EF] border border-[#D9D6CF] rounded-xl font-mono">
            <div className="text-[10px] text-[#85837E]">VISIBILITY TIMEOUT</div>
            <div className="text-2xl font-bold text-[#171717] mt-0.5">60s</div>
            <div className="text-[10px] text-[#85837E] mt-0.5">Lambda Processing Window</div>
          </div>

          <div className="p-3.5 bg-[#F5F3EF] border border-[#D9D6CF] rounded-xl font-mono">
            <div className="text-[10px] text-[#85837E]">RETENTION WINDOW</div>
            <div className="text-2xl font-bold text-[#171717] mt-0.5">4 / 14 Days</div>
            <div className="text-[10px] text-[#85837E] mt-0.5">Main: 4d • DLQ: 14d</div>
          </div>
        </div>
      </section>

      {/* Burst Drain Indicator */}
      {burstProgress?.active && (
        <section className="bg-white border border-[#FDE68A] rounded-2xl p-5 shadow-bento font-sans animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm font-bold text-[#92400E]">
              <RefreshCw className="w-4 h-4 text-[#F45B2A] animate-spin" />
              <span>50x Ingress Surge: Asynchronous SQS Buffer Drain</span>
            </div>
            <span className="font-mono font-bold text-xs text-[#92400E]">
              {burstProgress.processed} / {burstProgress.total} Drained ({Math.round((burstProgress.processed / burstProgress.total) * 100)}%)
            </span>
          </div>
          <div className="w-full bg-[#EEECE6] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#F45B2A] h-full transition-all duration-300 rounded-full"
              style={{ width: `${(burstProgress.processed / burstProgress.total) * 100}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-[#85837E]">
            <span>Surge Rate: 50 msgs / sec</span>
            <span>Lambda Auto-Concurreny Active</span>
            <span>Buffer Remaining: {burstProgress.remaining} msgs</span>
          </div>
        </section>
      )}

      {/* Architectural Queue Comparison: Primary vs DLQ */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5 font-sans">
        
        {/* Primary TransactionQueue Card */}
        <div className="bg-white border border-[#D9D6CF] rounded-2xl p-6 shadow-bento flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#D9D6CF]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#171717] flex items-center justify-center text-white">
                  <Inbox className="w-4 h-4 text-[#236B43]" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-[#171717]">
                    Primary Transaction Queue
                  </h3>
                  <div className="text-[11px] text-[#85837E] font-mono">
                    CloudGuard-TransactionQueue
                  </div>
                </div>
              </div>

              <span className="font-mono text-[10px] bg-[#EDF7F0] text-[#236B43] border border-[#C6E7D2] px-2 py-0.5 rounded font-bold">
                ENCRYPTED (KMS)
              </span>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 bg-[#F5F3EF] border border-[#D9D6CF] rounded-xl space-y-1">
                <div className="text-[10px] text-[#85837E]">QUEUE URL</div>
                <div className="text-[#171717] truncate font-medium">
                  https://sqs.ap-south-1.amazonaws.com/739201845201/CloudGuard-TransactionQueue
                </div>
              </div>

              <div className="p-3 bg-[#F5F3EF] border border-[#D9D6CF] rounded-xl grid grid-cols-2 gap-2">
                <div>
                  <div className="text-[10px] text-[#85837E]">CURRENT DEPTH</div>
                  <div className="text-base font-bold text-[#171717]">{metrics.sqsQueueDepth} msgs</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#85837E]">DELIVERY DELAY</div>
                  <div className="text-base font-bold text-[#171717]">0 Seconds</div>
                </div>
              </div>

              <div className="p-3 bg-[#F5F3EF] border border-[#D9D6CF] rounded-xl space-y-1 text-[#403E39]">
                <div className="text-[10px] text-[#85837E] font-bold">REDRIVE POLICY:</div>
                <div>&bull; maxReceiveCount: 3 attempts</div>
                <div>&bull; deadLetterTargetArn: arn:aws:sqs:...:TransactionDLQ</div>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-4 border-t border-[#D9D6CF] text-xs text-[#85837E] font-mono flex items-center justify-between">
            <span>SQS VPC Gateway Endpoint: Active</span>
            <span className="text-[#236B43] font-bold">ZERO NAT EGRESS</span>
          </div>
        </div>

        {/* Dead-Letter Queue (TransactionDLQ) Card */}
        <div className="bg-white border border-[#D9D6CF] rounded-2xl p-6 shadow-bento flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#D9D6CF]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#171717] flex items-center justify-center text-white">
                  <Skull className="w-4 h-4 text-[#B91C1C]" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-[#171717]">
                    Quarantine Dead-Letter Queue (DLQ)
                  </h3>
                  <div className="text-[11px] text-[#85837E] font-mono">
                    CloudGuard-TransactionDLQ
                  </div>
                </div>
              </div>

              <span className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold border ${
                metrics.sqsDlqDepth > 0
                  ? 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]'
                  : 'bg-[#EDF7F0] text-[#236B43] border-[#C6E7D2]'
              }`}>
                {metrics.sqsDlqDepth > 0 ? 'QUARANTINE ACTIVE' : 'NOMINAL 0'}
              </span>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 bg-[#F5F3EF] border border-[#D9D6CF] rounded-xl space-y-1">
                <div className="text-[10px] text-[#85837E]">DLQ URL</div>
                <div className="text-[#171717] truncate font-medium">
                  https://sqs.ap-south-1.amazonaws.com/739201845201/CloudGuard-TransactionDLQ
                </div>
              </div>

              <div className="p-3 bg-[#F5F3EF] border border-[#D9D6CF] rounded-xl grid grid-cols-2 gap-2">
                <div>
                  <div className="text-[10px] text-[#85837E]">MESSAGES VISIBLE</div>
                  <div className={`text-base font-bold ${metrics.sqsDlqDepth > 0 ? 'text-[#B91C1C]' : 'text-[#171717]'}`}>
                    {metrics.sqsDlqDepth} msgs
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[#85837E]">RETENTION PERIOD</div>
                  <div className="text-base font-bold text-[#171717]">14 Days</div>
                </div>
              </div>

              <div className="p-3 bg-[#F5F3EF] border border-[#D9D6CF] rounded-xl space-y-1 text-[#403E39]">
                <div className="text-[10px] text-[#85837E] font-bold">CLOUDWATCH ALARM:</div>
                <div>&bull; AlarmName: CloudGuard-DLQMessagesVisibleAlarm</div>
                <div>&bull; Evaluation: Threshold &gt; 0 &rarr; Immediate SecOps SNS Alert</div>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-4 border-t border-[#D9D6CF] text-xs text-[#85837E] font-mono flex items-center justify-between">
            <span>Poison Pill Messages Quarantined:</span>
            <span className="text-[#171717] font-bold">{poisonPillTxns.length} items</span>
          </div>
        </div>

      </section>

      {/* Quarantined Poison Pill Records Table */}
      {poisonPillTxns.length > 0 && (
        <section className="bg-white border border-[#D9D6CF] rounded-2xl p-6 shadow-bento font-sans">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#D9D6CF]">
            <AlertTriangle className="w-4 h-4 text-[#B91C1C]" />
            <h3 className="font-display font-bold text-sm text-[#171717]">
              Quarantined Poison Pill Payload Inspector
            </h3>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {poisonPillTxns.map((p) => (
              <div
                key={p.transactionId}
                className="p-3 bg-[#FEF2F2]/60 border border-[#FECACA] rounded-xl space-y-1.5"
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="text-[#171717]">{p.transactionId}</span>
                  <span className="text-[#B91C1C]">3 RETRIES EXHAUSTED &rarr; DLQ</span>
                </div>
                <div className="text-[11px] text-[#85837E]">
                  Narration: <strong className="text-[#B91C1C]">{p.narration}</strong>
                </div>
                <div className="text-[10px] bg-white p-2 rounded border border-[#FECACA] break-all text-[#B91C1C]">
                  {`{"error": "DESERIALIZATION_FAILED", "cardToken": "${p.cardToken}", "cause": "Null byte injection attempt"}`}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
