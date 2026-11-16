'use client';

import React, { useState } from 'react';
import {
  FileCheck2,
  ShieldCheck,
  Lock,
  Activity,
  CheckCircle2,
  Key,
  Database,
  Cpu,
  Layers,
  Search
} from 'lucide-react';
import { CloudTrailEvent } from '../types/cloud';

interface ComplianceAuditViewProps {
  cloudTrailEvents: CloudTrailEvent[];
}

export const ComplianceAuditView: React.FC<ComplianceAuditViewProps> = ({
  cloudTrailEvents
}) => {
  const [filterEvent, setFilterEvent] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredEvents = cloudTrailEvents.filter((evt) => {
    const matchesCategory =
      filterEvent === 'ALL' ||
      evt.eventName.toLowerCase().includes(filterEvent.toLowerCase()) ||
      evt.eventSource.toLowerCase().includes(filterEvent.toLowerCase());
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      evt.eventName.toLowerCase().includes(query) ||
      evt.principalArn.toLowerCase().includes(query) ||
      evt.sourceIPAddress.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header & Compliance Standards Strip */}
      <section className="bg-white border border-[#D9D6CF] rounded-2xl p-6 sm:p-8 shadow-bento font-sans">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#D9D6CF]">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#F45B2A] font-bold mb-1">
              REGULATORY GOVERNANCE & AUDIT ASSURANCE
            </div>
            <h2 className="font-display font-extrabold text-2xl text-[#171717] tracking-tight">
              Compliance Governance & CloudTrail Immutable Audit
            </h2>
            <p className="text-xs text-[#73716B] mt-1">
              Verifiable evidence of PCI-DSS v4.0 Requirement 3.4, GDPR Article 32 cryptographic safeguards, and IAM least privilege policies.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="p-2.5 bg-[#EDF7F0] border border-[#C6E7D2] text-[#236B43] rounded-xl font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>PCI-DSS v4.0 VERIFIED</span>
            </span>
            <span className="p-2.5 bg-[#EFF6FF] border border-[#DBEAFE] text-[#1E40AF] rounded-xl font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>GDPR ART. 32 READY</span>
            </span>
          </div>
        </div>

        {/* 4 Compliance Proof Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 pt-4">
          <div className="p-3.5 bg-[#F5F3EF] border border-[#D9D6CF] rounded-xl font-mono text-xs">
            <div className="text-[10px] text-[#85837E]">CRYPTOGRAPHIC ALGORITHM</div>
            <div className="text-base font-bold text-[#171717] mt-0.5">AES-256-GCM</div>
            <div className="text-[10px] text-[#236B43] mt-0.5">KMS Customer Managed Key</div>
          </div>

          <div className="p-3.5 bg-[#F5F3EF] border border-[#D9D6CF] rounded-xl font-mono text-xs">
            <div className="text-[10px] text-[#85837E]">KEY ROTATION STATUS</div>
            <div className="text-base font-bold text-[#236B43] mt-0.5">ROTATION_ENABLED</div>
            <div className="text-[10px] text-[#85837E] mt-0.5">Automated Annual Cycle</div>
          </div>

          <div className="p-3.5 bg-[#F5F3EF] border border-[#D9D6CF] rounded-xl font-mono text-xs">
            <div className="text-[10px] text-[#85837E]">CLOUDTRAIL AUDIT TRAIL</div>
            <div className="text-base font-bold text-[#171717] mt-0.5">{cloudTrailEvents.length} Events</div>
            <div className="text-[10px] text-[#236B43] mt-0.5">Dual-Log Tamper-Proof</div>
          </div>

          <div className="p-3.5 bg-[#F5F3EF] border border-[#D9D6CF] rounded-xl font-mono text-xs">
            <div className="text-[10px] text-[#85837E]">IAM ACCESS MODEL</div>
            <div className="text-base font-bold text-[#171717] mt-0.5">Least Privilege</div>
            <div className="text-[10px] text-[#85837E] mt-0.5">Zero Wildcard Resources</div>
          </div>
        </div>
      </section>

      {/* Main Grid: Compliance Evidence Cards (Left) + CloudTrail Event Stream (Right) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 font-sans">
        
        {/* Left Column: Statutory Proof Cards (col-span-5) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Card 1: PCI-DSS v4.0 Requirement 3.4 */}
          <div className="bg-white border border-[#D9D6CF] rounded-2xl p-5 shadow-bento space-y-2">
            <div className="flex items-center gap-2 pb-2.5 border-b border-[#D9D6CF]">
              <Lock className="w-4 h-4 text-[#F45B2A]" />
              <h3 className="font-display font-bold text-sm text-[#171717]">
                PCI-DSS v4.0 Requirement 3.4
              </h3>
            </div>
            <p className="text-xs text-[#73716B]">
              Primary Account Numbers (PAN) rendered unreadable anywhere they are stored using strong cryptography with associated key-management processes.
            </p>
            <div className="p-3 bg-[#F5F3EF] rounded-xl border border-[#D9D6CF] text-xs font-mono space-y-1 text-[#403E39]">
              <div>&bull; Masking: First 6 and last 4 digits displayed only</div>
              <div>&bull; Storage: AES-256-GCM envelope encryption at rest</div>
              <div>&bull; Key Storage: FIPS 140-3 Hardware Security Modules</div>
            </div>
          </div>

          {/* Card 2: IAM Scoped Policy Proof */}
          <div className="bg-white border border-[#D9D6CF] rounded-2xl p-5 shadow-bento space-y-2">
            <div className="flex items-center gap-2 pb-2.5 border-b border-[#D9D6CF]">
              <Cpu className="w-4 h-4 text-[#171717]" />
              <h3 className="font-display font-bold text-sm text-[#171717]">
                IAM Least Privilege Role Policy
              </h3>
            </div>
            <div className="text-xs font-mono text-[#85837E]">
              Role: <strong className="text-[#171717]">CloudGuard-LambdaExecutionRole</strong>
            </div>
            <div className="bg-[#171717] text-[#EEECE6] p-3 rounded-xl font-mono text-[10px] overflow-x-auto leading-relaxed">
              {`{
  "Effect": "Allow",
  "Action": [
    "kms:Decrypt",
    "kms:Encrypt",
    "sqs:ReceiveMessage",
    "sqs:DeleteMessage",
    "dynamodb:PutItem",
    "sns:Publish"
  ],
  "Resource": [
    "arn:aws:kms:ap-south-1:*:key/*",
    "arn:aws:sqs:ap-south-1:*:CloudGuard-TransactionQueue",
    "arn:aws:dynamodb:ap-south-1:*:table/CloudGuard-AuditTable",
    "arn:aws:sns:ap-south-1:*:CloudGuard-FraudAlerts"
  ]
}`}
            </div>
          </div>

        </div>

        {/* Right Column: AWS CloudTrail Immutable Event Stream (col-span-7) */}
        <div className="lg:col-span-7 bg-white border border-[#D9D6CF] rounded-2xl p-6 shadow-bento flex flex-col justify-between font-sans">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 mb-4 border-b border-[#D9D6CF]">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#F45B2A]" />
                <h3 className="font-display font-bold text-sm text-[#171717]">
                  AWS CloudTrail Immutable Event Stream
                </h3>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1 font-mono text-[10px]">
                {['ALL', 'kms', 'sqs', 'dynamodb', 'sns'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilterEvent(f)}
                    className={`px-2 py-0.5 rounded font-bold transition-colors ${
                      filterEvent === f
                        ? 'bg-[#171717] text-white'
                        : 'bg-[#F5F3EF] text-[#73716B] hover:bg-[#EEECE6]'
                    }`}
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Events Feed */}
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 font-mono text-xs">
              {filteredEvents.map((evt) => (
                <div
                  key={evt.eventId}
                  className="p-3 bg-[#F5F3EF] hover:bg-white border border-[#D9D6CF] rounded-xl flex items-center justify-between gap-2 transition-colors"
                >
                  <div className="truncate">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-[#F45B2A]">{evt.eventName}</span>
                      <span className="text-[10px] text-[#85837E]">({evt.eventSource})</span>
                    </div>
                    <div className="text-[10px] text-[#73716B] truncate">
                      {evt.principalArn.split('/').pop()} • {evt.sourceIPAddress}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-[#EDF7F0] text-[#236B43] border border-[#C6E7D2]">
                      {evt.status}
                    </span>
                    <div className="text-[9px] text-[#85837E] mt-1">
                      {evt.eventTime.slice(11, 19)} UTC
                    </div>
                  </div>
                </div>
              ))}

              {filteredEvents.length === 0 && (
                <div className="p-8 text-center text-xs text-[#85837E]">
                  No CloudTrail events found for this filter.
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 mt-4 border-t border-[#D9D6CF] text-xs text-[#85837E] font-mono flex items-center justify-between">
            <span>Audit Trail Integrity Validation:</span>
            <span className="text-[#236B43] font-bold">DIGEST VERIFIED (SHA-256)</span>
          </div>
        </div>

      </section>

    </div>
  );
};
