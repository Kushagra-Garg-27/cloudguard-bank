'use client';

import React, { useState } from 'react';
import {
  Server,
  Flame,
  Globe,
  RefreshCw,
  Layers,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { CloudWatchMetrics } from '../types/cloud';

interface EC2NodeState {
  id: string;
  az: string;
  ip: string;
  state: 'running' | 'terminated' | 'initializing';
  cpu: number;
}

interface InfrastructureViewProps {
  metrics: CloudWatchMetrics;
}

export const InfrastructureView: React.FC<InfrastructureViewProps> = ({ metrics }) => {
  // Chaos Engineering State with authentic EC2 node IDs
  const [nodes, setNodes] = useState<EC2NodeState[]>([
    { id: 'i-07343d1cee5fbcbb5', az: 'ap-south-1a', ip: '10.0.10.94', state: 'running', cpu: 32 },
    { id: 'i-0af744995af529e58', az: 'ap-south-1b', ip: '10.0.11.139', state: 'running', cpu: 28 },
  ]);
  const [alarmActive, setAlarmActive] = useState<boolean>(false);
  const [isHealing, setIsHealing] = useState<boolean>(false);
  const [s3ReplicationStatus, setS3ReplicationStatus] = useState<'IDLE' | 'REPLICATING' | 'SYNCED'>('SYNCED');

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

  return (
    <div className="space-y-6">
      
      {/* Header & Region Overview Strip */}
      <section className="bg-white border border-[#D9D6CF] rounded-2xl p-6 sm:p-8 shadow-bento font-sans">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#D9D6CF]">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#F45B2A] font-bold mb-1">
              CLOUD COMPUTING MULTI-AZ ARCHITECTURE
            </div>
            <h2 className="font-display font-extrabold text-2xl text-[#171717] tracking-tight">
              Multi-Region Resilience & Chaos Self-Healing
            </h2>
            <p className="text-xs text-[#73716B] mt-1">
              Primary production deployment in ap-south-1 (Mumbai) with automated EC2 Auto Scaling self-healing and S3 Cross-Region Replication to ap-southeast-1 (Singapore).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTerminateNode}
              disabled={isHealing}
              className="px-4 py-2.5 bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FECACA] hover:border-[#B91C1C] text-[#B91C1C] rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 shadow-subtle disabled:opacity-40"
            >
              <Flame className="w-4 h-4" />
              <span>TERMINATE_NODE [CHAOS]</span>
            </button>

            <button
              onClick={handleS3Failover}
              disabled={s3ReplicationStatus === 'REPLICATING'}
              className="px-4 py-2.5 bg-[#F5F3EF] hover:bg-white border border-[#D9D6CF] text-[#171717] rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 shadow-subtle"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#F45B2A] ${s3ReplicationStatus === 'REPLICATING' ? 'animate-spin' : ''}`} />
              <span>SIMULATE S3 CRR</span>
            </button>
          </div>
        </div>

        {/* 4 Region & Subnet Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 pt-4">
          <div className="p-3.5 bg-[#F5F3EF] border border-[#D9D6CF] rounded-xl font-mono">
            <div className="text-[10px] text-[#85837E]">PRIMARY REGION</div>
            <div className="text-xl font-bold text-[#171717] mt-0.5">ap-south-1</div>
            <div className="text-[10px] text-[#236B43] mt-0.5">Mumbai (Multi-AZ 1a / 1b)</div>
          </div>

          <div className="p-3.5 bg-[#F5F3EF] border border-[#D9D6CF] rounded-xl font-mono">
            <div className="text-[10px] text-[#85837E]">DISASTER RECOVERY</div>
            <div className="text-xl font-bold text-[#171717] mt-0.5">ap-southeast-1</div>
            <div className="text-[10px] text-[#85837E] mt-0.5">Singapore (S3 CRR Standby)</div>
          </div>

          <div className="p-3.5 bg-[#F5F3EF] border border-[#D9D6CF] rounded-xl font-mono">
            <div className="text-[10px] text-[#85837E]">ASG INSTANCE HEALTH</div>
            <div className="text-xl font-bold text-[#236B43] mt-0.5">
              {nodes.filter((n) => n.state === 'running').length} / {nodes.length} Running
            </div>
            <div className="text-[10px] text-[#85837E] mt-0.5">t3.micro Burstable</div>
          </div>

          <div className="p-3.5 bg-[#F5F3EF] border border-[#D9D6CF] rounded-xl font-mono">
            <div className="text-[10px] text-[#85837E]">VPC NETWORK CIDR</div>
            <div className="text-xl font-bold text-[#171717] mt-0.5">10.0.0.0/16</div>
            <div className="text-[10px] text-[#85837E] mt-0.5">6 Subnets (Public/App/Data)</div>
          </div>
        </div>
      </section>

      {/* Main Grid: EC2 Auto Scaling Nodes & Self-Healing Simulator */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 font-sans">
        
        {/* Left Column: EC2 Nodes & Self-Healing Lifecycle (col-span-7) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="bg-white border border-[#D9D6CF] rounded-2xl p-6 shadow-bento">
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#D9D6CF]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#171717] flex items-center justify-center text-white">
                  <Server className="w-4 h-4 text-[#F45B2A]" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-[#171717]">
                    EC2 Auto Scaling Group Fleet
                  </h3>
                  <p className="text-xs text-[#85837E]">
                    Target Group health checks polling /health every 15s
                  </p>
                </div>
              </div>

              <span className={`font-mono text-[10px] px-2.5 py-0.5 rounded font-bold uppercase border ${
                alarmActive
                  ? 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA] animate-pulse'
                  : 'bg-[#EDF7F0] text-[#236B43] border-[#C6E7D2]'
              }`}>
                {alarmActive ? 'ALARM: EC2_UNHEALTHY' : 'ASG_NOMINAL (2/2)'}
              </span>
            </div>

            {/* Live Nodes List */}
            <div className="space-y-2.5 mb-4">
              {nodes.map((node) => (
                <div
                  key={node.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-mono transition-all ${
                    node.state === 'running'
                      ? 'bg-[#F5F3EF] border-[#D9D6CF]'
                      : node.state === 'initializing'
                      ? 'bg-[#FEF3C7] border-[#FDE68A]'
                      : 'bg-[#FEF2F2] border-[#FECACA]'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#171717]">{node.id}</span>
                      <span className="text-[10px] text-[#85837E]">({node.az})</span>
                    </div>
                    <div className="text-[11px] text-[#85837E] mt-0.5">
                      IP: {node.ip} • Subnet: Private App
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase border ${
                        node.state === 'running'
                          ? 'text-[#236B43] bg-white border-[#C6E7D2]'
                          : node.state === 'initializing'
                          ? 'text-[#92400E] bg-white border-[#FDE68A] animate-pulse'
                          : 'text-[#B91C1C] bg-white border-[#FECACA]'
                      }`}
                    >
                      {node.state}
                    </span>
                    <span className="text-[#171717] font-bold text-xs">{node.cpu}% CPU</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Self-Healing Explanation Box */}
            <div className="p-3.5 bg-[#F5F3EF] border border-[#D9D6CF] rounded-xl text-xs space-y-1.5 font-mono text-[#403E39]">
              <div className="text-[10px] font-bold uppercase text-[#85837E]">
                CloudWatch Alarms & Auto Scaling Policy:
              </div>
              <div>&bull; Metric: StatusCheckFailed_Instance &ge; 1 for 1 data point</div>
              <div>&bull; Action: Terminate unhealthily responding instance</div>
              <div>&bull; Auto Healing: ASG Launch Template provisions fresh AMI node within 4.5s</div>
            </div>
          </div>

        </div>

        {/* Right Column: S3 Cross-Region Replication & VPC Multi-AZ (col-span-5) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* S3 CRR Card */}
          <div className="bg-white border border-[#D9D6CF] rounded-2xl p-5 shadow-bento font-sans">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#D9D6CF]">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#F45B2A]" />
                <h3 className="font-display font-bold text-sm text-[#171717]">
                  S3 Cross-Region Replication (CRR)
                </h3>
              </div>
              <span className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold border ${
                s3ReplicationStatus === 'REPLICATING'
                  ? 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A] animate-pulse'
                  : 'bg-[#EDF7F0] text-[#236B43] border-[#C6E7D2]'
              }`}>
                {s3ReplicationStatus === 'REPLICATING' ? 'SYNCING_OBJECTS' : 'REPLICATED_SYNCED'}
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 bg-[#F5F3EF] border border-[#D9D6CF] rounded-lg">
                <div className="text-[10px] text-[#85837E]">SOURCE BUCKET (MUMBAI)</div>
                <div className="font-bold text-[#171717] truncate">
                  cloudguard-receipts-ap-south-1
                </div>
              </div>

              <div className="p-2.5 bg-[#F5F3EF] border border-[#D9D6CF] rounded-lg">
                <div className="text-[10px] text-[#85837E]">DESTINATION BUCKET (SINGAPORE)</div>
                <div className="font-bold text-[#403E39] truncate">
                  cloudguard-dr-replica-ap-southeast-1
                </div>
              </div>

              <div className="p-2.5 bg-[#F5F3EF] border border-[#D9D6CF] rounded-lg text-[11px] space-y-1 text-[#403E39]">
                <div>&bull; Versioning Configuration: Status=Enabled</div>
                <div>&bull; Encryption: AWS KMS Customer Managed Key</div>
                <div>&bull; Replication Rule: Status=Enabled, Priority=1</div>
              </div>
            </div>
          </div>

          {/* VPC Multi-AZ Topology Overview Card */}
          <div className="bg-white border border-[#D9D6CF] rounded-2xl p-5 shadow-bento font-sans">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#D9D6CF]">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#171717]" />
                <h3 className="font-display font-bold text-sm text-[#171717]">
                  Multi-AZ Subnet Partitioning
                </h3>
              </div>
              <span className="font-mono text-[10px] bg-[#EEECE6] text-[#403E39] px-2 py-0.5 rounded font-bold">
                10.0.0.0/16
              </span>
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between p-2 bg-[#F5F3EF] rounded-lg border border-[#D9D6CF]">
                <span className="text-[#85837E]">Public Ingress (ALB):</span>
                <span className="font-bold text-[#171717]">10.0.1.0/24 &bull; 10.0.2.0/24</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-[#F5F3EF] rounded-lg border border-[#D9D6CF]">
                <span className="text-[#85837E]">Private App (EC2 ASG):</span>
                <span className="font-bold text-[#171717]">10.0.10.0/24 &bull; 10.0.11.0/24</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-[#F5F3EF] rounded-lg border border-[#D9D6CF]">
                <span className="text-[#85837E]">Private Data (RDS ACID):</span>
                <span className="font-bold text-[#171717]">10.0.20.0/24 &bull; 10.0.21.0/24</span>
              </div>
            </div>
          </div>

        </div>

      </section>

    </div>
  );
};
