'use client';

import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Search,
  Filter,
  CheckCircle2,
  ShieldAlert,
  Skull,
  Copy,
  Check,
  Send,
  Lock,
  Database,
  Table,
  ExternalLink
} from 'lucide-react';
import { BankAccount, Transaction, TransactionStatus } from '../types/cloud';

interface TransactionsViewProps {
  accounts: BankAccount[];
  transactions: Transaction[];
  selectedTxn: Transaction | null;
  onSelectTxn: (txn: Transaction) => void;
  onSubmitTransaction: (payload: any) => void;
  isProcessing: boolean;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  accounts,
  transactions,
  selectedTxn,
  onSelectTxn,
  onSubmitTransaction,
  isProcessing
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | TransactionStatus>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New transaction form state
  const [sender, setSender] = useState<string>(accounts[0]?.accountNumber || 'HDFC-00124891');
  const [receiver, setReceiver] = useState<string>(accounts[1]?.accountNumber || 'ICICI-00918234');
  const [amount, setAmount] = useState<number>(5000);
  const [narration, setNarration] = useState<string>('Vendor Wire Transfer');
  const [location, setLocation] = useState<string>('Mumbai, IN');

  const handleCopy = (text: string, id: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitTransaction({
      senderAccount: sender,
      receiverAccount: receiver,
      amount,
      cardToken: 'CARD-4532-8821-3490-8910',
      location,
      merchantCode: 'MCH-RETAIL-99',
      narration
    });
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((t) => {
    const matchesFilter = statusFilter === 'ALL' || t.status === statusFilter;
    const query = searchQuery.toLowerCase();
    const matchesQuery =
      t.transactionId.toLowerCase().includes(query) ||
      t.senderAccount.toLowerCase().includes(query) ||
      t.receiverAccount.toLowerCase().includes(query) ||
      t.narration.toLowerCase().includes(query) ||
      t.location.toLowerCase().includes(query);
    return matchesFilter && matchesQuery;
  });

  return (
    <div className="space-y-6">
      
      {/* Header & Metric Highlights */}
      <section className="bg-white border border-[#D9D6CF] rounded-2xl p-6 sm:p-8 shadow-bento font-sans">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#D9D6CF]">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#F45B2A] font-bold mb-1">
              FINTECH PERSISTENT TRANSACTION LEDGER
            </div>
            <h2 className="font-display font-extrabold text-2xl text-[#171717] tracking-tight">
              Transaction Ledger & Ingestion Stream
            </h2>
            <p className="text-xs text-[#73716B] mt-1">
              End-to-end auditability from ingress to RDS double-entry journal and DynamoDB compliance store.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="p-3 bg-[#F5F3EF] border border-[#D9D6CF] rounded-xl text-center">
              <div className="text-[10px] text-[#85837E]">TOTAL INGESTED</div>
              <div className="font-bold text-base text-[#171717]">{transactions.length}</div>
            </div>
            <div className="p-3 bg-[#F5F3EF] border border-[#D9D6CF] rounded-xl text-center">
              <div className="text-[10px] text-[#85837E]">COMMITTED</div>
              <div className="font-bold text-base text-[#236B43]">
                {transactions.filter((t) => t.status === 'COMMITTED').length}
              </div>
            </div>
            <div className="p-3 bg-[#F5F3EF] border border-[#D9D6CF] rounded-xl text-center">
              <div className="text-[10px] text-[#85837E]">BLOCKED</div>
              <div className="font-bold text-base text-[#B91C1C]">
                {transactions.filter((t) => t.status === 'FRAUD_BLOCKED').length}
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 min-w-[260px] max-w-md">
            <Search className="w-4 h-4 text-[#85837E] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Txn ID, Account, Narration, City..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#F5F3EF] border border-[#D9D6CF] rounded-xl text-[#171717] font-mono text-xs focus:outline-none focus:border-[#171717]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
            {(['ALL', 'COMMITTED', 'FRAUD_BLOCKED', 'POISON_PILL_DLQ'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl transition-all font-semibold border ${
                  statusFilter === status
                    ? 'bg-[#171717] text-white border-[#171717]'
                    : 'bg-[#F5F3EF] text-[#73716B] border-[#D9D6CF] hover:bg-[#EEECE6] hover:text-[#171717]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Grid: Transactions Table (Left) + Detailed Inspector & Dispatch (Right) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Table Column (col-span-8) */}
        <div className="lg:col-span-8 bg-white border border-[#D9D6CF] rounded-2xl shadow-bento overflow-hidden flex flex-col font-sans">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#D9D6CF] bg-[#F5F3EF]/70 font-mono text-[10px] text-[#85837E] uppercase">
                  <th className="py-3 px-4 font-bold">Transaction ID</th>
                  <th className="py-3 px-4 font-bold">Accounts</th>
                  <th className="py-3 px-4 font-bold">Narration</th>
                  <th className="py-3 px-4 font-bold text-right">Amount (₹)</th>
                  <th className="py-3 px-4 font-bold text-center">Latency</th>
                  <th className="py-3 px-4 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9D6CF]">
                {filteredTransactions.map((t) => {
                  const isSelected = selectedTxn?.transactionId === t.transactionId;
                  return (
                    <tr
                      key={t.transactionId}
                      onClick={() => onSelectTxn(t)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#FFF3EE]'
                          : 'hover:bg-[#F5F3EF]/60'
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-[#171717]">
                        <div className="flex items-center gap-1.5">
                          <span>{t.transactionId}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(t.transactionId, t.transactionId);
                            }}
                            className="text-[#85837E] hover:text-[#171717] p-0.5"
                            title="Copy ID"
                          >
                            {copiedId === t.transactionId ? (
                              <Check className="w-3 h-3 text-[#236B43]" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <div className="text-[10px] text-[#85837E] font-normal">
                          {new Date(t.timestamp).toLocaleTimeString()}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px]">
                        <div className="text-[#171717]">{t.senderAccount}</div>
                        <div className="text-[#85837E]">&darr; {t.receiverAccount}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-[#171717] font-medium truncate max-w-[180px]">{t.narration}</div>
                        <div className="text-[10px] text-[#85837E] font-mono">{t.location}</div>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-[#171717]">
                        ₹{t.amount.toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-center font-mono text-[11px] text-[#73716B]">
                        {t.latencyMs}ms
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                            t.status === 'COMMITTED'
                              ? 'bg-[#EDF7F0] text-[#236B43] border border-[#C6E7D2]'
                              : t.status === 'FRAUD_BLOCKED'
                              ? 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]'
                              : 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="p-8 text-center text-xs text-[#85837E]">
              No transactions match the selected filter or search term.
            </div>
          )}
        </div>

        {/* Selected Transaction Deep Inspector (col-span-4) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Selected Inspector Card */}
          <div className="bg-white border border-[#D9D6CF] rounded-2xl p-5 shadow-bento font-sans">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#D9D6CF]">
              <div className="font-display font-bold text-sm text-[#171717]">
                Transaction Inspector
              </div>
              <span className="text-[10px] font-mono bg-[#EEECE6] text-[#403E39] px-2 py-0.5 rounded">
                {selectedTxn?.transactionId || 'None'}
              </span>
            </div>

            {selectedTxn ? (
              <div className="space-y-3 text-xs">
                {/* Status & Amount */}
                <div className="p-3 bg-[#F5F3EF] border border-[#D9D6CF] rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-[#85837E] font-mono">STATUS</div>
                    <div className={`font-mono font-bold ${
                      selectedTxn.status === 'COMMITTED'
                        ? 'text-[#236B43]'
                        : 'text-[#B91C1C]'
                    }`}>
                      {selectedTxn.status}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-[#85837E] font-mono">AMOUNT</div>
                    <div className="font-display font-bold text-lg text-[#171717]">
                      ₹{selectedTxn.amount.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Cryptographic Diff */}
                <div className="p-3 bg-[#F5F3EF] border border-[#D9D6CF] rounded-xl space-y-2 font-mono text-[11px]">
                  <div className="text-[10px] font-bold text-[#85837E] uppercase flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#F45B2A]" />
                    <span>KMS Envelope Cryptography</span>
                  </div>

                  <div>
                    <span className="text-[#85837E]">Masked PAN: </span>
                    <span className="font-bold text-[#171717]">{selectedTxn.kmsEnvelope.plaintextMasked}</span>
                  </div>

                  <div>
                    <span className="text-[#85837E]">Algorithm: </span>
                    <span className="text-[#236B43] font-semibold">{selectedTxn.kmsEnvelope.algorithm}</span>
                  </div>

                  <div>
                    <span className="text-[#85837E] block mb-0.5">CiphertextBlob (Disk):</span>
                    <span className="block bg-white p-2 rounded border border-[#D9D6CF] text-[10px] break-all text-[#403E39]">
                      {selectedTxn.kmsEnvelope.ciphertextBlob}
                    </span>
                  </div>
                </div>

                {/* RDS SQL Double Entry Journal */}
                {selectedTxn.rdsLedger && (
                  <div className="p-3 bg-[#F5F3EF] border border-[#D9D6CF] rounded-xl space-y-1.5 font-mono text-[11px]">
                    <div className="text-[10px] font-bold text-[#85837E] uppercase flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-[#236B43]" />
                      <span>RDS PostgreSQL ACID Journal</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#85837E]">Journal ID:</span>
                      <span className="font-bold text-[#171717]">{selectedTxn.rdsLedger.journalId}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#85837E]">Isolation:</span>
                      <span className="text-[#236B43] font-semibold">{selectedTxn.rdsLedger.isolationLevel}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#85837E]">DB Duration:</span>
                      <span className="text-[#171717]">{selectedTxn.rdsLedger.executionDurationMs}ms</span>
                    </div>
                  </div>
                )}

                {/* DynamoDB Item Preview */}
                {selectedTxn.dynamoAudit && (
                  <div className="p-3 bg-[#F5F3EF] border border-[#D9D6CF] rounded-xl space-y-1.5 font-mono text-[11px]">
                    <div className="text-[10px] font-bold text-[#85837E] uppercase flex items-center gap-1.5">
                      <Table className="w-3.5 h-3.5 text-[#1E40AF]" />
                      <span>DynamoDB NoSQL Item</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#85837E]">Partition Key:</span>
                      <span className="font-bold text-[#171717]">{selectedTxn.dynamoAudit.transactionId}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#85837E]">Retention TTL:</span>
                      <span className="text-[#403E39]">365 Days</span>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="p-6 text-center text-xs text-[#85837E]">
                Select a transaction to inspect its cryptographic and persistence record.
              </div>
            )}
          </div>

          {/* Quick Dispatch Panel */}
          <div className="bg-white border border-[#D9D6CF] rounded-2xl p-5 shadow-bento font-sans">
            <div className="font-display font-bold text-sm text-[#171717] pb-2 mb-3 border-b border-[#D9D6CF]">
              Quick Transaction Dispatch
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-2.5 text-xs">
              <div>
                <label className="text-[10px] font-mono text-[#85837E] block mb-1">Sender</label>
                <select
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  className="w-full bg-[#F5F3EF] border border-[#D9D6CF] rounded-lg px-2.5 py-1.5 text-[#171717] font-mono text-xs focus:outline-none focus:border-[#171717]"
                >
                  {accounts.map((acc) => (
                    <option key={acc.accountNumber} value={acc.accountNumber}>
                      {acc.accountNumber} ({acc.bank.split(' ')[0]})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-[#85837E] block mb-1">Receiver</label>
                <select
                  value={receiver}
                  onChange={(e) => setReceiver(e.target.value)}
                  className="w-full bg-[#F5F3EF] border border-[#D9D6CF] rounded-lg px-2.5 py-1.5 text-[#171717] font-mono text-xs focus:outline-none focus:border-[#171717]"
                >
                  {accounts.map((acc) => (
                    <option key={acc.accountNumber} value={acc.accountNumber}>
                      {acc.accountNumber} ({acc.bank.split(' ')[0]})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-[#85837E] block mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-[#F5F3EF] border border-[#D9D6CF] rounded-lg px-2.5 py-1.5 text-[#171717] font-mono text-xs focus:outline-none focus:border-[#171717]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-[#85837E] block mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-[#F5F3EF] border border-[#D9D6CF] rounded-lg px-2.5 py-1.5 text-[#171717] font-mono text-xs focus:outline-none focus:border-[#171717]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full btn-accent font-semibold py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-subtle disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Wire Transfer</span>
              </button>
            </form>
          </div>

        </div>

      </section>

    </div>
  );
};
