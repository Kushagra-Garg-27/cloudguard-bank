'use client';

import React from 'react';
import {
  Activity,
  BellRing,
  Cpu,
  Inbox,
  Zap,
  Database,
  Table,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { CloudWatchMetrics } from '../types/cloud';

interface MonitoringAlertsViewProps {
  metrics: CloudWatchMetrics;
}

export const MonitoringAlertsView: React.FC<MonitoringAlertsViewProps> = ({ metrics }) => {
  const isCpuHigh = metrics.ec2CpuUtilization > 65;
  const isDlqTriggered = metrics.sqsDlqDepth > 0;
  const isQueueSurging = metrics.sqsQueueDepth > 10;

  return (
    <div className="space-y-6">
      
      {/* Header & Observability Context Strip */}
      <section className="bg-white border border-[#D9D6CF] rounded-2xl p-6 sm:p-8 shadow-bento font-sans">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#D9D6CF]">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#F45B2A] font-bold mb-1">
              FULL-STACK OBSERVABILITY & ALERTS
            </div>
            <h2 className="font-display font-extrabold text-2xl text-[#171717] tracking-tight">
              Amazon CloudWatch Telemetry & SNS Alert Center
            </h2>
            <p className="text-xs text-[#73716B] mt-1">
              Real-time monitoring across compute, queuing, serverless workers, and relational/NoSQL persistence tiers.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="p-2.5 bg-[#EDF7F0] border border-[#C6E7D2] text-[#236B43] rounded-xl font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>CLOUDWATCH AGENT NOMINAL</span>
            </span>
          </div>
        </div>

        {/* 6 CloudWatch Real-Time Telemetry Gauges */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 pt-4 font-mono">
          
          <div className="p-3.5 bg-[#F5F3EF] border border-[#D9D6CF] rounded-xl">
            <div className="text-[10px] text-[#85837E] flex items-center gap-1">
              <Cpu className="w-3 h-3 text-[#F45B2A]" />
              <span>EC2 CPU</span>
            </div>
            <div className="text-xl font-bold text-[#171717] mt-1">
              {metrics.ec2CpuUtilization.toFixed(1)}%
            </div>
            <div className="w-full bg-[#EEECE6] h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full ${isCpuHigh ? 'bg-[#B91C1C]' : 'bg-[#236B43]'}`}
                style={{ width: `${Math.min(100, metrics.ec2CpuUtilization)}%` }}
              />
            </div>
          </div>

          <div className="p-3.5 bg-[#F5F3EF] border border-[#D9D6CF] rounded-xl">
            <div className="text-[10px] text-[#85837E] flex items-center gap-1">
              <Inbox className="w-3 h-3 text-[#F45B2A]" />
              <span>SQS DEPTH</span>
            </div>
            <div className="text-xl font-bold text-[#171717] mt-1">
              {metrics.sqsQueueDepth} <span className="text-xs font-normal text-[#85837E]">msgs</span>
            </div>
            <div className="text-[10px] text-[#85837E] mt-1">
              DLQ: <strong className={metrics.sqsDlqDepth > 0 ? 'text-[#B91C1C]' : 'text-[#236B43]'}>{metrics.sqsDlqDepth}</strong> msgs
            </div>
          </div>

          <div className="p-3.5 bg-[#F5F3EF] border border-[#D9D6CF] rounded-xl">
            <div className="text-[10px] text-[#85837E] flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#F45B2A]" />
              <span>LAMBDA CALLS</span>
            </div>
            <div className="text-xl font-bold text-[#171717] mt-1">
              {metrics.lambdaInvocations}
            </div>
            <div className="text-[10px] text-[#85837E] mt-1">
              Duration: {metrics.lambdaDurationMs}ms
            </div>
          </div>

          <div className="p-3.5 bg-[#F5F3EF] border border-[#D9D6CF] rounded-xl">
            <div className="text-[10px] text-[#85837E] flex items-center gap-1">
              <Database className="w-3 h-3 text-[#236B43]" />
              <span>RDS IOPS</span>
            </div>
            <div className="text-xl font-bold text-[#171717] mt-1">
              {metrics.rdsIops}
            </div>
            <div className="text-[10px] text-[#85837E] mt-1">
              Connections: {metrics.activeConnections}
            </div>
          </div>

          <div className="p-3.5 bg-[#F5F3EF] border border-[#D9D6CF] rounded-xl">
            <div className="text-[10px] text-[#85837E] flex items-center gap-1">
              <Table className="w-3 h-3 text-[#1E40AF]" />
              <span>DYNAMODB WCU</span>
            </div>
            <div className="text-xl font-bold text-[#171717] mt-1">
              {metrics.dynamoWriteCapacity}
            </div>
            <div className="text-[10px] text-[#236B43] mt-1">
              Pay-Per-Request
            </div>
          </div>

          <div className="p-3.5 bg-[#F5F3EF] border border-[#D9D6CF] rounded-xl">
            <div className="text-[10px] text-[#85837E] flex items-center gap-1">
              <Activity className="w-3 h-3 text-[#171717]" />
              <span>MEAN LATENCY</span>
            </div>
            <div className="text-xl font-bold text-[#171717] mt-1">
              38ms
            </div>
            <div className="text-[10px] text-[#85837E] mt-1">
              p99: 54ms
            </div>
          </div>

        </div>
      </section>

      {/* CloudWatch Alarms & SNS Topic Subscriber Configuration */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 font-sans">
        
        {/* Left Column: Configured Alarms List (col-span-7) */}
        <div className="lg:col-span-7 bg-white border border-[#D9D6CF] rounded-2xl p-6 shadow-bento space-y-4">
          <div className="flex items-center justify-between pb-3.5 border-b border-[#D9D6CF]">
            <div className="flex items-center gap-2">
              <BellRing className="w-4 h-4 text-[#F45B2A]" />
              <h3 className="font-display font-bold text-sm text-[#171717]">
                Configured CloudWatch Alarms
              </h3>
            </div>
            <span className="font-mono text-[10px] bg-[#EEECE6] text-[#403E39] px-2 py-0.5 rounded font-bold">
              4 ALARMS EVALUATING
            </span>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            
            {/* Alarm 1: DLQ Visibility */}
            <div className="p-3.5 bg-[#F5F3EF] rounded-xl border border-[#D9D6CF] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#171717]">CloudGuard-DLQMessagesVisibleAlarm</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase border ${
                    isDlqTriggered
                      ? 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA] animate-pulse'
                      : 'bg-[#EDF7F0] text-[#236B43] border-[#C6E7D2]'
                  }`}>
                    {isDlqTriggered ? 'ALARM' : 'OK'}
                  </span>
                </div>
                <div className="text-[11px] text-[#85837E] mt-0.5">
                  Threshold: ApproximateNumberOfMessagesVisible &gt; 0 for 1 minute
                </div>
              </div>
              <span className="text-[10px] text-[#85837E] hidden sm:inline">&rarr; SNS Bus</span>
            </div>

            {/* Alarm 2: High CPU */}
            <div className="p-3.5 bg-[#F5F3EF] rounded-xl border border-[#D9D6CF] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#171717]">CloudGuard-HighCPUAlarm</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase border ${
                    isCpuHigh
                      ? 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA] animate-pulse'
                      : 'bg-[#EDF7F0] text-[#236B43] border-[#C6E7D2]'
                  }`}>
                    {isCpuHigh ? 'ALARM' : 'OK'}
                  </span>
                </div>
                <div className="text-[11px] text-[#85837E] mt-0.5">
                  Threshold: EC2 ASG CPUUtilization &gt; 70% for 2 consecutive periods
                </div>
              </div>
              <span className="text-[10px] text-[#85837E] hidden sm:inline">&rarr; ASG Scale Up</span>
            </div>

            {/* Alarm 3: Fraud Spike */}
            <div className="p-3.5 bg-[#F5F3EF] rounded-xl border border-[#D9D6CF] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#171717]">CloudGuard-FraudSpikeAlarm</span>
                  <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase bg-[#EDF7F0] text-[#236B43] border border-[#C6E7D2]">
                    OK
                  </span>
                </div>
                <div className="text-[11px] text-[#85837E] mt-0.5">
                  Threshold: Blocked Transactions &gt; 5 in 5 minutes
                </div>
              </div>
              <span className="text-[10px] text-[#85837E] hidden sm:inline">&rarr; SecOps OnCall</span>
            </div>

            {/* Alarm 4: RDS IOPS Limit */}
            <div className="p-3.5 bg-[#F5F3EF] rounded-xl border border-[#D9D6CF] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#171717]">CloudGuard-RdsIopsAlarm</span>
                  <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase bg-[#EDF7F0] text-[#236B43] border border-[#C6E7D2]">
                    OK
                  </span>
                </div>
                <div className="text-[11px] text-[#85837E] mt-0.5">
                  Threshold: ReadIOPS + WriteIOPS &gt; 1000 for 5 minutes
                </div>
              </div>
              <span className="text-[10px] text-[#85837E] hidden sm:inline">&rarr; Storage Scale</span>
            </div>

          </div>
        </div>

        {/* Right Column: Amazon SNS Notification Topic (col-span-5) */}
        <div className="lg:col-span-5 bg-white border border-[#D9D6CF] rounded-2xl p-6 shadow-bento space-y-4 font-sans">
          <div className="flex items-center justify-between pb-3.5 border-b border-[#D9D6CF]">
            <div className="flex items-center gap-2">
              <BellRing className="w-4 h-4 text-[#F45B2A]" />
              <h3 className="font-display font-bold text-sm text-[#171717]">
                Amazon SNS SecOps Topic
              </h3>
            </div>
            <span className="font-mono text-[10px] bg-[#EDF7F0] text-[#236B43] border border-[#C6E7D2] px-2 py-0.5 rounded font-bold">
              FANOUT ACTIVE
            </span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="p-3 bg-[#F5F3EF] rounded-xl border border-[#D9D6CF] space-y-1">
              <div className="text-[10px] text-[#85837E]">SNS TOPIC ARN</div>
              <div className="font-bold text-[#171717] truncate">
                arn:aws:sns:ap-south-1:739201845201:CloudGuard-FraudAlerts
              </div>
            </div>

            <div className="p-3 bg-[#F5F3EF] rounded-xl border border-[#D9D6CF] space-y-2">
              <div className="text-[10px] font-bold text-[#85837E] uppercase">
                Active Subscriber Endpoints:
              </div>
              <div className="space-y-1 text-[#403E39]">
                <div>&bull; SMS: +91 98*** ***** (SecOps Lead)</div>
                <div>&bull; Email: secops-alerts@cloudguard.internal</div>
                <div>&bull; Webhook: https://events.pagerduty.com/v2/enqueue</div>
              </div>
            </div>

            <div className="p-3 bg-[#F5F3EF] rounded-xl border border-[#D9D6CF] text-[#73716B] text-[11px]">
              KMS Server-Side Encryption enabled on topic payload. Unencrypted cross-region SNS fanout blocked by IAM policy.
            </div>
          </div>
        </div>

      </section>

    </div>
  );
};
