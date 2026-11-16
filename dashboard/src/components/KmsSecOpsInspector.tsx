'use client';

import React, { useState } from 'react';
import {
  Lock,
  Key,
  ShieldCheck,
  FileText,
  Copy,
  Check,
  Activity,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { CloudTrailEvent, Transaction } from '../types/cloud';

interface KmsSecOpsInspectorProps {
  selectedTxn: Transaction | null;
  cloudTrailEvents: CloudTrailEvent[];
}

export const KmsSecOpsInspector: React.FC<KmsSecOpsInspectorProps> = ({
  selectedTxn,
  cloudTrailEvents
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [filterEvent, setFilterEvent] = useState<string>('ALL');

  const copyToClipboard = (text: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const filteredEvents = filterEvent === 'ALL'
    ? cloudTrailEvents
    : cloudTrailEvents.filter(e => e.eventName.toLowerCase().includes(filterEvent.toLowerCase()));

  return (
    <div className="bg-white/95 border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col h-full shadow-stripe-card font-sans">
      
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600 shadow-sm">
            <Key className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              SecOps: KMS Envelope Encryption & CloudTrail Auditor
            </h2>
            <p className="text-[11px] text-slate-400">
              Cryptographic tokenization & immutable governance log
            </p>
          </div>
        </div>
        <span className="text-[10px] bg-cyan-50 text-cyan-700 border border-cyan-200 px-2.5 py-0.5 rounded-full font-bold">
          PCI-DSS v4.0 Req 3.4
        </span>
      </div>

      {/* KMS Envelope Diff Viewer */}
      <div className="mb-3.5">
        <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-2 flex items-center justify-between">
          <span>Envelope Encryption Diff (Selected: <strong className="text-slate-800 font-mono">{selectedTxn?.transactionId || 'None'}</strong>)</span>
          <span className="text-emerald-700 font-mono text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            AES-256-GCM / KMS CMK
          </span>
        </div>

        {selectedTxn ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
            
            {/* Left: Raw Customer PII Input */}
            <div className="bg-rose-50/40 border border-rose-200/80 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2 text-[10px]">
                <span className="text-rose-700 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Plaintext Memory Payload (In-Transit TLS)
                </span>
                <span className="text-slate-400 font-mono">Port 3000 Ingestion</span>
              </div>
              <div className="space-y-1.5 text-[11px] font-sans">
                <div>
                  <span className="text-slate-400 font-medium">Card / PAN: </span>
                  <span className="text-slate-900 font-mono font-bold">{selectedTxn.kmsEnvelope.plaintextMasked}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Account: </span>
                  <span className="text-slate-800 font-mono">{selectedTxn.senderAccount}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Narration: </span>
                  <span className="text-slate-700">{selectedTxn.narration}</span>
                </div>
                <div className="pt-1.5 text-[10px] text-rose-700 font-medium flex items-center gap-1 border-t border-rose-100">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>Unencrypted storage on disk violates PCI-DSS & GDPR.</span>
                </div>
              </div>
            </div>

            {/* Right: KMS Ciphertext Blob Output */}
            <div className="bg-cyan-50/40 border border-cyan-200/90 rounded-xl p-3 relative">
              <div className="flex items-center justify-between mb-2 text-[10px]">
                <span className="text-cyan-800 font-bold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-cyan-600" />
                  KMS Encrypted at Rest (CiphertextBlob)
                </span>
                <button
                  onClick={() => copyToClipboard(selectedTxn.kmsEnvelope.ciphertextBlob)}
                  className="text-slate-500 hover:text-cyan-700 p-1 hover:bg-white rounded transition-colors"
                  title="Copy base64 CiphertextBlob"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div>
                  <span className="text-slate-400 font-medium">Key ARN: </span>
                  <span className="text-slate-700 font-mono text-[10px] truncate block" title={selectedTxn.kmsEnvelope.keyArn}>
                    ...{selectedTxn.kmsEnvelope.keyArn.slice(-28)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Algorithm: </span>
                  <span className="text-emerald-700 font-mono font-bold">
                    {selectedTxn.kmsEnvelope.algorithm} (SYMMETRIC_DEFAULT)
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">CiphertextBlob: </span>
                  <span className="text-cyan-900 break-all text-[10px] font-mono block bg-white/90 p-1.5 rounded-lg border border-cyan-200/80 shadow-stripe-subtle">
                    {selectedTxn.kmsEnvelope.ciphertextBlob}
                  </span>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-400">
            Select a transaction in the terminal to inspect cryptographic envelope details.
          </div>
        )}
      </div>

      {/* CloudTrail Live Audit Stream */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-2">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-slate-700 font-sans">AWS CloudTrail Immutable Event Stream</span>
          </div>

          <div className="flex items-center gap-1 text-[10px] font-mono">
            <span className="text-slate-400 mr-1">Filter:</span>
            {['ALL', 'kms', 'sqs', 'dynamodb'].map((f) => (
              <button
                key={f}
                onClick={() => setFilterEvent(f)}
                className={`px-2 py-0.5 rounded-md font-semibold transition-colors ${
                  filterEvent === f
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[160px] text-[11px] font-mono">
          {filteredEvents.map((evt) => (
            <div
              key={evt.eventId}
              className="p-2 bg-slate-50/70 hover:bg-white border border-slate-200/70 rounded-xl flex items-center justify-between gap-2 shadow-stripe-subtle transition-colors"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="text-indigo-700 font-bold w-28 truncate">{evt.eventName}</span>
                <span className="text-slate-600 truncate">{evt.principalArn.split('/').pop()}</span>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span className="text-slate-400 truncate hidden sm:inline">{evt.sourceIPAddress}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-slate-400 text-[10px]">{evt.eventTime.slice(11, 19)} UTC</span>
                <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded text-[10px] font-bold">
                  {evt.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
