'use client';

import React, { useState } from 'react';
import {
  Send,
  Zap,
  ShieldAlert,
  Skull,
  CheckCircle2,
  RefreshCw,
  CreditCard,
  ArrowRight
} from 'lucide-react';
import { BankAccount, Transaction } from '../types/cloud';

interface TransactionTerminalProps {
  accounts: BankAccount[];
  transactions: Transaction[];
  selectedTxn: Transaction | null;
  onSelectTxn: (txn: Transaction) => void;
  onSubmitTransaction: (payload: {
    senderAccount: string;
    receiverAccount: string;
    amount: number;
    cardToken: string;
    location: string;
    merchantCode: string;
    narration: string;
    forceFraudAnomaly?: boolean;
    forcePoisonPill?: boolean;
  }) => void;
  onTriggerBurst: () => void;
  isProcessing: boolean;
  burstProgress: { active: boolean; total: number; processed: number; remaining: number } | null;
}

export const TransactionTerminal: React.FC<TransactionTerminalProps> = ({
  accounts,
  transactions,
  selectedTxn,
  onSelectTxn,
  onSubmitTransaction,
  onTriggerBurst,
  isProcessing,
  burstProgress
}) => {
  const [sender, setSender] = useState<string>(accounts[0]?.accountNumber || 'HDFC-00124891');
  const [receiver, setReceiver] = useState<string>(accounts[1]?.accountNumber || 'ICICI-00918234');
  const [amount, setAmount] = useState<number>(4500);
  const [cardToken, setCardToken] = useState<string>('CARD-4532-8821-3490-8910');
  const [location, setLocation] = useState<string>('Mumbai, IN');
  const [merchantCode, setMerchantCode] = useState<string>('MCH-RETAIL-99');
  const [narration, setNarration] = useState<string>('Merchant Vendor Settlement');

  const handleStandardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitTransaction({
      senderAccount: sender,
      receiverAccount: receiver,
      amount,
      cardToken,
      location,
      merchantCode,
      narration
    });
  };

  const handleFraudTrigger = () => {
    onSubmitTransaction({
      senderAccount: sender,
      receiverAccount: receiver,
      amount: 245000,
      cardToken: 'CARD-4111-9981-2231-5501',
      location: 'Kyiv, UA (Offshore Proxy)',
      merchantCode: 'MCH-OFFSHORE-99',
      narration: 'Offshore Escrow Transfer',
      forceFraudAnomaly: true
    });
  };

  const handlePoisonPillTrigger = () => {
    onSubmitTransaction({
      senderAccount: sender,
      receiverAccount: receiver,
      amount: 1500,
      cardToken: 'POISON_PILL_NULL_BYTE_EXPLOIT',
      location: 'UNKNOWN_TOR_EXIT',
      merchantCode: 'MCH-EXPLOIT-00',
      narration: 'MALFORMED_NON_DESERIALIZABLE_PAYLOAD',
      forcePoisonPill: true
    });
  };

  return (
    <div className="bg-white border border-[#D9D6CF] rounded-2xl p-5 sm:p-6 flex flex-col h-full shadow-bento font-sans">
      
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-[#D9D6CF]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#171717] flex items-center justify-center text-white">
            <CreditCard className="w-4 h-4 text-[#F45B2A]" />
          </div>
          <div>
            <h2 className="font-display font-bold text-sm text-[#171717] tracking-tight">
              Transaction Ingress Terminal
            </h2>
            <p className="text-xs text-[#85837E]">
              Asynchronous ingress & pipeline stress demonstrations
            </p>
          </div>
        </div>
        <span className="font-mono text-[10px] bg-[#EEECE6] text-[#403E39] font-bold px-2 py-0.5 rounded border border-[#D9D6CF]">
          PORT 3000 / ALB
        </span>
      </div>

      {/* 4 One-Click Demonstration Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        
        {/* Action 1: Standard Transfer */}
        <button
          onClick={() => {
            setAmount(4500);
            onSubmitTransaction({
              senderAccount: 'HDFC-00124891',
              receiverAccount: 'ICICI-00918234',
              amount: 4500,
              cardToken: 'CARD-4532-8821-3490-8910',
              location: 'Mumbai, IN',
              merchantCode: 'MCH-RETAIL-99',
              narration: 'Standard Vendor Settlement'
            });
          }}
          disabled={isProcessing}
          className="flex flex-col items-start p-2.5 bg-[#F5F3EF] hover:bg-white border border-[#D9D6CF] hover:border-[#171717] rounded-xl transition-all text-left group shadow-subtle disabled:opacity-40"
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#171717] mb-0.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#236B43]" />
            <span>Standard</span>
          </div>
          <div className="text-[10px] text-[#85837E] font-mono">₹4,500 normal flow</div>
        </button>

        {/* Action 2: 50x Traffic Burst */}
        <button
          onClick={onTriggerBurst}
          disabled={isProcessing || (burstProgress?.active ?? false)}
          className="flex flex-col items-start p-2.5 bg-[#F5F3EF] hover:bg-white border border-[#D9D6CF] hover:border-[#F45B2A] rounded-xl transition-all text-left group shadow-subtle disabled:opacity-40"
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#171717] mb-0.5">
            <Zap className="w-3.5 h-3.5 text-[#F45B2A]" />
            <span>50x Burst</span>
          </div>
          <div className="text-[10px] text-[#85837E] font-mono">SQS buffer soak</div>
        </button>

        {/* Action 3: Trigger Fraud Anomaly */}
        <button
          onClick={handleFraudTrigger}
          disabled={isProcessing}
          className="flex flex-col items-start p-2.5 bg-[#F5F3EF] hover:bg-white border border-[#D9D6CF] hover:border-[#B91C1C] rounded-xl transition-all text-left group shadow-subtle disabled:opacity-40"
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#171717] mb-0.5">
            <ShieldAlert className="w-3.5 h-3.5 text-[#B91C1C]" />
            <span>₹2.45L Fraud</span>
          </div>
          <div className="text-[10px] text-[#85837E] font-mono">SNS alert + halt</div>
        </button>

        {/* Action 4: Inject Poison Pill */}
        <button
          onClick={handlePoisonPillTrigger}
          disabled={isProcessing}
          className="flex flex-col items-start p-2.5 bg-[#F5F3EF] hover:bg-white border border-[#D9D6CF] hover:border-[#92400E] rounded-xl transition-all text-left group shadow-subtle disabled:opacity-40"
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#171717] mb-0.5">
            <Skull className="w-3.5 h-3.5 text-[#92400E]" />
            <span>Poison Pill</span>
          </div>
          <div className="text-[10px] text-[#85837E] font-mono">3 retries &rarr; DLQ</div>
        </button>

      </div>

      {/* SQS Drain Progress Indicator */}
      {burstProgress?.active && (
        <div className="mb-4 p-3 bg-[#FEF3C7]/60 border border-[#FDE68A] rounded-xl text-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[#92400E] font-semibold flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-[#F45B2A] animate-spin" />
              Asynchronous SQS Drain in Progress...
            </span>
            <span className="text-[#92400E] font-mono font-bold">
              {burstProgress.processed} / {burstProgress.total} Drained
            </span>
          </div>
          <div className="w-full bg-[#EEECE6] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#F45B2A] h-full transition-all duration-300 rounded-full"
              style={{ width: `${(burstProgress.processed / burstProgress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Custom Transaction Dispatch Form */}
      <form onSubmit={handleStandardSubmit} className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-xs">
        <div>
          <label className="text-[10px] font-mono uppercase tracking-wider text-[#85837E] block mb-1">
            Sender Account
          </label>
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
          <label className="text-[10px] font-mono uppercase tracking-wider text-[#85837E] block mb-1">
            Receiver Account
          </label>
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

        <div>
          <label className="text-[10px] font-mono uppercase tracking-wider text-[#85837E] block mb-1">
            Amount (INR ₹)
          </label>
          <input
            type="number"
            min="100"
            step="100"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full bg-[#F5F3EF] border border-[#D9D6CF] rounded-lg px-2.5 py-1.5 text-[#171717] font-mono text-xs focus:outline-none focus:border-[#171717]"
          />
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full btn-accent font-semibold py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-subtle disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Dispatch</span>
          </button>
        </div>
      </form>

      {/* Transaction Feed */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="text-[10px] uppercase font-mono tracking-wider text-[#85837E] font-bold mb-2 flex items-center justify-between">
          <span>Live Ingestion Feed</span>
          <span className="font-mono text-[10px] bg-[#EEECE6] text-[#403E39] px-2 py-0.5 rounded">
            {transactions.length} Total
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[220px]">
          {transactions.map((txn) => {
            const isSelected = selectedTxn?.transactionId === txn.transactionId;
            return (
              <div
                key={txn.transactionId}
                onClick={() => onSelectTxn(txn)}
                className={`p-2.5 rounded-xl border cursor-pointer text-xs transition-all ${
                  isSelected
                    ? 'bg-[#FFF3EE] border-[#F45B2A] shadow-subtle ring-1 ring-[#F45B2A]/20'
                    : 'bg-[#F5F3EF]/60 hover:bg-white border-[#D9D6CF]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#171717]">{txn.transactionId}</span>
                    <span className="text-[10px] text-[#85837E] font-mono">
                      {txn.senderAccount} &rarr; {txn.receiverAccount}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#171717] font-mono font-bold">
                      ₹{txn.amount.toLocaleString()}
                    </span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                        txn.status === 'COMMITTED'
                          ? 'bg-[#EDF7F0] text-[#236B43] border border-[#C6E7D2]'
                          : txn.status === 'FRAUD_BLOCKED'
                          ? 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]'
                          : 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
                      }`}
                    >
                      {txn.status}
                    </span>
                  </div>
                </div>

                <div className="mt-1 flex items-center justify-between text-[11px] text-[#85837E]">
                  <span className="truncate max-w-[280px]">
                    {txn.narration} • {txn.location}
                  </span>
                  <span className="font-mono text-[10px]">
                    Latency: <strong className="text-[#171717]">{txn.latencyMs}ms</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
