'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Key,
  BellRing,
  AlertTriangle,
  Copy,
  Check,
  Zap,
  Activity,
  ArrowRight
} from 'lucide-react';
import { CloudTrailEvent, Transaction } from '../types/cloud';

interface FraudSecurityViewProps {
  transactions: Transaction[];
  selectedTxn: Transaction | null;
  onSelectTxn: (txn: Transaction) => void;
  cloudTrailEvents: CloudTrailEvent[];
  onTriggerFraud: () => void;
  isProcessing: boolean;
}

export const FraudSecurityView: React.FC<FraudSecurityViewProps> = ({
  transactions,
  selectedTxn,
  onSelectTxn,
  cloudTrailEvents,
  onTriggerFraud,
  isProcessing
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const copyToClipboard = (text: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const flaggedTransactions = transactions.filter((t) => t.status === 'FRAUD_BLOCKED');
  const maxFraudScore = Math.max(...transactions.map((t) => t.fraudScore), 0);
  const targetTxn = selectedTxn || flaggedTransactions[0] || transactions[0];

  return (
    <div className="space-y-6">
      
      {/* Header & Metrics Strip */}
      <section className="bg-white border border-[#D9D6CF] rounded-2xl p-6 sm:p-8 shadow-bento font-sans">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#D9D6CF]">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#F45B2A] font-bold mb-1">
              AI ANOMALY EVALUATION & CRYPTOGRAPHY
            </div>
            <h2 className="font-display font-extrabold text-2xl text-[#171717] tracking-tight">
              Fraud Detection & KMS SecOps Engine
            </h2>
            <p className="text-xs text-[#73716B] mt-1">
              Deterministic Lambda worker anomaly scoring, envelope encryption with AWS KMS CMK, and SNS SecOps alerting.
            </p>
          </div>

          {/* Trigger Fraud Demonstration Button */}
          <div>
            <button
              onClick={onTriggerFraud}
              disabled={isProcessing}
              className="px-4 py-2.5 bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FECACA] hover:border-[#B91C1C] text-[#B91C1C] rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 shadow-subtle disabled:opacity-40"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>TRIGGER ₹2.45L FRAUD TEST</span>
            </button>
          </div>
        </div>

        {/* 4 Fraud & Cryptography Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 pt-4">
          <div className="p-3.5 bg-[#F5F3EF] border border-[#D9D6CF] rounded-xl font-mono">
            <div className="text-[10px] text-[#85837E]">FRAUD THRESHOLD</div>
            <div className="text-xl font-bold text-[#171717] mt-0.5">SCORE &gt; 65</div>
            <div className="text-[10px] text-[#236B43] mt-0.5">Automated SNS Tripwire</div>
          </div>

          <div className="p-3.5 bg-[#F5F3EF] border border-[#D9D6CF] rounded-xl font-mono">
            <div className="text-[10px] text-[#85837E]">FLAGGED ANOMALIES</div>
            <div className="text-xl font-bold text-[#B91C1C] mt-0.5">{flaggedTransactions.length} Blocked</div>
            <div className="text-[10px] text-[#85837E] mt-0.5">Zero Unauthorized Outflow</div>
          </div>

          <div className="p-3.5 bg-[#F5F3EF] border border-[#D9D6CF] rounded-xl font-mono">
            <div className="text-[10px] text-[#85837E]">PEAK ANOMALY SCORE</div>
            <div className="text-xl font-bold text-[#F45B2A] mt-0.5">{maxFraudScore} / 100</div>
            <div className="text-[10px] text-[#85837E] mt-0.5">Offshore Tor Proxy Trip</div>
          </div>

          <div className="p-3.5 bg-[#F5F3EF] border border-[#D9D6CF] rounded-xl font-mono">
            <div className="text-[10px] text-[#85837E]">KMS KEY ROTATION</div>
            <div className="text-xl font-bold text-[#236B43] mt-0.5">AES-256-GCM</div>
            <div className="text-[10px] text-[#85837E] mt-0.5">PCI-DSS v4.0 Req 3.4</div>
          </div>
        </div>
      </section>

      {/* Main Grid: KMS Diff Inspector (Left) + Flagged Transactions & SNS Bus (Right) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 font-sans">
        
        {/* Left Column: KMS Envelope Encryption Diff (col-span-7) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="bg-white border border-[#D9D6CF] rounded-2xl p-6 shadow-bento">
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#D9D6CF]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#171717] flex items-center justify-center text-white">
                  <Key className="w-4 h-4 text-[#F45B2A]" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-[#171717]">
                    KMS Envelope Encryption Diff
                  </h3>
                  <p className="text-xs text-[#85837E]">
                    Cryptographic isolation between in-flight payload and persistent ciphertext
                  </p>
                </div>
              </div>

              <span className="font-mono text-[10px] bg-[#EEECE6] text-[#403E39] font-bold px-2 py-0.5 rounded">
                {targetTxn?.transactionId || 'None'}
              </span>
            </div>

            {targetTxn ? (
              <div className="space-y-4">
                
                {/* Side-by-side Payload Diff */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                  
                  {/* Left: Memory Plaintext (Masked) */}
                  <div className="p-4 bg-[#FEF2F2]/60 border border-[#FECACA] rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#B91C1C]">
                      <span>MEMORY / IN-TRANSIT</span>
                      <span>TLS 1.3 PORT 443</span>
                    </div>

                    <div className="space-y-1.5 font-mono text-[11px]">
                      <div>
                        <span className="text-[#85837E]">Masked PAN: </span>
                        <span className="text-[#171717] font-bold">{targetTxn.kmsEnvelope.plaintextMasked}</span>
                      </div>
                      <div>
                        <span className="text-[#85837E]">Account: </span>
                        <span className="text-[#171717]">{targetTxn.senderAccount}</span>
                      </div>
                      <div>
                        <span className="text-[#85837E]">Amount: </span>
                        <span className="text-[#171717] font-bold">₹{targetTxn.amount.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[#85837E]">Narration: </span>
                        <span className="text-[#403E39]">{targetTxn.narration}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#FECACA] text-[10px] text-[#B91C1C] flex items-center gap-1 font-mono">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Unencrypted storage on disk violates PCI-DSS & GDPR.</span>
                    </div>
                  </div>

                  {/* Right: KMS Ciphertext Blob */}
                  <div className="p-4 bg-[#EDF7F0]/60 border border-[#C6E7D2] rounded-xl space-y-2 relative">
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#236B43]">
                      <span>KMS CMK CIPHERTEXT</span>
                      <button
                        onClick={() => copyToClipboard(targetTxn.kmsEnvelope.ciphertextBlob)}
                        className="text-[#85837E] hover:text-[#171717] p-0.5"
                        title="Copy Ciphertext"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-[#236B43]" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="space-y-1.5 font-mono text-[11px]">
                      <div>
                        <span className="text-[#85837E]">Key Alias: </span>
                        <span className="text-[#171717] font-bold">{targetTxn.kmsEnvelope.keyAlias}</span>
                      </div>
                      <div>
                        <span className="text-[#85837E]">Algorithm: </span>
                        <span className="text-[#236B43] font-semibold">{targetTxn.kmsEnvelope.algorithm}</span>
                      </div>
                      <div>
                        <span className="text-[#85837E]">KMS Latency: </span>
                        <span className="text-[#171717]">{targetTxn.kmsEnvelope.kmsLatencyMs}ms</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#C6E7D2]">
                      <span className="text-[10px] font-mono text-[#85837E] block mb-1">CiphertextBlob (Disk):</span>
                      <div className="bg-white p-2 rounded border border-[#C6E7D2] text-[10px] font-mono break-all text-[#236B43] leading-relaxed">
                        {targetTxn.kmsEnvelope.ciphertextBlob}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Encryption Context Verification Box */}
                <div className="p-3 bg-[#F5F3EF] border border-[#D9D6CF] rounded-xl font-mono text-xs">
                  <div className="text-[10px] text-[#85837E] font-bold uppercase mb-1">
                    Cryptographic Encryption Context:
                  </div>
                  <div className="text-[11px] text-[#403E39]">
                    {JSON.stringify(targetTxn.kmsEnvelope.encryptionContext, null, 2)}
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-8 text-center text-xs text-[#85837E]">
                Select a transaction from the list to view cryptographic diff
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Flagged Transactions Log & SNS Topic (col-span-5) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Flagged Transactions Bento Card */}
          <div className="bg-white border border-[#D9D6CF] rounded-2xl p-5 shadow-bento">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#D9D6CF]">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#B91C1C]" />
                <h3 className="font-display font-bold text-sm text-[#171717]">
                  Flagged High-Risk Anomalies
                </h3>
              </div>
              <span className="font-mono text-[10px] bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA] px-2 py-0.5 rounded font-bold">
                {flaggedTransactions.length} ALERTS
              </span>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {flaggedTransactions.map((ft) => (
                <div
                  key={ft.transactionId}
                  onClick={() => onSelectTxn(ft)}
                  className={`p-3 rounded-xl border cursor-pointer text-xs font-mono transition-all ${
                    targetTxn?.transactionId === ft.transactionId
                      ? 'bg-[#FEF2F2] border-[#B91C1C] shadow-subtle'
                      : 'bg-[#F5F3EF] hover:bg-white border-[#D9D6CF]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#171717]">{ft.transactionId}</span>
                    <span className="text-[#B91C1C] font-bold">Score: {ft.fraudScore}/100</span>
                  </div>
                  <div className="flex items-center justify-between text-[#73716B] text-[11px] mb-1.5">
                    <span>₹{ft.amount.toLocaleString()}</span>
                    <span>{ft.location}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {ft.fraudViolations.map((v, i) => (
                      <span
                        key={i}
                        className="text-[9px] px-1.5 py-0.2 rounded bg-white text-[#B91C1C] border border-[#FECACA] font-semibold"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              ))}

              {flaggedTransactions.length === 0 && (
                <div className="p-6 text-center text-xs text-[#85837E]">
                  No fraud anomalies detected yet. Click &quot;TRIGGER ₹2.45L FRAUD TEST&quot; above to simulate an attack.
                </div>
              )}
            </div>
          </div>

          {/* Amazon SNS SecOps Notification Bus */}
          <div className="bg-white border border-[#D9D6CF] rounded-2xl p-5 shadow-bento font-sans">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#D9D6CF]">
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-[#F45B2A]" />
                <h3 className="font-display font-bold text-sm text-[#171717]">
                  Amazon SNS SecOps Topic
                </h3>
              </div>
              <span className="font-mono text-[10px] bg-[#EDF7F0] text-[#236B43] border border-[#C6E7D2] px-2 py-0.5 rounded font-bold">
                BUS ACTIVE
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 bg-[#F5F3EF] border border-[#D9D6CF] rounded-lg">
                <div className="text-[10px] text-[#85837E]">TOPIC ARN</div>
                <div className="text-[#171717] font-bold truncate">
                  arn:aws:sns:ap-south-1:739201845201:CloudGuard-FraudAlerts
                </div>
              </div>

              <div className="p-2.5 bg-[#F5F3EF] border border-[#D9D6CF] rounded-lg">
                <div className="text-[10px] text-[#85837E]">ALARM POLICY</div>
                <div className="text-[#403E39]">
                  Lambda eval &gt; 65 &rarr; Publish SecOps alert &rarr; Block ledger commit
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-[#85837E]">
                <span>CloudWatch Alarm State:</span>
                <span className="font-bold text-[#236B43]">OK (MONITORING)</span>
              </div>
            </div>
          </div>

        </div>

      </section>

    </div>
  );
};
