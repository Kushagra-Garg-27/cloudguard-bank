'use client';

import React, { useState } from 'react';
import { Database, Table, ArrowLeftRight, CheckCircle2, Lock, ShieldCheck } from 'lucide-react';
import { BankAccount, Transaction } from '../types/cloud';

interface PolyglotDbViewerProps {
  accounts: BankAccount[];
  transactions: Transaction[];
  selectedTxn: Transaction | null;
}

export const PolyglotDbViewer: React.FC<PolyglotDbViewerProps> = ({
  accounts,
  transactions,
  selectedTxn
}) => {
  const [activeTab, setActiveTab] = useState<'SPLIT' | 'RDS' | 'DYNAMO'>('SPLIT');
  const committedRdsTxns = transactions.filter((t) => t.rdsLedger !== null);

  return (
    <div className="space-y-6">
      
      {/* Header & Architecture Context Strip */}
      <section className="bg-white border border-[#D9D6CF] rounded-2xl p-6 sm:p-8 shadow-bento font-sans">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#D9D6CF]">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#F45B2A] font-bold mb-1">
              POLYGLOT PERSISTENCE ARCHITECTURE
            </div>
            <h2 className="font-display font-extrabold text-2xl text-[#171717] tracking-tight">
              Relational ACID Ledger vs NoSQL Compliance Store
            </h2>
            <p className="text-xs text-[#73716B] mt-1">
              Architectural separation of concerns: Strong consistency for banking mutations and eventual consistency for high-throughput compliance audits.
            </p>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className="text-[#85837E] text-[10px] mr-1 hidden sm:inline">VIEW:</span>
            {(['SPLIT', 'RDS', 'DYNAMO'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  activeTab === tab
                    ? 'bg-[#171717] text-white border-[#171717]'
                    : 'bg-[#F5F3EF] text-[#73716B] border-[#D9D6CF] hover:bg-[#EEECE6] hover:text-[#171717]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Persistence Summary Pills */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 pt-4">
          <div className="p-3 bg-[#F5F3EF] border border-[#D9D6CF] rounded-xl font-mono text-xs">
            <div className="text-[10px] text-[#85837E]">RDS CONSISTENCY</div>
            <div className="font-bold text-[#171717] mt-0.5">ACID Serializable</div>
            <div className="text-[10px] text-[#236B43] mt-0.5">Zero Phantom Reads</div>
          </div>
          <div className="p-3 bg-[#F5F3EF] border border-[#D9D6CF] rounded-xl font-mono text-xs">
            <div className="text-[10px] text-[#85837E]">DYNAMODB CONSISTENCY</div>
            <div className="font-bold text-[#171717] mt-0.5">BASE Eventual</div>
            <div className="text-[10px] text-[#403E39] mt-0.5">Sub-5ms Write Latency</div>
          </div>
          <div className="p-3 bg-[#F5F3EF] border border-[#D9D6CF] rounded-xl font-mono text-xs">
            <div className="text-[10px] text-[#85837E]">RDS REPLICATION</div>
            <div className="font-bold text-[#171717] mt-0.5">Multi-AZ Standby</div>
            <div className="text-[10px] text-[#85837E] mt-0.5">Synchronous Block-Level</div>
          </div>
          <div className="p-3 bg-[#F5F3EF] border border-[#D9D6CF] rounded-xl font-mono text-xs">
            <div className="text-[10px] text-[#85837E]">COMPLIANCE RETENTION</div>
            <div className="font-bold text-[#171717] mt-0.5">365-Day TTL Epoch</div>
            <div className="text-[10px] text-[#236B43] mt-0.5">Zero Maintenance Purge</div>
          </div>
        </div>
      </section>

      {/* Main Split / Full Views */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 font-sans">
        
        {/* =========================================================================
            LEFT COLUMN: Amazon RDS PostgreSQL (ACID Ledger)
           ========================================================================= */}
        {(activeTab === 'SPLIT' || activeTab === 'RDS') && (
          <div className={`bg-white border border-[#D9D6CF] rounded-2xl p-6 shadow-bento flex flex-col justify-between ${activeTab === 'RDS' ? 'lg:col-span-2' : ''}`}>
            <div>
              {/* RDS Header */}
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#D9D6CF]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#171717] flex items-center justify-center text-white">
                    <Database className="w-4 h-4 text-[#236B43]" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm text-[#171717]">
                      Amazon RDS PostgreSQL 15.4
                    </h3>
                    <div className="text-[11px] text-[#85837E] font-mono">
                      Subnet: Private Data (10.0.20.42)
                    </div>
                  </div>
                </div>

                <span className="font-mono text-[10px] bg-[#EDF7F0] text-[#236B43] border border-[#C6E7D2] px-2 py-0.5 rounded font-bold">
                  STRONG CONSISTENCY (ACID)
                </span>
              </div>

              {/* Live Bank Balances Table (ACID Mutation) */}
              <div className="mb-4">
                <div className="text-[10px] uppercase font-mono tracking-wider font-bold text-[#85837E] mb-2 flex items-center justify-between">
                  <span>Account Ledger Balances</span>
                  <span className="text-[#236B43] text-[9px] bg-[#EDF7F0] border border-[#C6E7D2] px-1.5 py-0.2 rounded">
                    SERIALIZABLE ISOLATION
                  </span>
                </div>

                <div className="space-y-1.5">
                  {accounts.map((acc) => (
                    <div
                      key={acc.accountNumber}
                      className="p-2.5 px-3 bg-[#F5F3EF] rounded-xl border border-[#D9D6CF] flex items-center justify-between text-xs font-mono"
                    >
                      <div>
                        <span className="font-bold text-[#171717]">{acc.accountNumber}</span>
                        <span className="text-[#85837E] text-[11px] ml-2 font-sans">({acc.holderName})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#171717] tabular-nums text-sm">
                          ₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#236B43]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Double-Entry Journal Stream */}
              <div className="space-y-2">
                <div className="text-[10px] uppercase font-mono tracking-wider font-bold text-[#85837E] flex items-center justify-between">
                  <span>Committed Journal Entries (`BEGIN; ... COMMIT;`)</span>
                  <span>{committedRdsTxns.length} Journal Records</span>
                </div>

                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                  {committedRdsTxns.map((t) => (
                    <div
                      key={t.transactionId}
                      className="p-2.5 bg-[#F5F3EF] rounded-xl border border-[#D9D6CF] text-xs font-mono"
                    >
                      <div className="flex items-center justify-between font-bold mb-0.5">
                        <span className="text-[#F45B2A]">{t.rdsLedger?.journalId}</span>
                        <span className="text-[#171717]">₹{t.amount.toLocaleString()}</span>
                      </div>
                      <div className="text-[10px] text-[#85837E] truncate">
                        DEBIT {t.senderAccount} &rarr; CREDIT {t.receiverAccount} • {t.rdsLedger?.executionDurationMs}ms
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 mt-4 border-t border-[#D9D6CF] text-xs text-[#85837E] font-mono flex items-center justify-between">
              <span>Automated Daily Snapshot:</span>
              <span className="text-[#236B43] font-bold">cloudguard-auto-snap</span>
            </div>
          </div>
        )}

        {/* =========================================================================
            RIGHT COLUMN: Amazon DynamoDB (NoSQL Audit Store)
           ========================================================================= */}
        {(activeTab === 'SPLIT' || activeTab === 'DYNAMO') && (
          <div className={`bg-white border border-[#D9D6CF] rounded-2xl p-6 shadow-bento flex flex-col justify-between ${activeTab === 'DYNAMO' ? 'lg:col-span-2' : ''}`}>
            <div>
              {/* DynamoDB Header */}
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#D9D6CF]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#171717] flex items-center justify-center text-white">
                    <Table className="w-4 h-4 text-[#1E40AF]" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm text-[#171717]">
                      Amazon DynamoDB Compliance Table
                    </h3>
                    <div className="text-[11px] text-[#85837E] font-mono">
                      PK: transactionId (S) | SK: timestamp (N)
                    </div>
                  </div>
                </div>

                <span className="font-mono text-[10px] bg-[#EFF6FF] text-[#1E40AF] border border-[#DBEAFE] px-2 py-0.5 rounded font-bold">
                  EVENTUAL CONSISTENCY (BASE)
                </span>
              </div>

              {/* High-Throughput JSON Document Items */}
              <div className="space-y-2">
                <div className="text-[10px] uppercase font-mono tracking-wider font-bold text-[#85837E] flex items-center justify-between">
                  <span>Immutable Compliance Document Items (JSON)</span>
                  <span className="text-[#236B43] font-semibold">KMS CIPHER ATTACHED</span>
                </div>

                <div className="space-y-2.5 max-h-[310px] overflow-y-auto pr-1 text-xs font-mono">
                  {transactions.map((t) => (
                    <div
                      key={t.transactionId}
                      className="p-3 bg-[#F5F3EF] rounded-xl border border-[#D9D6CF]"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-[#171717]">{t.transactionId}</span>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                            t.dynamoAudit?.status === 'APPROVED'
                              ? 'text-[#236B43] bg-[#EDF7F0] border border-[#C6E7D2]'
                              : 'text-[#B91C1C] bg-[#FEF2F2] border border-[#FECACA]'
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>

                      <div className="bg-[#171717] text-[#EEECE6] p-2.5 rounded-lg font-mono text-[10px] overflow-x-auto leading-relaxed">
                        {`{ "pk": "${t.transactionId}", "sk": ${t.dynamoAudit?.timestamp || Date.now()}, "amount": ${t.amount}, "fraudScore": ${t.fraudScore}, "kmsKey": "alias/cloudguard-fintech-key", "ttl": ${t.dynamoAudit?.ttlEpoch || 1826334812} }`}
                      </div>

                      <div className="mt-2 flex items-center justify-between text-[10px] text-[#85837E]">
                        <span>Write Latency: <strong className="text-[#171717]">{t.dynamoAudit?.writeLatencyMs || 4}ms</strong></span>
                        <span className="font-semibold text-[#403E39]">365-Day Automated TTL</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 mt-4 border-t border-[#D9D6CF] text-xs text-[#85837E] font-mono flex items-center justify-between">
              <span>Billing Mode: PAY_PER_REQUEST</span>
              <span className="text-[#236B43] font-bold">ZERO IDLE COST</span>
            </div>
          </div>
        )}

      </section>

    </div>
  );
};
